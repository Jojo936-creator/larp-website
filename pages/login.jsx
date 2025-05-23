import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import LoadingBar from '../components/LoadingBar';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/login', { username, password });
      if (res.data.require2fa) {
        setStep(2);
      } else {
        setTimeout(() => router.push('/staff_area'), 5000);
      }
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/verify-2fa', { code });
      setTimeout(() => router.push('/staff_area'), 5000);
    } catch (err) {
      setError('Invalid 2FA code');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg,#e3eafc 0%,#f8fafc 100%)' }}>
      <div style={{ maxWidth: 420, width: '100%', background: '#fff', padding: 36, borderRadius: 18, boxShadow: '0 6px 32px rgba(26,115,232,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18, color: '#1a73e8', letterSpacing: 1 }}>Staff Login</h1>
        {loading && <LoadingBar duration={5000} text={step === 2 ? 'Verifying 2FA...' : 'Logging in...'} />}
        {!loading && step === 1 && (
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: '12px 14px', fontSize: 17, borderRadius: 8, border: '1.5px solid #b6c6e3', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', marginBottom: 18, padding: '12px 14px', fontSize: 17, borderRadius: 8, border: '1.5px solid #b6c6e3', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }} />
            <button type="submit" style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(90deg,#1a73e8,#3f51b5)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, cursor: 'pointer', marginTop: 6, boxShadow: '0 2px 8px rgba(26,115,232,0.10)' }}>Login</button>
          </form>
        )}
        {!loading && step === 2 && (
          <form onSubmit={handle2FA} style={{ width: '100%' }}>
            <input type="text" placeholder="Codice 2FA (6 cifre)" value={code} onChange={e => setCode(e.target.value)} maxLength={6} style={{ width: '100%', marginBottom: 18, padding: '12px 14px', fontSize: 17, borderRadius: 8, border: '1.5px solid #b6c6e3', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box', letterSpacing: 2, fontWeight: 600 }} />
            <button type="submit" style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(90deg,#1a73e8,#3f51b5)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, cursor: 'pointer', marginTop: 6, boxShadow: '0 2px 8px rgba(26,115,232,0.10)' }}>Verifica 2FA</button>
          </form>
        )}
        {error && <div style={{ color: '#e53935', marginTop: 14, fontWeight: 500 }}>{error}</div>}
      </div>
    </div>
  );
}
