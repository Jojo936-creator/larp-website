import { requireAuth } from '../lib/auth';
import AnnouncementCreator from '../components/AnnouncementCreator';

export default function AdminAnnouncementsPage({ user }) {
  return <AnnouncementCreator user={user} channel="admin" />;
}

export async function getServerSideProps(context) {
  return requireAuth('admin')(context);
}





