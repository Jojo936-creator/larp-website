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
    // ... gestione POST (crea annuncio) come già fatto
  } 
  else if (req.method === 'DELETE') {
    const { id } = req.body; // supponendo che l'id arrivi nel body della richiesta DELETE

    if (!id) {
      return res.status(400).json({ error: 'Missing announcement id' });
    }

    // Controlla permessi, ad esempio solo owner o superowner possono eliminare
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
    // Metodi non supportati
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



