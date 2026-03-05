import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { queueAPI } from '../services/api';
import { connectSocket, joinQueueRoom, getSocket } from '../services/socket';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --bg: #080b12;
    --surface: #0f1520;
    --surface2: #161e2e;
    --surface3: #1c2640;
    --border: #1f2d47;
    --border-hover: #2e4268;
    --teal: #0fd6c2;
    --teal-light: #3fede0;
    --teal-dim: #0aaa99;
    --teal-bg: rgba(15,214,194,0.07);
    --teal-border: rgba(15,214,194,0.25);
    --red: #f04f4f;
    --red-light: #ff7a7a;
    --red-bg: rgba(240,79,79,0.07);
    --red-border: rgba(240,79,79,0.3);
    --amber: #fbbf24;
    --amber-bg: rgba(251,191,36,0.1);
    --amber-border: rgba(251,191,36,0.3);
    --blue: #3b82f6;
    --blue-bg: rgba(59,130,246,0.1);
    --blue-border: rgba(59,130,246,0.3);
    --gray: #9ca3af;
    --gray-bg: rgba(156,163,175,0.1);
    --gray-border: rgba(156,163,175,0.3);
    --green: #22c55e;
    --green-bg: rgba(34,197,94,0.1);
    --green-border: rgba(34,197,94,0.3);
    --text: #eaf0fb;
    --text-muted: #7e92b4;
    --text-dim: #3d5070;
    --r: 10px;
    --r-lg: 14px;
    --font: 'Plus Jakarta Sans', sans-serif;
  }

  * { box-sizing: border-box; }

  .qt-page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    display: flex; flex-direction: column;
    padding: 24px;
    align-items: center; justify-content: center;
  }
  
  .qt-accent-bar {
    position: fixed; top: 0; left: 0;
    height: 2px; width: 100%;
    background: linear-gradient(90deg, transparent 0%, var(--teal-dim) 25%, var(--teal) 50%, var(--teal-light) 75%, transparent 100%);
    box-shadow: 0 0 12px rgba(15,214,194,0.35);
  }

  .qt-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    width: 100%; max-width: 440px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  
  .qt-alert {
    background: var(--green-bg); border: 1px solid var(--green-border);
    border-radius: var(--r-lg); padding: 20px; text-align: center;
    margin-bottom: 24px; width: 100%; max-width: 440px;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 50% { box-shadow: 0 0 0 10px rgba(34,197,94,0); } }
  .qt-alert-title { font-size: 24px; font-weight: 800; color: var(--green); margin-bottom: 4px; }
  .qt-alert-sub { font-size: 13px; color: var(--text-muted); }

  .qt-header {
    background: linear-gradient(135deg, var(--surface2), var(--surface3));
    border-bottom: 1px solid var(--border);
    padding: 32px 24px; text-align: center;
  }
  .qt-h-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--teal); margin-bottom: 6px; }
  .qt-h-val { font-size: 48px; font-weight: 800; color: var(--text); letter-spacing: 0.05em; line-height: 1; margin-bottom: 8px; }
  .qt-h-doc { font-size: 14px; color: var(--text-muted); font-weight: 500; }
  
  .qt-body { padding: 32px 28px; }

  .qt-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .qt-row-lbl { font-size: 13px; color: var(--text-muted); font-weight: 500; }
  
  /* Status pill */
  .qt-status { padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; border: 1px solid transparent; }
  
  .qt-stat-val { font-size: 24px; font-weight: 800; }
  .qt-stat-val.pos { color: var(--amber); }
  .qt-stat-val.time { color: var(--teal); }

  .qt-emerg { background: var(--red-bg); border: 1px solid var(--red-border); border-radius: var(--r); padding: 14px; text-align: center; color: var(--red-light); font-size: 13px; font-weight: 700; margin-bottom: 24px; }

  .qt-times { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r); padding: 16px; margin-bottom: 24px; }
  .qt-t-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
  .qt-t-row:last-child { margin-bottom: 0; }
  .qt-t-val { color: var(--text); font-weight: 500; }

  .qt-btn {
    width: 100%; padding: 12px 18px; border-radius: var(--r); font-size: 14px; font-weight: 700;
    cursor: pointer; border: 1px solid var(--border); font-family: var(--font);
    background: var(--surface2); color: var(--text); transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .qt-btn:hover { border-color: var(--border-hover); background: var(--surface3); }
  
  .qt-foot { text-align: center; font-size: 11px; color: var(--text-dim); margin-top: 24px; }

  .qt-nav { position: absolute; top: 24px; left: 24px; text-decoration: none; font-size: 13px; font-weight: 600; color: var(--text-muted); transition: color 0.15s; }
  .qt-nav:hover { color: var(--teal); }

  .qt-loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-size: 32px; background: var(--bg); color: var(--teal); }
  
  .qt-notfound { text-align: center; }
  .qt-notfound-i { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .qt-notfound-t { font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
  .qt-notfound-a { color: var(--teal); font-weight: 600; text-decoration: none; font-size: 14px; padding: 8px; display: inline-block; }
  .qt-notfound-a:hover { text-decoration: underline; color: var(--teal-light); }
`;

const STATUS_CONFIG = {
  waiting: { label: 'In Queue', style: { background: 'var(--amber-bg)', borderColor: 'var(--amber-border)', color: 'var(--amber)' }, icon: '⏳' },
  in_consultation: { label: 'In Consultation', style: { background: 'var(--green-bg)', borderColor: 'var(--green-border)', color: 'var(--green)' }, icon: '🩺' },
  completed: { label: 'Completed', style: { background: 'var(--teal-bg)', borderColor: 'var(--teal-border)', color: 'var(--teal)' }, icon: '✅' },
  no_show: { label: 'Missed', style: { background: 'var(--red-bg)', borderColor: 'var(--red-border)', color: 'var(--red-light)' }, icon: '❌' },
  cancelled: { label: 'Cancelled', style: { background: 'var(--gray-bg)', borderColor: 'var(--gray-border)', color: 'var(--gray)' }, icon: '🚫' },
};

export default function QueueTracker() {
  const { queueId } = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [called, setCalled] = useState(false);

  const fetchStatus = async () => {
    try {
      const result = await queueAPI.getStatus(queueId);
      setStatus(result.data);
    } catch (err) {
      console.error('Failed to fetch status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // poll every 30s

    // Also connect socket for instant updates
    const socket = connectSocket();
    joinQueueRoom(queueId);

    socket.on('patient-called', (data) => {
      setCalled(true);
      fetchStatus();
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🏥 Your turn!', { body: data.message });
      }
    });

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    return () => {
      clearInterval(interval);
      const s = getSocket();
      if (s) s.off('patient-called');
    };
  }, [queueId]);

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="qt-loading">
          <div className="animate-spin">⏳</div>
        </div>
      </>
    );
  }

  if (!status) {
    return (
      <>
        <style>{css}</style>
        <div className="qt-page">
          <div className="qt-accent-bar" />
          <a href="/" className="qt-nav">← Home</a>
          <div className="qt-card" style={{ padding: '40px 24px' }}>
            <div className="qt-notfound">
              <div className="qt-notfound-i">😕</div>
              <h2 className="qt-notfound-t">Queue entry not found</h2>
              <a href="/" className="qt-notfound-a">Register as new patient →</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  const statusCfg = STATUS_CONFIG[status.status] || STATUS_CONFIG.waiting;

  return (
    <>
      <style>{css}</style>
      <div className="qt-page">
        <div className="qt-accent-bar" />
        <a href="/" className="qt-nav">← Back to Home</a>

        {/* Called Alert */}
        {called && (
          <div className="qt-alert">
            <p className="qt-alert-title">🔔 It's your turn!</p>
            <p className="qt-alert-sub">Please proceed to the consultation room</p>
          </div>
        )}

        <div className="qt-card">
          {/* Header */}
          <div className="qt-header">
            <div className="qt-h-lbl">Your Token</div>
            <div className="qt-h-val">{status.token_number}</div>
            <div className="qt-h-doc">Dr. {status.doctor_name} • {status.department}</div>
          </div>

          {/* Status Body */}
          <div className="qt-body">
            <div className="qt-row">
              <span className="qt-row-lbl">Current Status</span>
              <span className="qt-status" style={statusCfg.style}>
                {statusCfg.icon} {statusCfg.label}
              </span>
            </div>

            {status.status === 'waiting' && (
              <>
                <div className="qt-row">
                  <span className="qt-row-lbl">Position in Queue</span>
                  <span className="qt-stat-val pos">#{status.position_in_queue}</span>
                </div>
                <div className="qt-row">
                  <span className="qt-row-lbl">Estimated Wait</span>
                  <span className="qt-stat-val time">{status.estimated_wait_minutes} min</span>
                </div>
              </>
            )}

            {status.is_emergency && (
              <div className="qt-emerg">
                🚨 Emergency Priority - You'll be seen urgently
              </div>
            )}

            <div className="qt-times">
              <div className="qt-t-row">
                <span>Registered At</span>
                <span className="qt-t-val">{new Date(status.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {status.called_at && (
                <div className="qt-t-row" style={{ marginTop: 10 }}>
                  <span>Called At</span>
                  <span className="qt-t-val">{new Date(status.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

            <button onClick={fetchStatus} className="qt-btn">
              🔄 Refresh Status
            </button>
          </div>
        </div>

        <div className="qt-foot">
          Auto-refreshes every 30 seconds • Bookmark this page to track your status
        </div>
      </div>
    </>
  );
}
