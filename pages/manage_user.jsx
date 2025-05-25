import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { useRouter } from 'next/router';

export default function ManageUser({ user }) {
  const router = useRouter();
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not superowner
  useEffect(() => {
    if (!user || user.level !== 'superowner') {
      router.replace('/403'); // o altra pagina access denied
    }
  }, [user, router]);

  // Fetch users from API
  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user handler
  async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      // Refetch users after deletion
      fetchUsers();
    } catch (e) {
      alert('Error deleting user: ' + e.message);
    }
  }

  return (
    <>
      <Topbar user={user} />
      <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
        <h1>Manage Users (Superowner only)</h1>

        {loading && <p>Loading users...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        {!loading && users && users.length === 0 && <p>No users found.</p>}

        {!loading && users && users.length > 0 && (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 20,
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
                  Username
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
                  Level
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                    {u.username}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                    {u.level}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                    {/* Qui puoi aggiungere il pulsante modifica se vuoi */}
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
requireAuth('superowner')(context)
