import { NextResponse } from 'next/server';

// ── Offline fallbacks (no API key) ────────────────────────────────────────────
const FALLBACKS = {
  hope: "Written by the prophet Isaiah in a time of national exile and despair, this verse was a lifeline to a people who felt abandoned by God. The Hebrew word for 'hope' here, 'qavah', literally means to twist or braid — like cords woven together for unbreakable strength. Today, whatever burden you are carrying, God is inviting you to braid your weakness with His infinite strength and rise.",
  peace: "These words were penned by the Apostle Paul from inside a Roman prison — a place of chains, darkness, and uncertainty. Yet his pen dripped with peace, not panic. The Greek word 'eirene' he uses isn't just the absence of conflict; it's a wholeness and flourishing that surpasses human logic. That same supernatural peace is available to you right now, in the middle of your storm.",
  love: "In the ancient world, love was transactional — a bargain between equals. But this verse shattered every expectation. The Greek word 'agape' used here describes a love that gives without requiring anything in return. God extended this love to humanity not when we were at our best, but at our most broken. Today, let that love be not just a doctrine you believe, but a reality you feel in your bones.",
  strength: "The image in this verse is of a soaring eagle — a creature that doesn't exhaust itself flapping against the wind, but spreads its wings and lets the thermal currents carry it upward. Ancient Israelites saw the eagle as God's symbol of effortless power. Today's invitation is not to try harder, but to stop striving and let God's updraft of grace lift you higher than you could ever climb alone.",
  default: "This passage has echoed through centuries of human struggle and triumph, offering the same faithful word to every generation that has read it. The original language carries a weight and beauty that no translation fully captures — it was written not as theology to debate, but as medicine for the weary soul. Receive it today not as information, but as a personal letter written specifically for where you are standing right now.",
};

function getFallback(verseText) {
  const lower = verseText.toLowerCase();
  if (lower.includes('hope') || lower.includes('wait') || lower.includes('trust')) return FALLBACKS.hope;
  if (lower.includes('peace') || lower.includes('anxiety') || lower.includes('worry')) return FALLBACKS.peace;
  if (lower.includes('love') || lower.includes('god so loved')) return FALLBACKS.love;
  if (lower.includes('strength') || lower.includes('strong') || lower.includes('eagle')) return FALLBACKS.strength;
  return FALLBACKS.default;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { reference, text } = body;
  if (!reference || !text) {
    return NextResponse.json({ error: 'reference and text are required.' }, { status: 400 });
  }

  const API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI;

  // ── Offline / unconfigured fallback ─────────────────────────────────────────
  if (!API_KEY) {
    await new Promise(r => setTimeout(r, 900));
    return NextResponse.json({ devotion: getFallback(text) });
  }

  // ── Gemini generation ────────────────────────────────────────────────────────
  const prompt = `You are a master theologian and gifted preacher writing a 30-second spoken devotion.
The verse is: "${reference}" — "${text}"

Write exactly 3 sentences (no more, no less) that:
1. Briefly describe the historical or cultural context in which this verse was written.
2. Unpack one powerful word or phrase from the original Hebrew or Greek.
3. Apply the verse's truth directly and personally to the listener's daily life today.

Rules:
- Write in second person ("you", "your"), warm and conversational, as if speaking face-to-face.
- No markdown, no headers, no bullet points. Output ONLY the 3 sentences as a single paragraph.
- Aim for vivid imagery and emotional resonance. This should feel like a whispered word of grace, not a lecture.
- Total length: 60–90 words.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 200 },
        }),
      }
    );

    if (!res.ok) {
      console.error('[Devotion] Gemini error:', res.status, await res.text());
      return NextResponse.json({ devotion: getFallback(text) });
    }

    const data = await res.json();
    const devotion = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!devotion) {
      return NextResponse.json({ devotion: getFallback(text) });
    }

    return NextResponse.json({ devotion });
  } catch (err) {
    console.error('[Devotion] Error:', err);
    return NextResponse.json({ devotion: getFallback(text) });
  }
}
