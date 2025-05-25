import { useEffect, useState } from 'react';
import axios from 'axios';
import Topbar from '../components/Topbar'; // Adjust path if needed

export default function AnnouncementsPage({ user, channel }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);
  const [popup, setPopup] = useState(null);
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 15000);
    return () => clearInterval(interval);
  }, [channel]);

  // Permission logic
  const canPost =
    user?.level === 'superowner' ||
    (channel === 'ownership' && user?.level === 'superowner') ||
    (channel === 'admin' && ['owner', 'superowner'].includes(user?.level)) ||
    (channel === 'staff' && ['owner', 'superowner'].includes(user?.level));

  const canDelete = canPost;

  // Post a new announcement
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
      setPopup({
        title: res.data.announcement.title,
        author: res.data.announcement.author,
      });
      setTimeout(() => setPopup(null), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post announcement.');
    }
    setPosting(false);
  };

  // Delete an announcement
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    setDeletingId(id);
    setError('');
    try {
      await axios.delete('/api/announcements', { data: { id } });
      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete announcement.');
    }
    setDeletingId(null);
  };

  return (
    <>
      {/* Topbar with user info */}
      <Topbar user={user} />

      {/* Main content */}
      <div
        style={{
          maxWidth: 900,
          margin: '48px auto',
          padding: 32,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        <h1>{channel.charAt(0).toUpperCase() + channel.slice(1)} Announcements</h1>
        <p>Announcements reserved for authorized users of the {channel} channel.</p>
        <p>
          User: {user?.username} (level: {user?.level})
        </p>

        {canPost && (
          <div style={{ marginTop: 32, marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Announcement title"
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
              placeholder="Detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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

        <div style={{ marginTop: 32 }}>
          {loading ? (
            <p>Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p style={{ color: '#888' }}>No announcements available.</p>
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
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => setModal(a)}
              >
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  {new Date(a.createdAt).toLocaleString()}
                </div>

                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                    disabled={deletingId === a.id}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: '#e53935',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 12px',
                      fontSize: 13,
                      cursor: deletingId === a.id ? 'not-allowed' : 'pointer',
                      opacity: deletingId === a.id ? 0.6 : 1,
                    }}
                  >
                    {deletingId === a.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Popup after posting */}
        {popup && (
          <div
            style={{
              position: 'fixed',
              top: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#222',
              color: '#fff',
              borderRadius: 10,
              padding: '18px 32px',
              fontSize: 18,
              fontWeight: 600,
              zIndex: 10000,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              userSelect: 'none',
            }}
          >
            {popup.title}
            <br />
            <span style={{ fontSize: 14, color: '#bbb' }}>Author: {popup.author}</span>
          </div>
        )}

        {/* Announcement modal */}
        {modal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.25)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setModal(null)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '32px 32px 24px 32px',
                minWidth: 340,
                maxWidth: 500,
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>{modal.title}</div>
              <div style={{ fontSize: 16, marginBottom: 18 }}>{modal.description}</div>
              <div style={{ fontSize: 14, color: '#888' }}>
                Author: {modal.author} (Level: {modal.level})
              </div>
              <div style={{ fontSize: 14, color: '#888' }}>
                Created At: {new Date(modal.createdAt).toLocaleString()}
              </div>
              <button
                onClick={() => setModal(null)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: '#eee',
                  border: 'none',
                  borderRadius: 6,
                  padding: '2px 10px',
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
