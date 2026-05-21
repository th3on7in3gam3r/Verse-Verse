import { NextResponse } from 'next/server';

// Local high-quality offline fallbacks for when GEMINI_API_KEY is not defined
const OFFLINE_FALLBACKS = [
  {
    keywords: ['anxi', 'worr', 'fear', 'scared', 'stress', 'pan'],
    theme: 'Anxiety & Peace',
    prayer: "Heavenly Father, we bring this anxious heart to You right now. In the midst of storm and uncertainty, quiet all racing thoughts. Remind them that You are holding their future, and that You stand as a shield around them. May Your deep, supernatural peace that exceeds all human understanding guard their mind and heart today.",
    verses: [
      { reference: "Philippians 4:6-7", text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." },
      { reference: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand." }
    ]
  },
  {
    keywords: ['sad', 'grie', 'sorr', 'pain', 'hurt', 'broke', 'cry', 'loss'],
    theme: 'Comfort & Healing',
    prayer: "Lord of all comfort, wrap Your arms of love around them in this season of sorrow. We pray for healing where there is brokenness and warmth where there is cold grief. Let them feel Your presence close beside them, catching every tear and promising that joy will rise again. Be their refuge and their strength.",
    verses: [
      { reference: "Psalm 34:18", text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit." },
      { reference: "Matthew 5:4", text: "Blessed are those who mourn, for they will be comforted." }
    ]
  },
  {
    keywords: ['lone', 'isol', 'alone', 'abando', 'reject', 'forgot'],
    theme: 'Love & Companion',
    prayer: "God, remind them that they are never truly alone. When the silence feels heavy and isolation creeps in, whisper to their spirit that You have carved their name on the palms of Your hands. You walk beside them through every valley and rest with them in every night. Surround them with Your perfect, constant love.",
    verses: [
      { reference: "Deuteronomy 31:6", text: "Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you." },
      { reference: "Hebrews 13:5", text: "Never will I leave you; never will I forsake you." }
    ]
  },
  {
    keywords: ['grat', 'than', 'bless', 'happ', 'joy', 'good', 'prais'],
    theme: 'Gratitude & Praise',
    prayer: "Father, we join them in this beautiful moment of gratitude. Thank You for the blessings, the light, and the joy filling their heart today. May this thankfulness be a sweet song, anchoring their soul in Your goodness. Keep their eyes open to notice Your hand at work in every small and grand detail of life.",
    verses: [
      { reference: "Psalm 107:1", text: "Give thanks to the Lord, for he is good; his love endures forever." },
      { reference: "1 Thessalonians 5:18", text: "Give thanks in all circumstances; for this is God’s will for you in Christ Jesus." }
    ]
  },
  {
    keywords: ['tire', 'wear', 'exha', 'burn', 'weak', 'strugg', 'heavy'],
    theme: 'Strength & Rest',
    prayer: "Lord, they are tired and running low on strength. We ask that You pull them close and offer Your divine, deep rest. Rejuvenate their spirit, clear away the exhaustion, and let them lean completely on Your infinite power. Renew their wings like eagles to run and not grow weary.",
    verses: [
      { reference: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
      { reference: "Isaiah 40:29", text: "He gives strength to the weary and increases the power of the weak." }
    ]
  },
  {
    keywords: ['guid', 'wisd', 'deci', 'path', 'dire', 'lost', 'confu', 'what'],
    theme: 'Guidance & Wisdom',
    prayer: "Father of light, they are seeking guidance for their next steps. Grant them clear spiritual vision and divine wisdom to know which path to take. Light up the road ahead, quiet any confusion, and let Your voice guide their choices. We trust that You are leading them beside still waters.",
    verses: [
      { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
      { reference: "James 1:5", text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you." }
    ]
  }
];

const DEFAULT_FALLBACK = {
  theme: 'Peace & Love',
  prayer: "May God's infinite grace and peace settle deep within Your soul today. Whatever you are walking through, remember that You are loved with an everlasting love and held by a hand that never fails. Take a deep breath and trust in His gentle leading today.",
  verses: [
    { reference: "Numbers 6:24-26", text: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you; the Lord turn his face toward you and give you peace." },
    { reference: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit." }
  ]
};

export async function POST(request) {
  let feeling = '';
  try {
    const body = await request.json();
    feeling = body.feeling || '';

    if (!feeling || feeling.trim().length === 0) {
      return NextResponse.json({ error: 'Please describe how you are feeling.' }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI;

    if (!API_KEY) {
      // Run the local keyword matcher for offline / unconfigured fallback
      const feelingLower = feeling.toLowerCase();
      const matched = OFFLINE_FALLBACKS.find(item => 
        item.keywords.some(keyword => feelingLower.includes(keyword))
      );

      const result = matched ? { prayer: matched.prayer, verses: matched.verses } : { prayer: DEFAULT_FALLBACK.prayer, verses: DEFAULT_FALLBACK.verses };
      
      // Artificial delay to make it feel natural and premium
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(result);
    }

    // Call the actual Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this user emotion or state: "${feeling}".
You are an empathetic, comforting spiritual guide and faith companion.
Provide a comforting personal prayer (3-4 sentences) and recommend 2-3 matching bible verses.
Your response must be in strict JSON format with the keys "prayer" (string) and "verses" (array of objects, where each object has keys "reference" and "text").
Do not output any markdown formatting like \`\`\`json or \`\`\`. Start and end with raw JSON.`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error details:', errText);
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error('No content returned from Gemini API');
    }

    const parsed = JSON.parse(textOutput.trim());
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('AI Prayer Generation Error:', error);
    // Graceful fallback to offline model in case of runtime errors
    const feelingLower = (feeling || '').toLowerCase();
    const matched = OFFLINE_FALLBACKS.find(item =>
      item.keywords.some(keyword => feelingLower.includes(keyword))
    );
    const result = matched
      ? { prayer: matched.prayer, verses: matched.verses }
      : { prayer: DEFAULT_FALLBACK.prayer, verses: DEFAULT_FALLBACK.verses };
    return NextResponse.json(result);
  }
}
