import React, { useEffect, useState } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import styles from './AIChat.module.css';
import { Helmet } from 'react-helmet-async';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export default function AIVoice() {
  const [input, setInput] = useState('');
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState('');
  const [maxChars, setMaxChars] = useState(2000);
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    fetch('https://text.pollinations.ai/models')
      .then(res => {
        if(!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        //find the model and all the voices
        const audioModel = data.find(m => m.name === 'openai-audio');
        if (audioModel) {
          setVoices(audioModel.voices || []);
          setVoice(audioModel.voices?.[0] || '');
          setMaxChars(audioModel.maxInputChars || 2000);
        }
      })
      .catch(err => {
        console.error('Failed to fetch voices:', err);
        alert('⚠️ Failed to load voices. The Pollinations API might be down.');
      });
  }, []);

  const generateVoice = async () => {
    try {
      if(!input.trim() || isLoading || cooldown) return;

      if(matcher.hasMatch(input)) {
        alert('🚫 Your prompt contains inappropriate language.');
        return;
      }

      if(input.length > maxChars) {
        alert(`🚫 Prompt too long! Please keep under ${maxChars} characters.`);
        return;
      }

      setIsLoading(true);
      setCooldown(true);
      setAudioUrl('');

      //api
      const url = `https://text.pollinations.ai/${encodeURIComponent(input)}?model=openai-audio&voice=${encodeURIComponent(voice)}`;

      //get the audio blob
      const res = await fetch(url);
      if(!res.ok) throw new Error(`Status ${res.status}`);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setAudioUrl(objectUrl);

    } catch(err) {
      console.error('Failed to generate voice:', err);
      alert('⚠️ Failed to generate voice. Try again later.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setCooldown(false), 10000);
    }
  };

  return (
    <SidebarLayout>
      <Helmet>
        <title>AI Voice | AI Tools</title>
        <meta name="description" content="Generate AI voices using Pollinations." />
        <meta property="og:title" content="AI Voice | AI Tools" />
        <meta property="og:description" content="Generate AI voices using Pollinations." />
      </Helmet>

      <h1>AI Voice</h1>

      <label style={{ display: 'block', marginBottom: '1rem' }}>
        <strong>Voice:</strong>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        >
          {voices.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Enter text (max ${maxChars} chars)...`}
        rows={3}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <button className={styles.button} onClick={generateVoice} disabled={isLoading || cooldown}>
        {isLoading ? 'Generating...' : 'Generate Voice'}
      </button>

      {cooldown && !isLoading && (
        <p style={{ color: 'gray', marginTop: '0.5rem' }}>
          Please wait 10 seconds before generating more audio.
        </p>
      )}

      {audioUrl && (
        <div style={{ marginTop: '1rem' }}>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </SidebarLayout>
  );
}
