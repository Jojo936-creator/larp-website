import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  // Solo metodi GET, POST, PUT, DELETE supportati
  const { method } = req;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
}

