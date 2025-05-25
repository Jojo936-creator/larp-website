import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';

export default function ManageUser({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Fetch users error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (!user || user.level !== 'superowner') {
    return (
      <>
        <Topbar user={user} />
        <main style={{ padding: 20, maxWidth: 900, margin: 'auto' }}>
          <h1>Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar user={user} />
      <main style={{ padding: 20, maxWidth: 900, margin: 'auto' }}>
        <h1>Manage Users</h1>

        {loading && <p>Loading users...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Username</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Level</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 8, textAlign: 'center' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(({ id, username, level }) => (
                  <tr key={id}>
                    <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{username}</td>
                    <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{level}</td>
                    <td style={{ borderBottom: '1px solid #eee', padding: 8, textAlign: 'center' }}>
                      <button
                        style={{
                          marginRight: 8,
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                          background: '#fff'
                        }}
                        onClick={() => alert(`Edit user ${username} - functionality to be implemented`)}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #e53935',
                          cursor: 'pointer',
                          background: '#fff',
                          color: '#e53935'
                        }}
                        onClick={() => alert(`Delete user ${username} - functionality to be implemented`)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}



