import Topbar from '../components/Topbar';

export default function AccessDenied({ user }) {
  return (
    <>
      <Topbar user={user} />
      <main style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, marginBottom: 16, color: '#e53935' }}>Access Denied</h1>
        <p style={{ fontSize: 18, color: '#555' }}>
          You do not have permission to view this page.
        </p>
        <p style={{ marginTop: 24 }}>
          <a href="/" style={{
            padding: '10px 20px',
            background: '#1a73e8',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Go back to Dashboard
          </a>
        </p>
      </main>
    </>
  );
}

// Optional: if you want to pass user from server
export async function getServerSideProps(context) {
  const { req } = context;
  const user = req.user || null; // depends on your auth setup
  return { props: { user } };
}
