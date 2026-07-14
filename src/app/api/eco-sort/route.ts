import { NextRequest, NextResponse } from "next/server";

const MAX_INPUT_LENGTH = 500;

/**
 * Heuristic fallback for waste classification when Gemini is unavailable.
 */
function heuristicClassify(item: string): { category: string; explanation: string } {
  const lower = item.toLowerCase();

  // Recycle patterns
  if (/aluminum|aluminium|can|soda can|tin|metal|plastic bottle|glass bottle|glass jar|cardboard|paper cup|newspaper|magazine/.test(lower)) {
    return {
      category: "Recycle",
      explanation: `"${item}" is classified as recyclable material. Rinse if soiled and place in the blue recycling bins located at every concourse exit.`,
    };
  }

  // Compost patterns
  if (/food|fruit|banana|apple|peel|wrapper.*biodegradable|napkin|paper plate|hot dog|burger|popcorn|organic|coffee grounds|tea bag|compostable/.test(lower)) {
    return {
      category: "Compost",
      explanation: `"${item}" is classified as compostable. Place in the green compost bins. FIFA 2026 zero-waste mandates encourage composting all food waste and certified compostable packaging.`,
    };
  }

  // Default to landfill
  return {
    category: "Landfill",
    explanation: `"${item}" does not match common recyclable or compostable materials. Place in the grey landfill bins. Consider checking with a volunteer if you're unsure — together we can reach our zero-waste target!`,
  };
}

// ─── POST /api/eco-sort ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item } = body;

    if (!item || typeof item !== "string") {
      return NextResponse.json(
        { error: "Missing required field: item (string)." },
        { status: 400 }
      );
    }

    if (item.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Item name exceeds maximum length of ${MAX_INPUT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      const fallback = heuristicClassify(item);
      return NextResponse.json(fallback);
    }

    const prompt = `You are the Eco-Sort Waste Classification Assistant for the FIFA World Cup 2026 zero-waste initiative.

A fan has submitted this item for classification: "${item}"

Based on FIFA 2026 zero-waste rules:
- COMPOST: All food waste, certified compostable packaging (PLA cups, biodegradable wrappers), coffee grounds, paper plates, napkins
- RECYCLE: Aluminum cans, PET/HDPE plastic bottles, glass bottles/jars, clean cardboard, paper cups (unlined)
- LANDFILL: Chip bags (metallized film), styrofoam, plastic utensils (non-compostable), mixed-material packaging, cigarette butts

Classify this item into exactly one category and provide a brief 1-2 sentence explanation.

Return ONLY valid JSON with this schema:
{
  "category": "Compost" | "Recycle" | "Landfill",
  "explanation": "..."
}

Return ONLY the JSON. No markdown fences.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error("Gemini Eco-Sort API error:", geminiResponse.status);
      return NextResponse.json(heuristicClassify(item));
    }

    const geminiData = await geminiResponse.json();
    const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(heuristicClassify(item));
    }

    try {
      const cleaned = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        category: parsed.category || "Landfill",
        explanation: parsed.explanation || "Classification details unavailable.",
      });
    } catch {
      return NextResponse.json(heuristicClassify(item));
    }
  } catch {
    return NextResponse.json(
      { error: "Eco-Sort service failed." },
      { status: 500 }
    );
  }
}
