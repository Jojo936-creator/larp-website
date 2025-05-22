import "@/styles/globals.css";
import Topbar from '../components/Topbar';
import { useEffect, useState } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const agreed = localStorage.getItem('privacy_agreed');
      if (!agreed) setShowPolicy(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('privacy_agreed', 'yes');
    setShowPolicy(false);
  };

  return (
    <div>
      {showPolicy && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
            padding: '38px 32px 28px 32px',
            maxWidth: 420,
            width: '90vw',
            textAlign: 'center',
          }}>
            <h2 style={{fontWeight:700, fontSize: 26, marginBottom: 18}}>Privacy Policy</h2>
            <div style={{fontSize: 16, color: '#444', marginBottom: 18}}>
              Questo sito raccoglie dati di accesso e utilizzo esclusivamente per finalità di autenticazione e sicurezza. Nessun dato viene condiviso con terze parti per fini commerciali.<br/><br/>
              Per la policy completa vedi <a href="https://amber-mozelle-72.tiiny.site" target="_blank" rel="noopener noreferrer" style={{color:'#1a73e8', textDecoration:'underline'}}>Privacy Policy</a>.
            </div>
            <button onClick={handleAgree} style={{
              background: 'linear-gradient(90deg,#1a73e8,#3f51b5)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 38px',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(26,115,232,0.10)',
              marginTop: 10
            }}>Agree</button>
          </div>
        </div>
      )}
      <Component {...pageProps} />
    </div>
  );
}
