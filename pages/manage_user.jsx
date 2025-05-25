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

  return (
    <>
      <Topbar user={user} />
      <main className="container">
        <h1>Manage Users <span className="subtitle">(Superowner only)</span></h1>

        <form onSubmit={handleCreateUser} className="create-form" autoComplete="off">
          <h2>Create New User</h2>
          <div className="form-row">
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Username"
              required
              className="input"
            />
            <input
              type="text"
              name="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Password (visible)"
              required
              className="input"
            />
            <select
              name="level"
              value={newUser.level}
              onChange={(e) => setNewUser({ ...newUser, level: e.target.value })}
              className="select"
            >
              <option value="staff">staff</option>
              <option value="owner">owner</option>
              <option value="superowner">superowner</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Add User
            </button>
          </div>
        </form>

        {loading && <p className="loading">Loading users...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && users.length === 0 && <p>No users found.</p>}

        {!loading && users.length > 0 && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? 'even' : 'odd'}>
                  <td>{u.username}</td>
                  <td className="password-cell">{u.password}</td>
                  <td>{u.level}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="btn btn-danger"
                      aria-label={`Delete user ${u.username}`}
                      title={`Delete user ${u.username}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <style jsx>{`
          .container {
            max-width: 900px;
            margin: 50px auto 80px;
            padding: 0 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #222;
          }
          h1 {
            font-weight: 900;
            font-size: 2.6rem;
            letter-spacing: -0.04em;
            margin-bottom: 30px;
            color: #1e40af;
            text-shadow: 1px 1px 5px rgba(0,0,0,0.1);
          }
          .subtitle {
            font-weight: 400;
            font-size: 1.2rem;
            color: #555;
            margin-left: 10px;
          }
          .create-form {
            background: #f5f7ff;
            padding: 30px 25px;
            border-radius: 15px;
            box-shadow: 0 15px 30px rgba(30,64,175,0.1);
            margin-bottom: 50px;
            transition: box-shadow 0.3s ease;
          }
          .create-form:hover {
            box-shadow: 0 20px 40px rgba(30,64,175,0.2);
          }
          .form-row {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
          }
          .input, .select {
            flex: 1 1 150px;
            padding: 12px 15px;
            font-size: 1.05rem;
            border: 2px solid #a3bffa;
            border-radius: 10px;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
            outline-offset: 2px;
          }
          .input:focus, .select:focus {
            border-color: #1e40af;
            box-shadow: 0 0 6px #1e40afaa;
          }
          .btn {
            cursor: pointer;
            font-weight: 700;
            border-radius: 12px;
            padding: 12px 28px;
            border: none;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 10px rgba(30,64,175,0.15);
          }
          .btn-primary {
            background-color: #1e40af;
            color: white;
          }
          .btn-primary:hover {
            background-color: #2946d5;
            box-shadow: 0 6px 18px rgba(41,70,213,0.45);
          }
          .btn-danger {
            background-color: #e53e3e;
            color: white;
            padding: 8px 16px;
            font-size: 0.9rem;
            box-shadow: 0 4px 10px rgba(229,62,62,0.3);
          }
          .btn-danger:hover {
            background-color: #c53030;
            box-shadow: 0 6px 18px rgba(197,48,48,0.6);
          }
          .loading {
            font-size: 1.2rem;
            font-weight: 600;
            color: #666;
            margin-top: 40px;
          }
          .error {
            color: #b91c1c;
            font-weight: 700;
            margin-top: 20px;
          }
          .users-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 8px;
            font-size: 1rem;
          }
          .users-table th, .users-table td {
            padding: 14px 18px;
            text-align: left;
          }
          .users-table th {
            background: #1e40af;
            color: white;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            border-radius: 10px 10px 0 0;
          }
          .users-table tbody tr {
            background: white;
            box-shadow: 0 3px 8px rgba(30,64,175,0.1);
            transition: box-shadow 0.3s ease;
            border-radius: 0 0 10px 10px;
          }
          .users-table tbody tr.even {
            background: #f8faff;
          }
          .users-table tbody tr:hover {
            box-shadow: 0 8px 20px rgba(30,64,175,0.2);
          }
          .password-cell {
            font-family: monospace;
            color: #444;
            user-select: text;
            letter-spacing: 0.1em;
          }

          @media (max-width: 600px) {
            .form-row {
              flex-direction: column;
              gap: 15px;
            }
            .input, .select {
              flex: 1 1 auto;
              width: 100%;
            }
            .btn {
              width: 100%;
              padding: 14px;
            }
          }
        `}</style>
      </main>
    </>
  );
}

// Server-side auth
export async function getServerSideProps(context) {
  return requireAuth('superowner')(context);
}



