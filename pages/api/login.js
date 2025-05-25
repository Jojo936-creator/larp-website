import { createClient } from '@supabase/supabase-js';
import { serialize } from 'cookie';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;

  // Query user dal DB
  const { data: user, error } = await supabase
    .from('users')
    .select('username, password, level')
    .eq('username', username)
    .single();

  if (error || !user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Genera 2FA
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Invia webhook (con url salvato in env o file di config)
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl) {
    await axios.post(webhookUrl, {
      content: `2FA code for ${user.username} (${user.level}): **${code}**`
    });
  }

  // Set cookie temporanei
  res.setHeader('Set-Cookie', [
    serialize('pendingUser', JSON.stringify({ username: user.username, level: user.level }), { httpOnly: true, path: '/', maxAge: 300 }),
    serialize('pending2fa', code, { httpOnly: true, path: '/', maxAge: 300 })
  ]);
  res.status(200).json({ require2fa: true, level: user.level });
}
