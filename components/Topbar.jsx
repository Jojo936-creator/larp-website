import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';

const staffPages = [
  { href: '/staff_area', label: 'Dashboard' },
  { href: '/staff_announcements', label: 'Staff Announcements' },
  { href: '/staff_info', label: 'Staff Info' },
  { href: '/admin_announcements', label: 'Admin Announcements' },
  { href: '/admin_info', label: 'Admin Info' },
  { href: '/ownership_announcements', label: 'Owner Announcements' },
  { href: '/ownership_info', label: 'Owner Info' },
];

export default function Topbar({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visiblePages = user ? staffPages.filter(page => {
    if (page.href.includes('admin') && user.level === 'staff') return false;
    if (page.href.includes('owner') && user.level !== 'owner' or 'superowner') return false;
    return true;
  }) : [];

  return (
    <nav style={{
      width: '100%',
      background: '#222',
      color: '#fff',
      padding: '16px 0',
      marginBottom: 32,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: 1,
      zIndex: 1000
    }}>
      <div style={{ width: '90%', maxWidth: 1200, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 20 }}>
          LARP Staff Portal
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {user ? (
            <>
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpen(v => !v)}
                  style={{
                    background: '#111',
                    color: '#fff',
                    border: '1px solid #222',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontSize: 17,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: open ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                    outline: open ? '2px solid #1a73e8' : 'none',
                    transition: 'box-shadow 0.15s, outline 0.15s',
                    minWidth: 120
                  }}
                >
                  Menu Staff ▾
                </button>
                {open && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
                    minWidth: 220,
                    zIndex: 10,
                    padding: '8px 0'
                  }}>
                    {visiblePages.map(page => (
                      <Link
                        key={page.href}
                        href={page.href}
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'block',
                          padding: '10px 24px',
                          color: router.pathname === page.href ? '#1a73e8' : '#222',
                          background: router.pathname === page.href ? '#f2f7ff' : 'transparent',
                          fontWeight: router.pathname === page.href ? 700 : 500,
                          textDecoration: 'none',
                          borderLeft: router.pathname === page.href ? '4px solid #1a73e8' : '4px solid transparent',
                          transition: 'background 0.13s, color 0.13s, border 0.13s',
                          borderRadius: 4,
                        }}
                      >
                        {page.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/logout">
                <button style={{
                  background: '#e53935',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 12,
                  boxShadow: '0 2px 8px rgba(229,57,53,0.08)',
                  transition: 'background 0.15s',
                }}>
                  Logout
                </button>
              </Link>
            </>
          ) : (
            <Link href="/login" style={{ color: '#fff' }}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
