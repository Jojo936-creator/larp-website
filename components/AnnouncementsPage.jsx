import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnnouncementsPage({ user, channel }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);

  // Fetch announcements from API
  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/announcements?channel=${channel}`);
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setError('Failed to load announcements.');
      setAnnouncements([]);
    }
    setLoading(false);
  };

  // Load announcements on mount and poll every 15 seconds
  useEffect(() => {
    fetchAnnouncements();

    const interval = setInterval(() => {
      fetchAnnouncements();
    }, 15000);

    return () => clearInterval(interval);
  }, [channel]);

  // Permissions to post
  const canPost =
    user?.level === 'superowner' ||
    (channel === 'ownership' && user?.level === 'superowner') ||
    (channel === 'admin' && ['owner', 'superowner'].includes(user?.level)) ||
    (channel === 'staff' && ['owner', 'superowner'].includes(user?.level));

  // Handle posting a new announcement
  const handlePost = async () => {
    if (!title.trim() || !description.trim()) return;

    setPosting(true);
    setError('');
    try {
      const res = await axios.post('/api/announcements', {
        title,
        description,
        channel,
      });
      setAnnouncements([res.data.announcement, ...announcements]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post announcement.');
    }
    setPosting(false);
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '48px auto',
        padding: 32,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <h1>{channel.charAt(0).toUpperCase() + channel.slice(1)} Announcements</h1>
      <p>
        User: {user?.username} (level: {user?.level})
      </p>

      {canPost && (
        <div style={{ marginBottom: 32 }}>
          <input
            type="text"
            placeholder="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ccc',
              marginBottom: 8,
            }}
            disabled={posting}
          />
          <textarea
            placeholder="Detailed Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ccc',
            }}
            disabled={posting}
          />
          <button
            onClick={handlePost}
            disabled={posting || !title.trim() || !description.trim()}
            style={{
              marginTop: 8,
              background: '#1a73e8',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            {posting ? 'Posting...' : 'Publish Announcement'}
          </button>
          {error && <div style={{ color: '#c0392b', marginTop: 8 }}>{error}</div>}
        </div>
      )}

      <div>
        {loading ? (
          <p>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p>No announcements available.</p>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              style={{
                background: '#f7fafd',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                marginBottom: 18,
                padding: '14px 20px',
              }}
            >
              <h3 style={{ margin: 0 }}>{a.title}</h3>
              <small style={{ color: '#888' }}>{new Date(a.createdAt).toLocaleString()}</small>
              <p>{a.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
