// app/mindmap/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MindMapFlowchart from '@/app/ui/MindMapFlowchart';

export default function Page() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  
  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topic) {
      generateMindMap(topic);
    }
  }, [topic]);

  const generateMindMap = async (mainTopic: string) => {
    setLoading(true);
    setError('');
    setMindMapData(null);

    try {
      const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mainTopic }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate mind map');
      }

      setMindMapData(result.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the mind map');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // No topic provided
  if (!topic) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '600px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '16px',
          }}>
            🧠 Mind Map Generator
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}>
            No topic provided. Please add a topic to the URL.
          </p>
          <div style={{
            background: '#f1f5f9',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#475569',
            fontFamily: 'monospace',
          }}>
            Example: <strong>/?topic=Machine Learning</strong>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px 60px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '6px solid #e2e8f0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px',
          }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '8px',
          }}>
            Generating Mind Map
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
          }}>
            Creating visualization for: <strong>{topic}</strong>
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '600px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px',
          }}>
            ❌
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '16px',
          }}>
            Error Generating Mind Map
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            marginBottom: '24px',
          }}>
            {error}
          </p>
          <button
            onClick={() => generateMindMap(topic)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Success state - render mind map
  if (mindMapData) {
    return (
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        {/* Topic header */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: 0,
          }}>
            🧠 {topic}
          </h3>
        </div>

        {/* Reload button */}
        <button
          onClick={() => generateMindMap(topic)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🔄 Regenerate
        </button>

        {/* Mind map flowchart */}
        <MindMapFlowchart geminiData={mindMapData} />
      </div>
    );
  }

  return null;
}