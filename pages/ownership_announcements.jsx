import { requireAuth } from '../lib/auth';
import AnnouncementCreator from '../components/AnnouncementCreator';

export default function OwnershipAnnouncementsPage({ user }) {
  return <AnnouncementCreator user={user} channel="ownership" />;
}

export async function getServerSideProps(context) {
  return requireAuth['owner', 'superowner'](context); // o 'superowner' se necessario
}
