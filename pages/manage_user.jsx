import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { requireAuth } from '../lib/auth';
import axios from 'axios';

export default function ManageUser({ user }) {
  if (!user || user.level !== 'superowner') {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#c0392b' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('staff');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.users);
    } catch (e) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  }

  async function handleCreateUser() {
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/users', { username, password, level });
      setSuccess('User created successfully');
      setUsername('');
      setPassword('');
      setLevel('staff');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Error creating user');
    }
    setLoading(false);
  }

  async function handleDeleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete('/api/users', { data: { id } });
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.error || 'Error deleting user');
    }
    setLoading(false);
  }

  return (
    <>
      <Topbar user={user} />
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
        <h1>Manage Users</h1>
        <p>Only superowners can add, edit or delete users.</p>

        <div style={{ marginBottom: 24 }}>
          <h2>Add New User</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }}
            disabled={loading}
          />
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }}
            disabled={loading}
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }}
            disabled={loading}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="superowner">Superowner</option>
          </select>
          <button
            onClick={handleCreateUser}
            disabled={loading || !username.trim() || !password.trim()}
            style={{
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
            Add User
          </button>
          {error && <div style={{ color: '#c0392b', marginTop: 8 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
        </div>

        <div>
          <h2>Existing Users</h2>
          {loading && <p>Loading users...</p>}
          {!loading && users.length === 0 && <p>No users found.</p>}
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                padding: 12,
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{u.username}</strong> — <em>{u.level}</em>
              </div>
              <button
                onClick={() => handleDeleteUser(u.id)}
                style={{
                  background: '#e53935',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Server side auth
export async function getServerSideProps(context) {
  const authResult = await requireAuth(['superowner'])(context);
  if ('props' in authResult) {
    return {
      props: { user: authResult.props.user },
    };
  }
  return authResult;
}
