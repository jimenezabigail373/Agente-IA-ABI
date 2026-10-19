exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  let prompt;
  try { prompt = JSON.parse(event.body).prompt; } catch { return { statusCode: 400, body: "Bad request" }; }
  if (!prompt || prompt.length > 8000) return { statusCode: 400, body: JSON.stringify({ error: "Código vacío o demasiado largo" }) };
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const d = await r.json();
  if (!r.ok) return { statusCode: 502, body: JSON.stringify({ error: (d.error && d.error.message) || "error" }) };
  const parts = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [];
  const text = parts.map(p => p.text || "").join("");
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) };
};
