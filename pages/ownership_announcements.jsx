import AnnouncementsPage from '../components/AnnouncementsPage';
import { requireAuth } from '../lib/auth';

export default function OwnershipAnnouncements({ user }) {
  return <AnnouncementsPage user={user} channel="ownership" />;
}

export async function getServerSideProps(context) {
  return requireAuth(['owner', 'superowner'])(context);
}

