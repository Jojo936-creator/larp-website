import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { titolo, contenuto, ruolo, pagina } = req.body;

  if (!['Owner', 'Superowner'].includes(ruolo)) {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const { error } = await supabase
    .from('annunci')
    .insert([{ titolo, contenuto, ruolo, pagina }]);

  if (error) return res.status(500).json({ error });

  res.status(200).json({ message: 'Annuncio creato con successo' });
}
