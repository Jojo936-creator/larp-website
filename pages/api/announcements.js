import { getAnnouncements, saveAnnouncements } from '../../lib/announcements';
import { parse } from 'cookie';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  let user = null;
  if (cookies.session) {
    try {
      user = JSON.parse(cookies.session);
    } catch {}
  }
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    const announcements = await getAnnouncements();
    return res.status(200).json({ announcements });
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

    const newAnn = {
      title,
      description,
      channel,
      author: user.username,
      level: user.level,
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = await saveAnnouncements(newAnn);
      return res.status(201).json({ announcement: saved[0] });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save announcement' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (!['owner', 'superowner'].includes(user.level)) {
      return res.status(403).json({ error: 'No permission' });
    }
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: 'Failed to delete announcement' });
    }
  }

  res.status(405).end();
}

