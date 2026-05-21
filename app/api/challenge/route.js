export const runtime = 'edge';

// ─── Daily challenge pool ─────────────────────────────────────────────────────
// Each entry rotates by calendar date so every day brings a genuinely new prompt.
const CHALLENGES = [
  {
    challenge: 'Read Philippians 4:13 and pray for someone who needs strength today.',
    verseId: '2',
    baseParticipants: 1402,
  },
  {
    challenge: 'Meditate on John 3:16 for 2 minutes and write one thing you are grateful for.',
    verseId: '1',
    baseParticipants: 2187,
  },
  {
    challenge: 'Read Psalm 23:1 aloud and share a word of comfort with someone today.',
    verseId: '3',
    baseParticipants: 983,
  },
  {
    challenge: 'Reflect on Romans 5:8 and extend grace to someone who has wronged you.',
    verseId: '4',
    baseParticipants: 1654,
  },
  {
    challenge: 'Read 1 Corinthians 13:4 and practice one act of patient love today.',
    verseId: '5',
    baseParticipants: 1120,
  },
  {
    challenge: 'Meditate on Isaiah 40:31 and take a 5-minute walk trusting God to renew your strength.',
    verseId: '6',
    baseParticipants: 876,
  },
  {
    challenge: 'Read Joshua 1:9 and write down one fear you are choosing to release today.',
    verseId: '7',
    baseParticipants: 1341,
  },
  {
    challenge: 'Pray through Philippians 4:6 — list three anxieties and surrender each one.',
    verseId: '8',
    baseParticipants: 2034,
  },
  {
    challenge: 'Read Matthew 11:28 and spend 3 minutes in silent rest before God.',
    verseId: '9',
    baseParticipants: 1789,
  },
  {
    challenge: 'Choose a verse from the Strength feed and memorise the first sentence today.',
    verseId: '2',
    baseParticipants: 1055,
  },
  {
    challenge: 'Read a Comfort verse and send an encouraging message to a friend or family member.',
    verseId: '3',
    baseParticipants: 1467,
  },
  {
    challenge: 'Spend 5 minutes journaling about how God has shown love to you this week.',
    verseId: '1',
    baseParticipants: 2310,
  },
  {
    challenge: 'Read Isaiah 40:31 and go outside — breathe deeply and thank God for creation.',
    verseId: '6',
    baseParticipants: 798,
  },
  {
    challenge: 'Pray for a world leader or community in need using Romans 5:8 as your anchor.',
    verseId: '4',
    baseParticipants: 1623,
  },
];

// ─── Deterministic daily index ────────────────────────────────────────────────
// Uses the number of days since a fixed epoch so the same date always returns
// the same challenge, but it advances every midnight UTC.
function getDailyChallenge(dateStr) {
  // dateStr format: 'YYYY-MM-DD'
  const epoch = new Date('2025-01-01').getTime();
  const today = new Date(dateStr).getTime();
  const dayIndex = Math.floor((today - epoch) / 86_400_000);
  return CHALLENGES[((dayIndex % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];
}

// ─── Simulated participant growth ─────────────────────────────────────────────
// Adds a pseudo-random but stable daily increment so the count feels live
// without requiring a database write.
function getDailyParticipants(base, dateStr) {
  // Simple deterministic hash of the date string
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const dailyBoost = (hash % 300) + 50; // 50–349 extra per day
  return base + dailyBoost;
}

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const entry = getDailyChallenge(today);

  return Response.json({
    date: today,
    challenge: entry.challenge,
    verseId: entry.verseId,
    participants: getDailyParticipants(entry.baseParticipants, today),
  });
}
