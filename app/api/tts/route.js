import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ─── ElevenLabs curated voice roster ─────────────────────────────────────────
// Chosen for their warmth, clarity, and reverence — ideal for scripture.
export const ELEVENLABS_VOICES = [
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel',  desc: 'Deep · Authoritative' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  desc: 'Warm · Clear' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',    desc: 'Strong · Calm' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  desc: 'Warm · Resonant' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold',  desc: 'Rich · Serene' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam',     desc: 'Raspy · Cinematic' },
];

// Simple in-memory cache for recently generated TTS audio.
const TTS_CACHE = new Map(); // cacheKey -> { buffer: Buffer, contentType, size, ts }
const MAX_CACHE_ENTRIES = 50;

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

export async function POST(request) {
  const apiKey = process.env.ELEVENLABS || process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'ElevenLabs API key not configured. Set ELEVENLABS or ELEVENLABS_API_KEY in your environment (do NOT expose it via NEXT_PUBLIC_*)',
      },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { text, voiceId = 'onwK4e9ZLuTAKqWW03F9', stability = 0.55, similarity_boost = 0.80, style = 0.20 } = body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required.' }, { status: 400 });
  }
  if (text.length > 2500) {
    return NextResponse.json({ error: 'text exceeds 2500 character limit.' }, { status: 400 });
  }

  try {
    const requestBody = JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_turbo_v2_5', // fastest + highest quality
      voice_settings: { stability, similarity_boost, style, use_speaker_boost: true },
    });

    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: requestBody,
      }
    );

    // Build cache key from voice + text hash
    const cacheKey = `${voiceId}::${hashText(text.trim())}`;

    // If cached, return cached buffer immediately
    if (TTS_CACHE.has(cacheKey)) {
      const entry = TTS_CACHE.get(cacheKey);
      // refresh LRU order by deleting and re-setting
      TTS_CACHE.delete(cacheKey);
      TTS_CACHE.set(cacheKey, entry);

      return new NextResponse(entry.buffer, {
        status: 200,
        headers: {
          'Content-Type': entry.contentType || 'audio/mpeg',
          'Content-Length': String(entry.size),
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    if (!elRes.ok) {
      const errText = await elRes.text();
      console.error('[TTS API] ElevenLabs error:', elRes.status, errText);
      return NextResponse.json(
        { error: `ElevenLabs returned ${elRes.status}` },
        { status: elRes.status }
      );
    }

    const contentType = elRes.headers.get('content-type') || 'audio/mpeg';

    // If the response body supports tee(), stream to client while caching a copy.
    if (elRes.body && typeof elRes.body.tee === 'function') {
      const [streamForClient, streamForCache] = elRes.body.tee();

      // Start background task to cache the stream copy
      (async () => {
        try {
          const buf = await new Response(streamForCache).arrayBuffer();
          const buffer = Buffer.from(buf);
          TTS_CACHE.set(cacheKey, { buffer, contentType, size: buffer.length, ts: Date.now() });
          // Evict oldest entries if over limit
          while (TTS_CACHE.size > MAX_CACHE_ENTRIES) {
            const firstKey = TTS_CACHE.keys().next().value;
            TTS_CACHE.delete(firstKey);
          }
        } catch (e) {
          console.error('[TTS API] cache store failed:', e);
        }
      })();

      return new NextResponse(streamForClient, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    // Fallback: buffer entire response, cache it, and return
    const arrayBuffer = await elRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    TTS_CACHE.set(cacheKey, { buffer, contentType, size: buffer.length, ts: Date.now() });
    while (TTS_CACHE.size > MAX_CACHE_ENTRIES) {
      const firstKey = TTS_CACHE.keys().next().value;
      TTS_CACHE.delete(firstKey);
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[TTS API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Expose voice list to client components
export async function GET() {
  return NextResponse.json({ voices: ELEVENLABS_VOICES });
}
