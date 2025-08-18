import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import SidebarLayout from '../components/SidebarLayout';

import styles from './AIChat.module.css';

export default function Home() {
  return (
    <SidebarLayout>
      <Helmet prioritizeSeoTags>
        <title>AI Tools</title>
        <meta name="description" content="Use AI Tools online without signing up and free!" />
        <meta property="og:title" content="AI Chat | AI Tools" />
        <meta property="og:description" content="Use AI Tools online without signing up and free!" />
      </Helmet>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>Welcome to AI Tools</h1>
        <p style={{color: 'pink'}}>Explore AI-powered tools right in your browser.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/aichat">
            <button className={styles.button} style={{ margin: '1rem' }}>AI Chat</button>
          </Link>
          <Link to="/aiimage">
            <button className={styles.button} style={{ margin: '1rem' }}>AI Image</button>
          </Link>
          <Link to="/aivoice">
            <button className={styles.button} style={{ margin: '1rem' }}>AI Voice</button>
          </Link>
        </div>
      </div>
    </SidebarLayout>
  );
}
