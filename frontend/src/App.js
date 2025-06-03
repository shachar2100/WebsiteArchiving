import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/archives';

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function App() {
  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch archives for a domain
  const fetchArchives = async (domain) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/${domain}`);
      setArchives(res.data);
    } catch (err) {
      setArchives([]);
      setError(err.response?.data?.message || 'Failed to fetch archives');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const domain = getDomain(url);
    if (!domain) {
      setError('Please enter a valid URL');
      setSubmitting(false);
      return;
    }
    try {
      await axios.post(`${API_BASE}/archive`, { url });
      setDomain(domain);
      setUrl('');
      await fetchArchives(domain);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive website');
    } finally {
      setSubmitting(false);
    }
  };

  // When domain changes, fetch its archives
  React.useEffect(() => {
    if (domain) fetchArchives(domain);
  }, [domain]);

  // Handle clicking a timestamp
  const handleViewArchive = (archive) => {
    // Open the index.html of the archive in a new tab
    window.open(
      `http://localhost:3001/snapshots/${archive.path}/index/index.html`,
      '_blank'
    );
  };

  // UI
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff' }}>Website Archiver</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., https://example.com)"
          required
          style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          {submitting ? 'Archiving...' : 'Archive'}
        </button>
      </form>
      {error && (
        <div style={{ color: '#dc3545', marginBottom: 16, textAlign: 'center' }}>
          {error}
        </div>
      )}
      {loading && <div style={{ textAlign: 'center' }}>Loading archives...</div>}
      {domain && (
        <div>
          <h2 style={{ marginBottom: 12 }}>Archive History for <span style={{ color: '#007bff' }}>{domain}</span></h2>
          <button
            onClick={() => setUrl(`https://${domain}`)}
            style={{
              marginBottom: 16,
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              cursor: 'pointer'
            }}
          >
            Archive Current State
          </button>
          {archives.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center' }}>No archives found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {archives.map(archive => (
                <div
                  key={archive.timestamp}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: 6,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fafbfc'
                  }}
                >
                  <span>
                    {new Date(archive.timestamp).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleViewArchive(archive)}
                    style={{
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    View Archive
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
