import fetch from 'node-fetch';

// COMPTE = test1@mrotzis.com
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

export default async function handler(req, res) {
  // --- Autoriser CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Réponse aux requêtes préflight (CORS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant qui traduit une question utilisateur en requête Overpass QL.
Retourne uniquement du code Overpass QL valide, avec la directive [out:json][timeout:25]; 
Pas d'explications, pas de backticks.`,
          },
          { role: 'user', content: query },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(response.status).json({ error: data });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({ result: data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch OpenAI API' });
  }
}
