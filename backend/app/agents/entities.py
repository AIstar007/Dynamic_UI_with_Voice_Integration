"""Entity extraction.

Deterministic NLU that pulls flight-search entities out of free text:
  * route (origin / destination as free text — resolved to IATA via MCP)
  * travel dates (absolute + relative expressions such as "next weekend")
  * passenger counts
  * cabin class

No airline data is embedded here; only natural-language and calendar parsing.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone


@dataclass
class ExtractedEntities:
    origin_text: str | None = None
    destination_text: str | None = None
    begin_date: str | None = None
    end_date: str | None = None
    adults: int | None = None
    children: int | None = None
    infants: int | None = None
    cabin: str | None = None
    fields: set[str] = field(default_factory=set)


_ROUTE_RE = re.compile(
    r"(?:from\s+)?(?P<origin>[a-z][a-z .'-]+?)\s+(?:to|->|-)\s+(?P<destination>[a-z][a-z .'-]+?)"
    r"(?=$|[,.]|\s+(?:on|next|this|tomorrow|today|for|with|in|departing|leaving)\b)",
    re.I,
)

# Non-city filler words that may be captured around a route phrase.
_FILLER = {
    "from", "to", "flight", "flights", "fly", "flying", "cheapest", "cheap",
    "show", "me", "book", "a", "an", "the", "please", "want", "i", "need",
    "travel", "trip", "going", "go", "get", "find", "search", "for", "of",
    "return", "one", "way", "ticket", "tickets",
}

_WORD_RE = re.compile(r"[A-Za-z][A-Za-z.'-]*")

_CABIN_RE = re.compile(r"\b(economy|premium(?:\s+economy)?|business|first)\b", re.I)

_ADULTS_RE = re.compile(r"(\d+)\s*(?:adult|adults|passenger|passengers|pax|people|persons?)", re.I)
_CHILDREN_RE = re.compile(r"(\d+)\s*(?:child|children|kid|kids)", re.I)
_INFANTS_RE = re.compile(r"(\d+)\s*(?:infant|infants|baby|babies)", re.I)

_ISO_DATE_RE = re.compile(r"\b(\d{4}-\d{2}-\d{2})\b")

_MONTHS = {
    m.lower(): i
    for i, m in enumerate(
        [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ],
        start=1,
    )
}
_MONTH_ABBR = {name[:3]: idx for name, idx in _MONTHS.items()}
_DAY_MONTH_RE = re.compile(r"\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\b", re.I)


def _fmt(d: date) -> str:
    return d.strftime("%Y-%m-%d")


def _next_weekend(today: date) -> tuple[str, str]:
    """Return (Saturday, Sunday) of the upcoming weekend."""

    days_until_saturday = (5 - today.weekday()) % 7
    if days_until_saturday == 0:
        days_until_saturday = 7
    saturday = today + timedelta(days=days_until_saturday)
    return _fmt(saturday), _fmt(saturday + timedelta(days=1))


def _this_weekend(today: date) -> tuple[str, str]:
    days_until_saturday = (5 - today.weekday()) % 7
    saturday = today + timedelta(days=days_until_saturday)
    return _fmt(saturday), _fmt(saturday + timedelta(days=1))


def _parse_dates(message: str, today: date) -> tuple[str | None, str | None]:
    lowered = message.lower()

    # Relative expressions.
    if "next weekend" in lowered:
        return _next_weekend(today)
    if "this weekend" in lowered:
        return _this_weekend(today)
    if "day after tomorrow" in lowered:
        return _fmt(today + timedelta(days=2)), None
    if "tomorrow" in lowered:
        return _fmt(today + timedelta(days=1)), None
    if "today" in lowered or "tonight" in lowered:
        return _fmt(today), None
    if "next week" in lowered:
        return _fmt(today + timedelta(days=7)), None

    # ISO dates (supports range "2026-01-01 to 2026-01-05").
    iso = _ISO_DATE_RE.findall(message)
    if len(iso) >= 2:
        return iso[0], iso[1]
    if len(iso) == 1:
        return iso[0], None

    # "12 March" style.
    dm = _DAY_MONTH_RE.search(message)
    if dm:
        day = int(dm.group(1))
        month_token = dm.group(2).lower()
        month = _MONTHS.get(month_token) or _MONTH_ABBR.get(month_token[:3])
        if month and 1 <= day <= 31:
            year = today.year if month >= today.month else today.year + 1
            try:
                return _fmt(date(year, month, day)), None
            except ValueError:
                return None, None

    return None, None


def _normalise_cabin(token: str) -> str:
    token = token.lower()
    if token.startswith("premium"):
        return "Premium"
    if token.startswith("business"):
        return "Business"
    if token.startswith("first"):
        return "Business"
    return "Economy"


def _clean_place(text: str, *, side: str) -> str | None:
    """Reduce a captured route fragment to the actual place name.

    Removes filler words and keeps up to two adjacent tokens (to allow
    multi-word cities such as "New Delhi" / "Abu Dhabi"). `side` selects the
    trailing tokens for origins and the leading tokens for destinations.
    """

    tokens = [t for t in _WORD_RE.findall(text) if t.lower() not in _FILLER]
    if not tokens:
        return None
    chosen = tokens[-2:] if side == "end" else tokens[:2]
    return " ".join(chosen)


def extract(message: str, *, today: date | None = None) -> ExtractedEntities:
    """Extract flight entities from a message."""

    today = today or datetime.now(timezone.utc).date()
    entities = ExtractedEntities()

    route = _ROUTE_RE.search(message)
    if route:
        origin = _clean_place(route.group("origin"), side="end")
        destination = _clean_place(route.group("destination"), side="start")
        if origin:
            entities.origin_text = origin
            entities.fields.add("origin_text")
        if destination:
            entities.destination_text = destination
            entities.fields.add("destination_text")

    begin, end = _parse_dates(message, today)
    if begin:
        entities.begin_date = begin
        entities.fields.add("begin_date")
    if end:
        entities.end_date = end
        entities.fields.add("end_date")

    if (m := _ADULTS_RE.search(message)):
        entities.adults = int(m.group(1))
        entities.fields.add("adults")
    if (m := _CHILDREN_RE.search(message)):
        entities.children = int(m.group(1))
        entities.fields.add("children")
    if (m := _INFANTS_RE.search(message)):
        entities.infants = int(m.group(1))
        entities.fields.add("infants")

    if (m := _CABIN_RE.search(message)):
        entities.cabin = _normalise_cabin(m.group(1))
        entities.fields.add("cabin")

    return entities
