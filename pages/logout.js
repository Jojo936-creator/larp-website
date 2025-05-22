import { useRouter } from 'next/router';
import axios from 'axios';
import { useEffect } from 'react';

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    axios.post('/api/logout').then(() => {
      router.push('/login');
    });
  }, [router]);
  return <p>Logging out...</p>;
}
