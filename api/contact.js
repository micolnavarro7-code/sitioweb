export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers for same-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const data = req.body;

    // Validate required fields
    if (!data.FirstName || !data.LastName || !data.Phone) {
      return res.status(400).json({ error: 'Missing required fields: FirstName, LastName, Phone' });
    }

    // Build FormData for AccuLynx
    const formBody = new URLSearchParams();
    formBody.append('FirstName', data.FirstName);
    formBody.append('LastName', data.LastName);
    formBody.append('Phone', data.Phone);
    if (data.Street) formBody.append('Street', data.Street);
    if (data.City) formBody.append('City', data.City);
    if (data.Zip) formBody.append('Zip', data.Zip);
    if (data.Message) formBody.append('Message', data.Message);

    // Proxy to AccuLynx from server — invisible to AdBlockers
    const acculynxResponse = await fetch(
      'https://leads.acculynx.com/api/leads/submit-new-lead?formID=ce2c1625-e455-4f98-ac12-0bc2391e1394',
      {
        method: 'POST',
        body: formBody,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const responseText = await acculynxResponse.text();

    return res.status(200).json({
      success: true,
      status: acculynxResponse.status,
      message: 'Lead submitted successfully',
    });
  } catch (error) {
    console.error('API /api/contact error:', error);
    return res.status(500).json({
      error: 'Failed to submit lead',
      details: error.message,
    });
  }
}
