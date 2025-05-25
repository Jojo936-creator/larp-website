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
  const [announcements, setAnnouncements] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    // Load existing announcements for this channel
    axios.get(`/api/announcements?channel=${channel}`)
      .then(res => {
        setAnnouncements(res.data.announcements || []);
      })
      .catch(() => {
        setAnnouncements([]);
      });
  }, [channel]);

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
      setAnnouncements([res.data.announcement, ...announcements]);
    } catch (e) {
      setError(e.response?.data?.error || 'Error occurred');
    }
    setLoading(false);
  };

  const canPost = ['owner', 'superowner', 'admin'].includes(user?.level);

  return (
    <div>
      <Topbar user={user} />
      <div style={{
        maxWidth: 900,
        margin: '48px auto',
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

        {/* Announcement List */}
        <div style={{ marginTop: 40 }}>
          <h2>Announcements</h2>
          {announcements.length === 0 && (
            <p style={{ color: '#888' }}>No announcements available.</p>
          )}
          {announcements.map(a => (
            <div
              key={a.id}
              style={{
                background: '#f7fafd',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                marginBottom: 18,
                padding: '14px 20px',
                cursor: 'pointer'
              }}
              onClick={() => setModal(a)}
            >
              <div style={{ fontWeight: 600, fontSize: 16 }}>{a.title}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{new Date(a.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} onClick={() => setModal(null)}>
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '24px 32px',
                maxWidth: 500,
                width: '90%',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2>{modal.title}</h2>
              <p style={{ marginBottom: 8, color: '#666' }}>
                <strong>Author:</strong> {modal.author} ({modal.level})
              </p>
              <p>{modal.description}</p>
              <p style={{ fontSize: 12, color: '#999', marginTop: 16 }}>
                Posted on {new Date(modal.createdAt).toLocaleString()}
              </p>
              <button
                onClick={() => setModal(null)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: '#eee',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
