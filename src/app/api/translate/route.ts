import { NextRequest, NextResponse } from "next/server";

const MAX_INPUT_LENGTH = 500;

// ─── POST /api/translate ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLocale } = body;

    // Validate
    if (!text || !targetLocale) {
      return NextResponse.json(
        { error: "Missing required fields: text, targetLocale." },
        { status: 400 }
      );
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const validLocales = ["en", "es", "fr"];
    if (!validLocales.includes(targetLocale)) {
      return NextResponse.json(
        { error: "Invalid targetLocale. Must be en, es, or fr." },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return NextResponse.json({
        translatedText: text,
        notice: "Translation service unavailable — returning original text.",
      });
    }

    const localeNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
    };

    const prompt = `You are a professional translator for the FIFA World Cup 2026 stadium companion app. Translate the following text accurately into ${localeNames[targetLocale]}. Maintain any technical terms, stadium terminology, or safety language precisely. Return ONLY the translated text with no additional explanation, quotes, or formatting.

Text to translate:
${text}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error("Gemini Translation API error:", geminiResponse.status);
      return NextResponse.json({
        translatedText: text,
        notice: "Translation service temporarily unavailable — returning original text.",
      });
    }

    const geminiData = await geminiResponse.json();
    const translatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedText) {
      return NextResponse.json({
        translatedText: text,
        notice: "Translation returned empty — returning original text.",
      });
    }

    return NextResponse.json({ translatedText });
  } catch {
    return NextResponse.json(
      { error: "Translation service failed." },
      { status: 500 }
    );
  }
}
