import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { agent_name, operator_name, email, framework, description, type } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate protocol_id
    const id = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    const protocol_id = `sigil_${id}`;

    await sql`
      INSERT INTO waitlist (protocol_id, agent_name, operator_name, email, framework, description, type)
      VALUES (${protocol_id}, ${agent_name || null}, ${operator_name || null}, ${email}, ${framework || null}, ${description || null}, ${type || 'quick'})
    `;

    return res.status(200).json({ 
      success: true, 
      protocol_id,
      message: 'Agent registered. We will notify you when the API goes live.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}
