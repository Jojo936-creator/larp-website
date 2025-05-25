import { useEffect, useState } from 'react';
import axios from 'axios';
import { requireAuth } from '../lib/auth';
import Topbar from '../components/Topbar';
import { parse } from 'cookie';
import { getCredentials } from '../lib/credentials';

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function saveAnnouncement({ title, description, channel }) {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, channel }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(`Errore: ${data.error}\nDettagli: ${data.details || 'Nessun dettaglio'}`);
      setSuccess('');
      return null;
    }

    setError('');
    setSuccess('Annuncio salvato con successo!');
    return data.announcement;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveAnnouncement({ title, description, channel });

    setTitle('');
    setDescription('');
    setChannel('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>Nuovo Annuncio</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Titolo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <textarea
            placeholder="Descrizione"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', minHeight: 100 }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Seleziona canale</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Salva Annuncio
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: '1rem',
            color: 'red',
            whiteSpace: 'pre-wrap',
            backgroundColor: '#fee',
            padding: '0.5rem',
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop: '1rem',
            color: 'green',
            backgroundColor: '#efe',
            padding: '0.5rem',
            borderRadius: 4,
          }}
        >
          {success}
        </div>
      )}
    </div>
  );
}

