import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy for Sarvam translate.
export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY || process.env.NEXT_PUBLIC_SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 });
  }

  const payload = await req.json();

  const upstream = await fetch('https://api.sarvam.ai/translate', {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  });
}
