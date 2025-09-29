// api/routeset.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // --- Autoriser CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Réponse aux requêtes préflight (CORS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;

    if (!body || !body.planes || !Array.isArray(body.planes)) {
      return res.status(400).json({ error: "Invalid body: expected { planes: [...] }" });
    }

    const response = await fetch("https://api.adsb.lol/api/0/routeset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("ADSB routeset API error:", text);
      return res.status(response.status).json({ error: "ADSB routeset API returned an error" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error (routeset):", err);
    return res.status(500).json({ error: "Failed to fetch ADSB routeset API" });
  }
}
