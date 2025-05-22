import { requireAuth } from '../lib/auth';
import Topbar from '../components/Topbar';

export default function StaffArea({ user }) {
  return (
    <>
      <Topbar user={user} />
      <div style={{ maxWidth: 900, margin: '48px auto 0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: '40px 32px 32px 32px', border: '1px solid #e0e0e0' }}>
        <h1 style={{marginBottom: 16}}>Staff Dashboard</h1>
        <p style={{fontSize:18}}>Welcome, <b>{user.username}</b> (level: {user.level})</p>
        <ul style={{marginTop: 32, fontSize:16, lineHeight:1.7}}>
          <li>View <b>announcements</b> and communications reserved for staff.</li>
          <li>Access the <b>Admin</b> and <b>Owner</b> sections if you have permissions.</li>
          <li>Check service information in the dedicated pages.</li>
        </ul>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAuth('staff')(context);
}
