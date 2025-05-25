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
        {/* 5 sezioni con sfondo immagine a tutta larghezza e box testo che appare su hover, tutto allineato a sinistra senza spazi bianchi */}
        {[
          { img: '/IMG_2318.jpeg', title: 'Titolo 1', text: 'testtesstotesto' },
          { img: '/IMG_2323.jpeg', title: 'Titolo 2', text: 'testtesstotesto' },
          { img: '/image.jpeg', title: 'Titolo 3', text: 'testtesstotesto' },
          { img: '/image.jepg.webp', title: 'Titolo 4', text: 'testtesstotesto' },
          { img: '/image.jpe', title: 'Titolo 5', text: 'testtesstotesto' },
        ].map((item, idx) => (
          <div
            key={item.img}
            style={{
              position: 'relative',
              width: '100vw',
              minHeight: 320,
              height: '40vw',
              maxHeight: 480,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: idx % 2 === 0 ? 'flex-start' : 'flex-end',
              margin: 0,
              padding: 0,
            }}
          >
            <Image
              src={item.img}
              alt={item.title}
              fill
              style={{
                objectFit: 'cover',
                filter: 'brightness(0.7)',
                zIndex: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              sizes="100vw"
              priority={idx === 0}
            />
            <div
              className="hover-fade-box"
              style={{
                position: 'absolute',
                top: '50%',
                left: idx % 2 === 0 ? '5vw' : 'unset',
                right: idx % 2 === 1 ? '5vw' : 'unset',
                transform: 'translateY(-50%)',
                zIndex: 2,
                background: 'rgba(255,255,255,0.92)',
                color: '#222',
                borderRadius: 18,
                boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                padding: '32px 40px',
                maxWidth: 380,
                minWidth: 220,
                opacity: 0,
                transition: 'opacity 0.35s',
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: idx % 2 === 0 ? 'flex-start' : 'flex-end',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = 1;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = 0;
              }}
            >
              <h2 style={{ fontSize: 28, margin: 0, color: '#1a73e8' }}>{item.title}</h2>
              <p style={{ margin: '12px 0 0 0', fontSize: 19 }}>{item.text}</p>
            </div>
          </div>
        ))}
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
