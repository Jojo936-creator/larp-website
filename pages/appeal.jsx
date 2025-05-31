import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AppealPage() {
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState('');
  const [appeal, setAppeal] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/appeal` : '';

  const loginWithDiscord = () => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify`;
    window.location.href = url;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const token = new URLSearchParams(hash.slice(1)).get('access_token');
      fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const res = await fetch('/api/submit-appeal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          id: user.id,
          username: `${user.username}#${user.discriminator}`,
        },
        reason,
        appealText: appeal,
      }),
    });

    if (res.ok) {
      alert('Appeal submitted successfully.');
      setReason('');
      setAppeal('');
    } else {
      alert('There was a problem submitting your appeal.');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', background: '#2f3136', color: 'white', minHeight: '100vh' }}>
      <h1>Ban Appeal</h1>

      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
          <p><strong>Logged in as:</strong> {user.username}#{user.discriminator}</p>

          <label>Reason for ban:</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} required style={{ width: '100%', marginBottom: 10 }} />

          <label>Why should we unban you?</label>
          <textarea value={appeal} onChange={e => setAppeal(e.target.value)} required style={{ width: '100%', marginBottom: 10 }} />

          <button type="submit" style={{ backgroundColor: '#7289da', color: 'white', padding: 10, border: 'none', borderRadius: 5 }}>
            Submit Appeal
          </button>
        </form>
      ) : (
        <button
          onClick={loginWithDiscord}
          style={{ backgroundColor: '#5865F2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5 }}
        >
          Login with Discord
        </button>
      )}
    </div>
  );
}

