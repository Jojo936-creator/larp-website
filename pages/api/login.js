import { createClient } from '@supabase/supabase-js';
import { serialize } from 'cookie';
import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  // Query the "users" table for the user with the given username
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .limit(1)
    .single();

  if (error || !users) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Here you should verify the password securely
  // (hashing, etc. - this is a simple example with plain text for demo)
  if (users.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate 6-digit 2FA code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Send code to Discord webhook
  if (process.env.WEBHOOK_URL) {
    await axios.post(process.env.WEBHOOK_URL, {
      content: `2FA code for ${username} (${users.level}): **${code}**`,
    });
  }

  // Set temporary cookies for 2FA step
  res.setHeader('Set-Cookie', [
    serialize('pendingUser', JSON.stringify({ username, level: users.level }), {
      httpOnly: true,
      path: '/',
      maxAge: 300,
    }),
    serialize('pending2fa', code, { httpOnly: true, path: '/', maxAge: 300 }),
  ]);

  res.status(200).json({ require2fa: true, level: users.level });
}

