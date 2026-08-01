from enum import Enum
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import (
    BaseSettings,
    JsonConfigSettingsSource,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)

# Absolute path to app/global/environment/appsettings.json (setting.py lives in app/config/).
_APP_DIR = Path(__file__).resolve().parents[1]
_JSON_PATH = _APP_DIR / "global" / "environment" / "appsettings.json"
_SECRETS_PATH = _APP_DIR / "global" / "secrets" / "secrets.json"


class Environment(str, Enum):
    DEVELOPMENT = "development"
    QA = "qa"
    UAT = "uat"
    STAGING = "staging"
    PREPROD = "preprod"
    PROD = "prod"

    @property
    def is_production(self) -> bool:
        return self in {Environment.PREPROD, Environment.PROD}


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        json_file=_JSON_PATH,
        json_file_encoding="utf-8",
        case_sensitive=False,
        populate_by_name=True,
        extra="ignore",
    )

    AZURE_AI_PROJECT_ENDPOINT: str
    AZURE_CLIENT_ID: str

    # Loaded from secrets.json (falls back to env var / secret store).
    AZURE_CLIENT_SECRET: str | None = None
    AZURE_TENANT_ID: str

    # JSON key is "azure_openai_chat_deployment_name", so map it via alias.
    AZURE_OPENAI_CHAT_DEPLOYMENT: str = Field(
        alias="azure_openai_chat_deployment_name"
    )

    # Secrets (from secrets.json).
    FOUNDRY_API_KEY: str | None = None
    PAYMENT_PAGE_USER_KEY: str | None = None
    GatewayKey: str | None = None

    APPLICATION_ENV: Environment = Environment.DEVELOPMENT

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        # Precedence (highest first): init args > env vars > secrets.json > appsettings.json.
        return (
            init_settings,
            env_settings,
            JsonConfigSettingsSource(settings_cls, json_file=_SECRETS_PATH),
            JsonConfigSettingsSource(settings_cls, json_file=_JSON_PATH),
            file_secret_settings,
        )


@lru_cache
def get_settings():
    return Settings()