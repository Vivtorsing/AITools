import React, { useEffect, useRef, useState } from 'react';
import styles from './AIChat.module.css';
import SidebarLayout from '../components/SidebarLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Helmet } from 'react-helmet-async';

export default function AIChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [model, setModel] = useState('gpt-4.1-nano-2025-04-14');
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    fetch('https://text.pollinations.ai/models')
      .then((res) => {
        if(!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setModels(data);
        const openaiModel = data.find((m) => m.name === 'openai');
        if(openaiModel) {
          setModel(openaiModel.name);
        } else if(data.length > 0) {
          setModel(data[0].name);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch models:", err);
        alert("⚠️ Failed to load model list. The Pollinations API might be down.");
      });
  }, []);

  const scrollToBottom = () => {
    if(chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    try {
      if(!input.trim() || isLoading || cooldown) return;

      const newMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-9), // keep last 9 + system = 10
        { role: 'user', content: input.trim() },
      ];

      setMessages([...messages, { role: 'user', content: input.trim() }, { role: 'assistant', content: '' }]);
      setInput('');
      setIsLoading(true);
      scrollToBottom();

      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          stream: true,
          private: true,
          model,
        }),
      });

      if(!response.ok) throw new Error(`Status ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullContent = '';

      while(true) {
        const { done, value } = await reader.read();
        if(done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for(let line of lines) {
          line = line.trim();
          if(!line.startsWith('data:')) continue;
          const jsonStr = line.slice(5).trim();
          if(jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
            const token = delta && delta.content;

            if(token) {
              fullContent += token;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = fullContent;
                return updated;
              });
              scrollToBottom();
            }
          } catch(err) {
            console.error('Invalid chunk:', jsonStr);
          }
        }
      }

      setIsLoading(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 10000);
      
    } catch(err) {
      console.error("Failed to fetch chat response:", err);
    setIsLoading(false);
    setCooldown(false);
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].content = "⚠️ Error: Unable to get a response from the AI. Try again later.";
      return updated;
    });
    scrollToBottom();
    }
  };

  return (
    <SidebarLayout class="background">
      <Helmet prioritizeSeoTags>
        <title>AI Chat | AI Tools</title>
        <meta name="description" content="Chat with an AI assistant powered by Pollinations." />
        <meta property="og:title" content="AI Chat | AI Tools" />
        <meta property="og:description" content="Chat with an AI assistant powered by Pollinations." />
      </Helmet>

      <h1>AI Chat</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <strong>System Prompt:</strong>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </label>

        <label style={{ display: 'block', marginTop: '1rem' }}>
          <strong>Model:</strong>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ marginTop: '0.5rem' }}
          >
            {models.map((m) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.messageList} ref={chatRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.message} ${styles[msg.role]}`}
          >
            <strong>{msg.role}:</strong>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      <div className={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
          rows={2}
          style={{ flex: 1, padding: '0.5rem', resize: 'none' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} disabled={isLoading || cooldown}>
          {isLoading ? "Waiting..." : "Send"}
        </button>
      </div>

      {cooldown && !isLoading && (
        <p style={{ color: 'gray', marginTop: '0.5rem' }}>
          Please wait 10 seconds before sending another message.
        </p>
      )}
    </SidebarLayout>
  );
}
