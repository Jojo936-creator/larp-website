import { useState } from 'react';
import Topbar from '../components/Topbar';
import { requireAuth } from '../lib/auth';

export default function NewUser({ user }) {
  const [form, setForm] = useState({ username: '', password: '', level: 'staff' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

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
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  }

  return (
    <>
      <Topbar user={user} />
      <main style={{
        maxWidth: 480,
        margin: '40px auto',
        padding: 24,
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        background: '#fff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <h1 style={{ marginBottom: 24 }}>Add New User</h1>

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
      </main>
    </>
  );
}

// Proteggi la pagina con requireAuth solo superowner
export async function getServerSideProps(ctx) {
  const authResult = await requireAuth('superowner')(ctx);
  if (!authResult.props) return authResult; // redirect non autorizzato
  return {
    props: { user: authResult.props.user },
  };
}

