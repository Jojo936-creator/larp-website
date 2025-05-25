import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, description, level, channel } = req.body;

  if (!['Owner', 'Superowner'].includes(role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { error } = await supabase
    .from('Annpuncement')
    .insert([{ title, description, level, channel }]);

  if (error) return res.status(500).json({ error });

  res.status(200).json({ message: 'Announcement Created' });
}
