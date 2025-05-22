import { getCredentials } from '../../lib/credentials';
import { serialize } from 'cookie';
import crypto from 'crypto';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;
  const creds = getCredentials();
  const user = creds.users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // Generate 6-digit 2FA code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Send code to Discord webhook
  const webhookUrl = creds.webhookUrl;
  if (webhookUrl) {
    await axios.post(webhookUrl, {
      content: `2FA code for ${user.username} (${user.level}): **${code}**`
    });
  }

  // Set a temporary cookie for 2FA step
  res.setHeader('Set-Cookie', [
    serialize('pendingUser', JSON.stringify({ username, level: user.level }), { httpOnly: true, path: '/', maxAge: 300 }),
    serialize('pending2fa', code, { httpOnly: true, path: '/', maxAge: 300 })
  ]);
  res.status(200).json({ require2fa: true, level: user.level });
}
