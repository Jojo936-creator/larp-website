import AnnouncementsPage from '../components/AnnouncementsPage';
import { requireAuth } from '../lib/auth';

export default function StaffAnnouncements({ user }) {
  return <AnnouncementsPage user={user} channel="staff" />;
}

export async function getServerSideProps(context) {
  return requireAuth('staff')(context);
}


