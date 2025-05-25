import { useEffect, useState } from 'react';
import axios from 'axios';
import Topbar from '../components/Topbar';
import { requireAuth } from '../lib/auth';

export default function AnnouncementsPage({ user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState('');
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
      setChannel('');
      setSuccess('Annuncio salvato con successo!');
    } catch (e) {
      setError(e.response?.data?.error || 'Errore');
    }
    setLoading(false);
  };

  const canPost = user?.level === 'owner' || user?.level === 'superowner' || user?.level === 'admin';

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
        <h1>Nuovo Annuncio</h1>
        <p>Crea un annuncio visibile ai canali selezionati.</p>
        <p style={{ marginTop: 24, color: '#555' }}>User: {user.username} (level: {user.level})</p>

        {credentialsError && (
          <div style={{ color: '#c0392b', marginTop: 16 }}>
            Errore nel caricamento credenziali: {credentialsError}
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
              placeholder="Titolo"
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
              placeholder="Descrizione dettagliata..."
            />
            <select
              value={channel}
              onChange={e => setChannel(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginBottom: 8
              }}
              required
            >
              <option value="">Seleziona canale</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            <button
              onClick={handlePost}
              disabled={loading || !title.trim() || !description.trim() || !channel}
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
              Salva Annuncio
            </button>
            {error && <div style={{ color: '#c0392b', marginTop: 8 }}>{error}</div>}
            {success && <div style={{ color: '#2e7d32', marginTop: 8 }}>{success}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  return requireAuth('staff')(context); // o 'admin' o 'owner' se necessario
}



