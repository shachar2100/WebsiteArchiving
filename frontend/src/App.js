import React, { useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const API_BASE = 'http://localhost:3001/api/archives';

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Color palette for percent difference
function getDiffColor(percent) {
  if (percent === 0) return '#d6d6d6'; // gray
  if (percent <= 20) return '#f6e58d'; // yellow
  if (percent <= 50) return '#badc58'; // light green
  if (percent <= 80) return '#6ab04c'; // green
  return '#30336b'; // blue
}

function App() {
  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [domains, setDomains] = useState([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

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

  // Fetch domains on mount
  React.useEffect(() => {
    const fetchDomains = async () => {
      setDomainsLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/domains`);
        setDomains(res.data);
      } catch (err) {
        setDomains([]);
      } finally {
        setDomainsLoading(false);
      }
    };
    fetchDomains();
  }, []);

  const handleArchiveCurrentState = async () => {
    setError('');
    setSubmitting(true);
    const archiveUrl = `https://${domain}`;
    try {
      await axios.post(`${API_BASE}/archive`, { url: archiveUrl });
      await fetchArchives(domain);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive website');
    } finally {
      setSubmitting(false);
    }
  };

  // UI
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '40px auto',
        fontFamily: 'sans-serif',
        padding: '0 2vw',
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      {/* Hide title and search bar when a domain is selected or a search is performed */}
      {!domain && (
        <h1
          style={{
            textAlign: 'center',
            color: '#007bff',
            fontSize: 'clamp(2rem, 5vw, 2.5rem)',
            marginBottom: 24,
            marginTop: 0,
          }}
        >
          Website Archiver
        </h1>
      )}
      {!domain && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            required
            style={{
              flex: 1,
              minWidth: 0,
              padding: 10,
              borderRadius: 4,
              border: '1px solid #ccc',
              fontSize: '1rem',
              maxWidth: 350,
            }}
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
              cursor: 'pointer',
              fontSize: '1rem',
              minWidth: 100,
              height: 40,
            }}
          >
            {submitting ? 'Archiving...' : 'Archive'}
          </button>
        </form>
      )}
      {/* Move the list of all archived websites under the search bar, and only show when no domain is selected */}
      {!domain && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>All Archived Websites</h2>
          {domainsLoading ? (
            <div>Loading domains...</div>
          ) : domains.length === 0 ? (
            <div style={{ color: '#666' }}>No archived websites found.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {domains.map(domainName => (
                <li key={domainName}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: 0,
                      margin: '4px 0',
                      wordBreak: 'break-all',
                    }}
                    onClick={() => { setDomain(domainName); setSelectedDate(null); }}
                  >
                    {domainName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && (
        <div style={{ color: '#dc3545', marginBottom: 16, textAlign: 'center' }}>
          {error}
        </div>
      )}
      {loading && <div style={{ textAlign: 'center' }}>Loading archives...</div>}
      {domain && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          {/* Back button to show all websites and search bar again */}
          <button
            onClick={() => { setDomain(''); setSelectedDate(null); }}
            style={{
              marginBottom: 16,
              background: '#f0f0f0',
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: 4,
              padding: '6px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              alignSelf: 'flex-start',
              maxWidth: 220,
            }}
          >
            ← Back to all websites
          </button>
          <h2 style={{ marginBottom: 12, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>
            Archive History for <span style={{ color: '#007bff' }}>{domain}</span>
          </h2>
          <button
            onClick={handleArchiveCurrentState}
            disabled={submitting}
            style={{
              marginBottom: 16,
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: '1rem',
              maxWidth: 220,
              alignSelf: 'flex-start',
            }}
          >
            {submitting ? 'Archiving...' : 'Archive Current State'}
          </button>
          {/* Calendar Feature */}
          <div style={{ marginBottom: 24, width: '100%', maxWidth: 500, alignSelf: 'center' }}>
            <h3 style={{ marginBottom: 8, fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>Calendar View</h3>
            <Calendar
              value={selectedDate}
              onClickDay={date => setSelectedDate(date)}
              tileContent={({ date, view }) => {
                const dayArchives = archives.filter(a => {
                  const d = new Date(a.timestamp);
                  return d.toDateString() === date.toDateString();
                });
                if (dayArchives.length > 0) {
                  // Use the max percentDifference for the day
                  const maxPercent = Math.max(...dayArchives.map(a => a.percentDifference || 0));
                  return (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        margin: '0 auto',
                        borderRadius: 4,
                        background: getDiffColor(maxPercent),
                      }}
                      title={`Max change: ${maxPercent.toFixed(1)}%`}
                    />
                  );
                }
                return null;
              }}
              style={{ width: '100%', minWidth: 0 }}
            />
            {/* Color legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0', position: 'relative' }}>
              <span style={{ fontSize: 14 }}>Variation:</span>
              {/* Info button with custom tooltip */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#eee',
                  color: '#007bff',
                  fontWeight: 'bold',
                  fontSize: 13,
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  position: 'relative',
                }}
                tabIndex={0}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
              >
                i
                {showTooltip && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '120%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#fff',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      padding: '8px 12px',
                      minWidth: 220,
                      zIndex: 10,
                      fontSize: 13,
                      whiteSpace: 'normal',
                    }}
                  >
                    Percent difference is calculated by comparing the text content of the main page (index.html) between this and the previous archive.
                  </span>
                )}
              </span>
              <span style={{ width: 20, height: 20, background: '#d6d6d6', borderRadius: 4, display: 'inline-block' }} title="No change" />
              <span style={{ width: 20, height: 20, background: '#f6e58d', borderRadius: 4, display: 'inline-block' }} title="Low" />
              <span style={{ width: 20, height: 20, background: '#badc58', borderRadius: 4, display: 'inline-block' }} title="Medium" />
              <span style={{ width: 20, height: 20, background: '#6ab04c', borderRadius: 4, display: 'inline-block' }} title="High" />
              <span style={{ width: 20, height: 20, background: '#30336b', borderRadius: 4, display: 'inline-block' }} title="Very High" />
              <span style={{ fontSize: 14 }}>Low → Hi</span>
            </div>
            {/* Calendar highlight style */}
            <style>{`
              .react-calendar {
                width: 100% !important;
                max-width: 100% !important;
                font-size: 1rem;
              }
              @media (max-width: 600px) {
                .react-calendar {
                  font-size: 0.9rem;
                }
              }
            `}</style>
          </div>
          {/* Show archives for the selected date */}
          {selectedDate && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>Archives for {selectedDate.toLocaleDateString()}:</h3>
              {archives
                .filter(a => new Date(a.timestamp).toDateString() === selectedDate.toDateString())
                .map(a => (
                  <div key={a.timestamp} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: getDiffColor(a.percentDifference),
                        marginRight: 8,
                      }}
                      title={`Change: ${a.percentDifference?.toFixed(1) || 0}%`}
                    />
                    <span>{new Date(a.timestamp).toLocaleTimeString()}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>{a.percentDifference?.toFixed(1) || 0}%</span>
                    <button
                      onClick={() => handleViewArchive(a)}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      View Archive
                    </button>
                  </div>
                ))}
              {archives.filter(a => new Date(a.timestamp).toDateString() === selectedDate.toDateString()).length === 0 && (
                <div style={{ color: '#666' }}>No archives for this day.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
