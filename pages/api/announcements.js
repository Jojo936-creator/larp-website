import { supabase } from '../../lib/supabaseClient';
import { parse } from 'cookie';

export default async function handler(req, res) {
  // Recupera utente dalla sessione (cookie)
  const cookies = parse(req.headers.cookie || '');
  let user = null;
  if (cookies.session) {
    try {
      user = JSON.parse(cookies.session);
    } catch {
      // Ignora errori parsing
    }
  }

  if (req.method === 'GET') {
    // Recupera annunci filtrando per canale
    const { channel } = req.query;
    if (!channel) {
      return res.status(400).json({ error: 'Channel query param required' });
    }

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('channel', channel)
        .order('createdAt', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ announcements: data });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
  }

  if (req.method === 'POST') {
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { title, description, channel } = req.body;

    if (!title || !description || !channel) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Controllo permessi (esempio)
    if (
      (channel === 'ownership' && user.level !== 'superowner') ||
      (channel === 'admin' && !['owner', 'superowner'].includes(user.level)) ||
      (channel === 'staff' && !['owner', 'superowner'].includes(user.level))
    ) {
      return res.status(403).json({ error: 'No permission' });
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

      if (error) {
        return res.status(500).json({ error: 'Failed to save announcement', details: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(500).json({ error: 'No data returned from insert' });
      }

      return res.status(201).json({ announcement: data[0] });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}


