import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SidebarLayout.module.css';

export default function SidebarLayout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
        <div className={styles.header}>
          <button onClick={() => setOpen(!open)} className={styles.toggleBtn}>
            {open ? '←' : '→'}
          </button>
        </div>
        {open && (
          <nav className={styles.nav}>
            <span className={styles.logo}>AI Tools</span>
            <Link to="/">🏠 Home</Link>
            <Link to="/aichat">💬 AI Chat</Link>
            <Link to="/aiimage">🖼️ AI Image</Link>
          </nav>
        )}
      </aside>

      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
