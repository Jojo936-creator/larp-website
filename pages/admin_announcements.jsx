import AnnouncementsPage from '../components/AnnouncementsPage';
import { requireAuth } from '../lib/auth';

export default function StaffAnnouncements({ user }) {
  return <AnnouncementsPage user={user} channel="admin" />;
}

export async function getServerSideProps(context) {
  return requireAuth('admin')(context);
}






