import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from 'next/link';
import { parse } from 'cookie';
import Topbar from '../components/Topbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home({ user }) {
  return (
    <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
      <Topbar user={user} />
      <main className={styles.main}>
        <div style={{ maxWidth: 600, margin: '60px auto', padding: 32, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
          <h1>Welcome to the LARP Staff Portal</h1>
          {user ? (
            <>
              <p>You are logged in as <b>{user.username}</b> (level: {user.level})</p>
              <Link href="/staff_area">Go to staff area</Link> | <Link href="/logout">Logout</Link>
            </>
          ) : (
            <Link href="/login">Staff Login</Link>
          )}
          <div style={{ marginTop: 16 }}>
            <Link href="https://larp-website.betteruptime.com">Status</Link>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = parse(req.headers.cookie || '');
  let user = null;
  if (cookies.session) {
    try {
      user = JSON.parse(cookies.session);
    } catch {}
  }
  return { props: { user } };
}
