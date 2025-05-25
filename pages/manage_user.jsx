import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { useRouter } from 'next/router';
import { requireAuth } from '../lib/auth';

export default function ManageUser({ user }) {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    level: 'staff',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error('Failed to create user');
      setNewUser({ username: '', password: '', level: 'staff' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdateUser(id, field, value) {
    const updated = users.find((u) => u.id === id);
    if (!updated) return;
    const updatedUser = { ...updated, [field]: value };
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      if (!res.ok) throw new Error('Failed to update user');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <Topbar user={user} />
      <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
        <h1>Manage Users (Superowner only)</h1>

        <form onSubmit={handleCreateUser} style={{ marginBottom: 40 }}>
          <h3>Create New User</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Username"
              required
              style={{ padding: 8, fontSize: 15 }}
            />
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Password"
              required
              style={{ padding: 8, fontSize: 15 }}
            />
            <select
              value={newUser.level}
              onChange={(e) => setNewUser({ ...newUser, level: e.target.value })}
              style={{ padding: 8, fontSize: 15 }}
            >
              <option value="staff">staff</option>
              <option value="owner">owner</option>
              <option value="superowner">superowner</option>
            </select>
            <button
              type="submit"
              style={{
                background: '#1a73e8',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Add
            </button>
          </div>
        </form>

        {loading && <p>Loading users...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && users.length === 0 && <p>No users found.</p>}

        {!loading && users.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Username</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Password</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Level</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: 8 }}>
                    <input
                      value={u.username}
                      onChange={(e) => handleUpdateUser(u.id, 'username', e.target.value)}
                      style={{ width: '100%', padding: 4 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={u.password}
                      onChange={(e) => handleUpdateUser(u.id, 'password', e.target.value)}
                      style={{ width: '100%', padding: 4 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={u.level}
                      onChange={(e) => handleUpdateUser(u.id, 'level', e.target.value)}
                      style={{ padding: 4 }}
                    >
                      <option value="staff">staff</option>
                      <option value="owner">owner</option>
                      <option value="superowner">superowner</option>
                    </select>
                  </td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      style={{
                        backgroundColor: '#e53935',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 4,
                        cursor: 'pointer',
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
      </main>
    </>
  );
}

// Server-side auth
export async function getServerSideProps(context) {
  return requireAuth('superowner')(context);
}


