import { getCredentials } from '../../lib/credentials';
import { serialize, parse } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code } = req.body;
  const cookies = parse(req.headers.cookie || '');
  if (!cookies.pendingUser || !cookies.pending2fa) return res.status(401).json({ error: 'No pending user or code' });
  let pending;
  try {
    pending = JSON.parse(cookies.pendingUser);
  } catch {
    return res.status(400).json({ error: 'Invalid cookie' });
  }
  const realCode = cookies.pending2fa;
  if (code !== realCode) return res.status(401).json({ error: 'Invalid 2FA code' });
  // Set session cookie and clear temp cookies
  res.setHeader('Set-Cookie', [
    serialize('session', JSON.stringify({ username: pending.username, level: pending.level }), { httpOnly: true, path: '/', maxAge: 60 * 60 }),
    serialize('pendingUser', '', { httpOnly: true, path: '/', maxAge: 0 }),
    serialize('pending2fa', '', { httpOnly: true, path: '/', maxAge: 0 })
  ]);
  res.status(200).json({ success: true });
}
