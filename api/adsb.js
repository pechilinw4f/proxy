import fetch from 'node-fetch'; // obligatoire si Node < 18

export default async function handler(req, res) {
  const { lat, lon, radius } = req.query;

  if (!lat || !lon || !radius) {
    return res.status(400).json({ error: "Missing query parameters lat, lon, radius" });
  }

  try {
    const response = await fetch(`https://api.adsb.lol/v2/point/${lat}/${lon}/${radius}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: "ADSB API error" });
    }
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ADSB API" });
  }
}
