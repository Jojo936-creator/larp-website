import { parse, serialize } from 'cookie';

export function requireAuth(levelRequired) {
  return async (context) => {
    const { req, res } = context;
    const cookies = parse(req.headers.cookie || '');
    if (!cookies.session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    let session;
    try {
      session = JSON.parse(cookies.session);
    } catch {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    const levels = ['staff', 'admin', 'owner', 'superowner'];
    // superowner può accedere a tutto, anche owner
    if (session.level === 'superowner') {
      return { props: { user: session } };
    }
    if (levels.indexOf(session.level) < levels.indexOf(levelRequired)) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    return { props: { user: session } };
  };
}
