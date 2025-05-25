import { supabase } from '../../lib/supabaseClient';
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
    // Recupera annunci filtrati per canale, se presente in query
    const { channel } = req.query;

    try {
      let query = supabase.from('announcements').select('*').order('createdAt', { ascending: false });

      if (channel) {
        query = query.eq('channel', channel);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch announcements', details: error.message });
      }

      return res.status(200).json({ announcements: data });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
  }

  if (req.method === 'POST') {
    const { title, description, channel } = req.body;

    if (!title || !description || !channel) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (
      (channel === 'ownership' && user.level !== 'superowner') ||
      (channel === 'admin' && !['owner', 'superowner'].includes(user.level)) ||
      (channel === 'staff' && !['owner', 'superowner'].includes(user.level))
    ) {
      return res.status(403).json({ error: 'No permission to post announcement' });
    }

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([
          {
            title,
            description,
            channel,
            author: user.username,
            level: user.level,
            createdAt: new Date().toISOString(),
          },
        ])
        .select();

      if (error) return res.status(500).json({ error: 'Failed to save announcement', details: error.message });
      if (!data || data.length === 0) return res.status(500).json({ error: 'No data returned from insert' });

      return res.status(201).json({ announcement: data[0] });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing announcement id' });
    if (!['owner', 'superowner'].includes(user.level)) {
      return res.status(403).json({ error: 'No permission to delete announcement' });
    }

    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) return res.status(500).json({ error: 'Failed to delete announcement', details: error.message });

      return res.status(200).json({ message: 'Announcement deleted' });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}




