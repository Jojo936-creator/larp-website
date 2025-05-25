import { requireAuth } from '../lib/auth';
import AnnouncementCreator from '../components/AnnouncementCreator';

export default function StaffAnnouncementsPage({ user }) {
  return <AnnouncementCreator user={user} channel="staff" />;
}

export async function getServerSideProps(context) {
  return requireAuth('staff')(context);
}

