import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { requireAuth } from '../lib/requireAuth';

export default function ManageUser({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form nuovo utente
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newLevel, setNewLevel] = useState('user');

  // Modifica user
  const [editUserId, setEditUserId] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [editLevel, setEditLevel] = useState('');

  // Fetch utenti
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Crea nuovo utente
  async function handleCreateUser(e) {
    e.preventDefault();
    if (!newUsername || !newPassword || !newLevel) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, level: newLevel }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert('Error creating user: ' + (errorData.error || res.statusText));
        return;
      }
      setNewUsername('');
      setNewPassword('');
      setNewLevel('user');
      fetchUsers();
    } catch (e) {
      alert('Error creating user: ' + e.message);
    }
  }

  // Inizia modifica
  function startEdit(user) {
    setEditUserId(user.id);
    setEditPassword(user.password);
    setEditLevel(user.level);
  }

  // Annulla modifica
  function cancelEdit() {
    setEditUserId(null);
    setEditPassword('');
    setEditLevel('');
  }

  // Salva modifica
  async function saveEdit() {
    if (!editPassword || !editLevel) {
      alert('Password and level are required');
      return;
    }
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editUserId, password: editPassword, level: editLevel }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert('Error updating user: ' + (errorData.error || res.statusText));
        return;
      }
      cancelEdit();
      fetchUsers();
    } catch (e) {
      alert('Error updating user: ' + e.message);
    }
  }

  // Cancella utente
  async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        alert('Failed to delete user: ' + (errorData.error || res.statusText));
        return;
      }
      fetchUsers();
    } catch (e) {
      alert('Failed to delete user: ' + e.message);
    }
  }

  return (
    <>
      <Topbar user={user} />
      <main className="max-w-5xl mx-auto mt-12 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Manage Users (Superowner only)</h1>

        {/* FORM CREAZIONE */}
        <form
          onSubmit={handleCreateUser}
          className="bg-white shadow-md rounded-lg p-6 mb-12 max-w-xl mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Create New User</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-600">Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-600">Password (visible)</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-600">Level</label>
            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superowner">Superowner</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            Create User
          </button>
        </form>

        {/* TABELLA UTENTI */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-600">Loading users...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-600">No users found.</p>
          ) : (
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-6 text-left font-medium text-gray-700">Username</th>
                  <th className="py-3 px-6 text-left font-medium text-gray-700">Password</th>
                  <th className="py-3 px-6 text-left font-medium text-gray-700">Level</th>
                  <th className="py-3 px-6 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-6">{u.username}</td>
                    <td className="py-3 px-6 font-mono">{u.password}</td>
                    <td className="py-3 px-6">
                      {editUserId === u.id ? (
                        <select
                          value={editLevel}
                          onChange={(e) => setEditLevel(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="superowner">Superowner</option>
                        </select>
                      ) : (
                        u.level
                      )}
                    </td>
                    <td className="py-3 px-6 text-center space-x-2">
                      {editUserId === u.id ? (
                        <>
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-32 font-mono"
                          />
                          <button
                            onClick={saveEdit}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(u)}
                            className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}

export const getServerSideProps = requireAuth('superowner');




