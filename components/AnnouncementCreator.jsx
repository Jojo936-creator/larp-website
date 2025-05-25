import { useEffect, useState } from 'react';
import axios from 'axios';
import Topbar from '../components/Topbar';

export default function AnnouncementCreator({ user, channel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [credentialsError, setCredentialsError] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/credentials')
      .then(res => {
        if (res.data.error) {
          setCredentialsError(res.data.error);
        } else {
          setCredentials(res.data);
        }
      })
      .catch(e => setCredentialsError(e.message));
  }, []);

  const handlePost = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('/api/announcements', {
        title,
        description,
        channel,
      });
      setTitle('');
      setDescription('');
      setSuccess('Announcement successfully saved!');
    } catch (e) {
      setError(e.response?.data?.error || 'Error occurred');
    }
    setLoading(false);
  };

  const canPost = ['owner', 'superowner'].includes(user?.level);

  return (
    <div>
      <Topbar user={user} />
      <div style={{
        maxWidth: 900,
        margin: '48px auto 0 auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        padding: '40px 32px 32px 32px',
        border: '1px solid #e0e0e0',
        position: 'relative'
      }}>
        <h1>New Announcement</h1>
        <p>This will be sent to the <strong>{channel}</strong> channel.</p>
        <p style={{ marginTop: 24, color: '#555' }}>User: {user.username} (level: {user.level})</p>

        {credentialsError && (
          <div style={{ color: '#c0392b', marginTop: 16 }}>
            Failed to load credentials: {credentialsError}
          </div>
        )}

        {canPost && (
          <div style={{ marginTop: 32 }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginBottom: 8
              }}
              placeholder="Title"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: 12,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginBottom: 8
              }}
              placeholder="Detailed description..."
            />
            <button
              onClick={handlePost}
              disabled={loading || !title.trim() || !description.trim()}
              style={{
                marginTop: 8,
                background: '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 28px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Save Announcement
            </button>
            {error && <div style={{ color: '#c0392b', marginTop: 8 }}>{error}</div>}
            {success && <div style={{ color: '#2e7d32', marginTop: 8 }}>{success}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
