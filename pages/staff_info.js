import { requireAuth } from '../lib/auth';
import Topbar from '../components/Topbar';

export default function StaffInfo({ user }) {
  return (
    <>
      <Topbar user={user} />
      <div style={{ maxWidth: 900, margin: '48px auto 0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: '40px 32px 32px 32px', border: '1px solid #e0e0e0' }}>
        <h1>Staff Info</h1>
        <p>Information and resources for staff.</p>
        <ul style={{marginTop:24, color:'#555'}}>
          <li>Manuals and operational guidelines</li>
          <li>Useful contacts</li>
          <li>Staff FAQ</li>
        </ul>
        <p style={{marginTop:24, color:'#888'}}>User: {user.username} (level: {user.level})</p>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAuth('staff')(context);
}
