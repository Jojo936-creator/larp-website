import { parse } from 'cookie';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Set-Cookie', serialize('session', '', { httpOnly: true, path: '/', maxAge: 0 }));
  res.status(200).json({ success: true });
}
