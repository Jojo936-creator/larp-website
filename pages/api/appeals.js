import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { userId, username, appealText } = req.body;

    if (!userId || !username || !appealText) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // Insert appeal into Supabase table "appeals"
    const { error: dbError } = await supabase
      .from('appeals')
      .insert([{ user_id: userId, username, appeal_text: appealText }]);

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Send to Discord webhook
    const discordPayload = {
      content: `New appeal submitted by **${username}** (ID: ${userId}):\n${appealText}\n\n[Review appeal](https://larp-website.com/appeal-review)`,
    };

    const webhookRes = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!webhookRes.ok) {
      console.error('Discord webhook error:', await webhookRes.text());
      return res.status(500).json({ error: 'Failed to send Discord webhook' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
