import { useRouter } from 'next/router';
import axios from 'axios';
import { useEffect, useState } from 'react';
import LoadingBar from '../components/LoadingBar';

export default function Logout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.post('/api/logout').then(() => {
      setTimeout(() => {
        setLoading(false);
        router.push('/login');
      }, 5000);
    });
  }, [router]);

  return loading ? <LoadingBar duration={5000} text="Logging out..." /> : null;
}
