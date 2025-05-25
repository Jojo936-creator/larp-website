import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Fetch all users
        const { data, error } = await supabaseAdmin.from('users').select('id, username, level');
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Failed to fetch users' });
        }
        return res.status(200).json(data);

      case 'POST':
        // Create a new user
        const { username, password, level } = req.body;
        if (!username || !password || !level) {
          return res.status(400).json({ error: 'Missing fields' });
        }

        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

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
        return res.status(201).json(insertedUser);

      case 'PUT':
        // Update user info
        const { id, newPassword, newLevel } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Missing user id' });
        }

        const updateData = {};
        if (newPassword) updateData.password = newPassword;
        if (newLevel) updateData.level = newLevel;

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
        return res.status(200).json(updatedUser);

      case 'DELETE':
        // Delete user by id
        const { userId } = req.body;
        if (!userId) {
          return res.status(400).json({ error: 'Missing user id' });
        }

        const { error: deleteError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userId);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          return res.status(500).json({ error: deleteError.message });
        }
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(Method ${method} Not Allowed);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


