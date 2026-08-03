import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy for Sarvam speech-to-text so the API key never ships to the browser.
// Set SARVAM_API_KEY in .env.local (no NEXT_PUBLIC_ prefix).
export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY || process.env.NEXT_PUBLIC_SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 });
  }

  const formData = await req.formData();

  const upstream = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: { 'api-subscription-key': apiKey },
    body: formData,
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  });
}
