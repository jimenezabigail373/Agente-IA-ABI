exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  let prompt;
  try { prompt = JSON.parse(event.body).prompt; } catch { return { statusCode: 400, body: "Bad request" }; }
  if (!prompt || prompt.length > 8000) return { statusCode: 400, body: "Código vacío o demasiado largo" };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
  });
  const d = await r.json();
  if (!r.ok) return { statusCode: 502, body: JSON.stringify({ error: (d.error && d.error.message) || "error" }) };
  const text = (d.content || []).map(b => b.text || "").join("");
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) };
};
