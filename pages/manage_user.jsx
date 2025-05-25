import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { requireAuth } from '../lib/auth';

export default function ManageUser({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from API
  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers(); // Refresh list
    } catch (e) {
      alert('Error deleting user: ' + e.message);
    }
  }

  return (
    <>
      <Topbar user={user} />
      <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Manage Users (Superowner only)</h1>

        {loading && <p>Loading users...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && users.length === 0 && <p>No users found.</p>}

        {!loading && users.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Username</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Level</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{u.username}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{u.level}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                    <button
                      onClick={() => deleteUser(u.id)}
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

// Server-side authentication check for superowner
export async function getServerSideProps(context) {
  return requireAuth('superowner')(context);
}

