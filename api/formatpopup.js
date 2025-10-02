import fetch from 'node-fetch';
// import type { NextApiRequest, NextApiResponse } from 'next';

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// COMPTE = test1@mrotzis.com
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const DEFAULT_MODEL = 'gpt-4o-mini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userQuery, props, model } = req.body ?? {};

  if (!userQuery || typeof props === 'undefined') {
    return res.status(400).json({ error: 'Missing body parameters: userQuery and props are required' });
  }

  if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key in env');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant qui génère du HTML simple pour une popup de carte interactive.
Le style doit être court, clair, lisible.
Ne mets pas de backticks, uniquement du HTML.`,
          },
          {
            role: 'user',
            content: `Requête utilisateur: "${userQuery}".
Voici les données OSM (JSON):
${JSON.stringify(props, null, 2)}

Génère un contenu HTML concis pour la popup.`,
          },
        ],
        // tu peux ajuster temperature / max_tokens si besoin
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(response.status).json({ error: data });
    }

    const content = data?.choices?.[0]?.message?.content ?? '';

    // CORS (si tu veux restreindre l'origine, change '*')
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({ html: content });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Failed to fetch OpenAI API' });
  }
}
