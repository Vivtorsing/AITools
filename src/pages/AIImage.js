import React, { useEffect, useState } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import styles from './AIChat.module.css';
import { Helmet } from 'react-helmet-async';

export default function AIImage() {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [model, setModel] = useState('flux');
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    fetch('https://image.pollinations.ai/models')
      .then((res) => {
        if(!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setModels(data);
        if(data.includes('flux')) {
            setModel('flux');
        } else if(data.length > 0) {
            setModel(data[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch image models:", err);
        alert("⚠️ Failed to load image model list. The Pollinations API might be down.");
      });
  }, []);

  const generateImage = async () => {
    if(!input.trim() || isLoading || cooldown) return;

    setIsLoading(true);
    setCooldown(true);
    setImageUrl(null);

    const prompt = encodeURIComponent(input.trim());
    const url = `https://image.pollinations.ai/prompt/${prompt}?model=${model}&safe=true&private=true&nologo=true`;

    try {
      setImageUrl(url);
    } catch(err) {
      console.error("Image generation error:", err);
      alert("⚠️ Failed to generate image.");
    }

    setIsLoading(false);
    setTimeout(() => setCooldown(false), 10000);
  };

  return (
    <SidebarLayout>
      <Helmet prioritizeSeoTags>
        <title>AI Image Generator | AI Tools</title>
        <meta name="description" content="Generate AI images using Pollinations models like Flux and others." />
        <meta property="og:title" content="AI Image Generator | AI Tools" />
        <meta property="og:description" content="Generate AI images using Pollinations models like Flux and others." />
      </Helmet>

      <h1 style={{ color: '#ff9ac1' }}>AI Image Generator</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <strong>Model:</strong>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '8px' }}
          >
            {models.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe an image..."
          rows={2}
          style={{ flex: 1, padding: '0.5rem', resize: 'none' }}
          onKeyDown={(e) => {
            if(e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              generateImage();
            }
          }}
        />
        <button onClick={generateImage} disabled={isLoading || cooldown}>
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </div>

      {cooldown && !isLoading && (
        <p style={{ color: 'gray', marginTop: '0.5rem' }}>
          Please wait 10 seconds before generating another image.
        </p>
      )}

      {imageUrl && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <img
            src={imageUrl}
            alt="AI Generated"
            style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 0 12px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </SidebarLayout>
  );
}
