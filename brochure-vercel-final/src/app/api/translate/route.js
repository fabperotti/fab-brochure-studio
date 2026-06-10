import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { italianText, targetLang, langLabel, agencyNotes } = await request.json();

    if (!italianText || italianText.trim().length < 20) {
      return Response.json({ error: "Testo PDF troppo corto o vuoto." }, { status: 400 });
    }

    const systemPrompt = `You are a luxury real estate copywriter. Transform Italian property listings into compelling marketing copy in ${langLabel}.
- Write ONLY in ${langLabel}
- Aspirational, sensory, emotionally evocative tone
- Emphasize lifestyle, privacy, exclusivity, investment value
- Return ONLY valid JSON, no markdown, no backticks
- JSON: {"title":"...","tagline":"...","description":"...","features":["..."],"location":"...","price":"...","surface":"...","rooms":"..."}
${agencyNotes ? `Style notes: ${agencyNotes}` : ""}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: `Transform this Italian listing to ${langLabel}:\n\n${italianText.substring(0, 4000)}\n\nReturn ONLY the JSON object.` }],
      system: systemPrompt,
    });

    const raw = message.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    let propertyData;
    try {
      propertyData = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      propertyData = { title: "Exclusive Property", tagline: "", description: raw.substring(0, 600), features: [], location: "", price: "", surface: "", rooms: "" };
    }

    return Response.json({ propertyData });
  } catch (err) {
    return Response.json({ error: err.message || "Errore API" }, { status: 500 });
  }
}
