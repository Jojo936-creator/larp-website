import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, description, role, page } = req.body;

  if (!['Owner', 'Superowner'].includes(role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { error } = await supabase
    .from('annunci')
    .insert([{ title, description, role, page }]);

  if (error) return res.status(500).json({ error });

  res.status(200).json({ message: 'Announcement Created' });
}
