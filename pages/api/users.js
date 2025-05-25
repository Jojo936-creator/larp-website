import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabaseAdmin.from('users').select('id, username, password, level');
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Failed to fetch users' });
        }
        return res.status(200).json(data);
      }

      case 'POST': {
        const { username, password, level } = req.body;
        if (!username || !password || !level) {
          return res.status(400).json({ error: 'Missing fields' });
        }

        const { data: existingUser, error: existError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (existError && existError.code !== 'PGRST116') {
          return res.status(500).json({ error: existError.message });
        }
        if (existingUser) {
          return res.status(409).json({ error: 'User already exists' });
        }

        const { data: insertedUser, error: insertError } = await supabaseAdmin
          .from('users')
          .insert([{ username, password, level }]);

        if (insertError) {
          console.error('Insert error:', insertError);
          return res.status(500).json({ error: insertError.message });
        }
        return res.status(201).json(insertedUser[0]);
      }

      case 'PUT': {
        const { id, password, level } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Missing user id' });
        }

        const updateData = {};
        if (password) updateData.password = password;
        if (level) updateData.level = level;

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ error: 'No update data provided' });
        }

        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('id', id);

        if (updateError) {
          console.error('Update error:', updateError);
          return res.status(500).json({ error: updateError.message });
        }
        return res.status(200).json(updatedUser[0]);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Missing user id' });
        }

        const { error: deleteError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          return res.status(500).json({ error: deleteError.message });
        }
        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


