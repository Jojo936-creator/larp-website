import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { requireAuth } from '../lib/auth';

export default function ManageUsers({ user }) {
  const [form, setForm] = useState({ username: '', password: '', level: 'staff' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false); // per refresh lista utenti

  // Carica lista utenti dal server
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users/list');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }
    fetchUsers();
  }, [refreshFlag]);

  // Gestisci input form
  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Aggiungi nuovo utente
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' });
      } else {
        setMessage({ type: 'success', text: 'User added successfully!' });
        setForm({ username: '', password: '', level: 'staff' });
        setRefreshFlag(v => !v); // refresh lista utenti
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  }

  // Cancella utente
  async function handleDelete(username) {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to delete user' });
      } else {
        setMessage({ type: 'success', text: `User "${username}" deleted successfully!` });
        setRefreshFlag(v => !v);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  }

  // Potresti aggiungere modifica qui, ma per semplicità facciamo solo creazione + cancellazione

  return (
    <>
      <Topbar user={user} />
      <main style={{
        maxWidth: 600,
        margin: '40px auto',
        padding: 24,
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        background: '#fff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <h1 style={{ marginBottom: 24 }}>Manage Users</h1>

        {message && (
          <div style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 6,
            color: message.type === 'error' ? '#b00020' : '#006400',
            backgroundColor: message.type === 'error' ? '#fdd' : '#cfc',
            border: `1px solid ${message.type === 'error' ? '#b00020' : '#006400'}`,
          }}>
            {message.text}
          </div>
        )}

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 12 }}>Add New User</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              style={{
                width: '100%',
                padding: '8px 12px',
                marginBottom: 20,
                fontSize: 16,
                borderRadius: 6,
                border: '1px solid #ccc',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <label htmlFor="password" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '8px 12px',
                marginBottom: 20,
                fontSize: 16,
                borderRadius: 6,
                border: '1px solid #ccc',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <label htmlFor="level" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
              User Level
            </label>
            <select
              id="level"
              name="level"
              value={form.level}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                marginBottom: 30,
                fontSize: 16,
                borderRadius: 6,
                border: '1px solid #ccc',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="superowner">Superowner</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 18,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </section>

        <section>
          <h2 style={{ marginBottom: 12 }}>Active Users</h2>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ccc' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Level</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(({ username, level }) => (
                  <tr key={username} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{username}</td>
                    <td style={{ padding: '8px' }}>{level}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(username)}
                        disabled={loading}
                        style={{
                          backgroundColor: '#e53935',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 12px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}

// Proteggi la pagina solo a superowner
export async function getServerSideProps(ctx) {
  const authResult = await requireAuth('superowner')(ctx);
  if (!authResult.props) return authResult; // redirect non autorizzato
  return {
    props: { user: authResult.props.user },
  };
}


