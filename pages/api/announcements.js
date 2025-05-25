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

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'POST') {
    const { title, description, channel } = req.body;

    if (!title || !description || !channel) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Controllo permessi di pubblicazione per canale
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

      if (error) {
        return res.status(500).json({ error: 'Failed to save announcement', details: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(500).json({ error: 'No data returned from insert' });
      }

      // Ritorna il primo elemento inserito
      return res.status(201).json({ announcement: data[0] });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
  } 
  else if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing announcement id' });
    }

    // Solo owner e superowner possono eliminare
    if (!['owner', 'superowner'].includes(user.level)) {
      return res.status(403).json({ error: 'No permission to delete announcement' });
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete announcement', details: error.message });
      }

      return res.status(200).json({ message: 'Announcement deleted' });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
  } 
  else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



