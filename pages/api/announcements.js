import { getAnnouncements, saveAnnouncements } from '../../lib/announcements';
import { parse } from 'cookie';
import { getCredentials } from '../../lib/credentials';

export default function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  let user = null;
  if (cookies.session) {
    try {
      user = JSON.parse(cookies.session);
    } catch {}
  }
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    return res.status(200).json({ announcements: getAnnouncements() });
  }

  if (req.method === 'POST') {
    const { title, description, channel } = req.body;
    if (!title || !description || !channel) return res.status(400).json({ error: 'Missing fields' });
    if (
      (channel === 'owner' && user.level !== 'superowner') ||
      (channel === 'admin' && !['owner', 'superowner'].includes(user.level)) ||
      (channel === 'staff' && !['owner', 'superowner'].includes(user.level))
    ) {
      return res.status(403).json({ error: 'No permission' });
    }
    const announcements = getAnnouncements();
    const newAnn = {
      id: Date.now().toString(),
      title,
      description,
      channel,
      author: user.username,
      level: user.level,
      createdAt: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    saveAnnouncements(announcements);
    return res.status(201).json({ announcement: newAnn });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (!['owner', 'superowner'].includes(user.level)) {
      return res.status(403).json({ error: 'No permission' });
    }
    let announcements = getAnnouncements();
    announcements = announcements.filter(a => a.id !== id);
    saveAnnouncements(announcements);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
