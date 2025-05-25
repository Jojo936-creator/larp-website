import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Controllo livello superowner (esempio da header o da cookie: adatta a come gestisci auth)
  // Qui prendo user level da cookie "user" (assumendo che tu la salvi così)
  const { cookies } = req;
  let userLevel = null;
  if (cookies.user) {
    try {
      userLevel = JSON.parse(cookies.user).level;
    } catch {}
  }

  if (userLevel !== 'superowner') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { username, password, level } = req.body;

  if (!username || !password || !level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Inserisci nel DB
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password, level }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'User added successfully', user: data[0] });
}
