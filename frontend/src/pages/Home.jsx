import React from 'react';
import { Link } from 'react-router-dom';

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
    --text: #eaf0fb;
    --text-muted: #7e92b4;
    --text-dim: #3d5070;
    --r: 10px;
    --r-lg: 14px;
    --font: 'Plus Jakarta Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .hm-page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.5;
    position: relative;
    overflow: hidden;
  }

  /* Background Elements */
  .hm-bg-elements {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
  }
  .hm-bg-grid {
    position: absolute; inset: 0;
    background-image: 
      linear-gradient(to right, rgba(15,214,194,0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(15,214,194,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at center, black 0%, transparent 80%);
  }
  .hm-orb-1 {
    position: absolute; top: -100px; left: -100px;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(15,214,194,0.1) 0%, transparent 70%);
    filter: blur(60px); animation: float 15s ease-in-out infinite;
  }
  .hm-orb-2 {
    position: absolute; bottom: -200px; right: 10vw;
    width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(15,214,194,0.08) 0%, transparent 70%);
    filter: blur(80px); animation: float 20s ease-in-out infinite reverse;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-30px) scale(1.05); }
  }

  .hm-content-wrap { position: relative; z-index: 10; }

  .hm-accent-bar {
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, var(--teal-dim) 25%, var(--teal) 50%, var(--teal-light) 75%, transparent 100%);
    box-shadow: 0 0 12px rgba(15,214,194,0.35);
    position: relative; z-index: 50;
  }

  /* Nav */
  .hm-nav {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 58px;
    background: rgba(8,11,18,0.97);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .hm-logo {
    display: flex; align-items: center; gap: 9px;
    font-weight: 800; font-size: 15px; color: var(--text);
    text-decoration: none; letter-spacing: -0.02em;
  }
  .hm-logo-mark {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg, var(--teal-dim), var(--teal));
    display: flex; align-items: center;
    justify-content: center; font-size: 13px;
    box-shadow: 0 0 10px rgba(15,214,194,0.3);
  }
  .hm-logo-q { color: var(--teal); }
  .hm-nav-right { display: flex; gap: 8px; }
  
  .hm-nav-btn {
    padding: 6px 14px; border-radius: 8px; font-size: 13px;
    font-weight: 600; border: 1px solid var(--border); background: transparent;
    color: var(--text-muted); cursor: pointer; text-decoration: none;
    display: inline-flex; align-items: center; font-family: var(--font);
    transition: all 0.15s;
  }
  .hm-nav-btn:hover { border-color: var(--border-hover); color: var(--text); background: var(--surface2); }
  .hm-nav-btn.primary { background: var(--teal-bg); border-color: var(--teal-border); color: var(--teal); }
  .hm-nav-btn.primary:hover { background: rgba(15,214,194,0.13); border-color: var(--teal); }

  /* Hero Section */
  .hm-hero-wrap {
    max-width: 1000px; margin: 0 auto; padding: 60px 24px 80px;
    display: flex; gap: 40px; align-items: center; justify-content: space-between;
  }
  @media (max-width: 800px) {
    .hm-hero-wrap { flex-direction: column; text-align: center; }
  }

  .hm-hero-content { flex: 1; max-width: 500px; }
  
  .hm-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--teal-bg); border: 1px solid var(--teal-border);
    color: var(--teal); font-size: 11px; font-weight: 700;
    letter-spacing: 0.07em; text-transform: uppercase;
    padding: 4px 11px; border-radius: 99px; margin-bottom: 20px;
  }
  .hm-pill-dot { width: 5px; height: 5px; background: var(--teal); border-radius: 50%; animation: blink 2s ease infinite; box-shadow: 0 0 6px var(--teal); }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.25; } }

  .hm-h1 { font-size: 42px; font-weight: 800; letter-spacing: -0.03em; color: var(--text); line-height: 1.1; margin-bottom: 16px; }
  .hm-h1 em { font-style: normal; color: var(--teal); }
  .hm-desc { font-size: 16px; color: var(--text-muted); margin-bottom: 32px; line-height: 1.6; }

  .hm-actions { display: flex; gap: 12px; }
  @media (max-width: 800px) {
    .hm-actions { justify-content: center; }
  }
  .hm-btn-primary {
    padding: 12px 24px; border-radius: var(--r); font-size: 14px; font-weight: 700;
    text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
    background: var(--teal); color: #080b12; transition: all 0.15s;
    box-shadow: 0 0 16px rgba(15,214,194,0.2);
  }
  .hm-btn-primary:hover { background: var(--teal-light); box-shadow: 0 0 22px rgba(15,214,194,0.35); transform: translateY(-1px); }
  
  .hm-btn-secondary {
    padding: 12px 24px; border-radius: var(--r); font-size: 14px; font-weight: 700;
    text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid var(--border); background: var(--surface2); color: var(--text);
    transition: all 0.15s;
  }
  .hm-btn-secondary:hover { border-color: var(--border-hover); background: var(--surface3); }

  /* Dashboard Preview */
  .hm-hero-visual { flex: 1; max-width: 400px; width: 100%; position: relative; perspective: 1000px; }
  .hm-visual-glow {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 300px; height: 300px; background: var(--teal); filter: blur(100px); opacity: 0.15; z-index: 0;
  }
  .hm-dashboard {
    position: relative; z-index: 1;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 20px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.5);
  }

  .hm-db-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;
  }
  .hm-db-title { font-size: 14px; font-weight: 700; color: var(--text); }
  .hm-db-sub { font-size: 11px; color: var(--text-dim); }
  
  .hm-db-item {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 12px; margin-bottom: 12px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .hm-db-dept { font-size: 13px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .hm-db-icon { width: 28px; height: 28px; border-radius: 6px; background: var(--surface3); display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .hm-db-status { font-size: 11px; color: var(--text-muted); margin-top: 2px;}
  .hm-db-num { font-size: 16px; font-weight: 800; color: var(--teal); text-align: right; }
  
  .hm-db-highlight {
    background: linear-gradient(135deg, rgba(15,214,194,0.1), rgba(15,214,194,0.02));
    border: 1px solid var(--teal-border); border-radius: var(--r); padding: 16px;
    display: flex; justify-content: space-between; align-items: center; margin-top: 16px;
  }
  .hm-dbh-lbl { font-size: 11px; font-weight: 600; color: var(--teal); text-transform: uppercase; letter-spacing: 0.05em; }
  .hm-dbh-val { font-size: 24px; font-weight: 800; color: var(--text); }
  
  /* Features Section */
  .hm-features-wrap { max-width: 1000px; margin: 0 auto; padding: 40px 24px 80px; }
  .hm-section-title { text-align: center; margin-bottom: 48px; }
  .hm-st-badge { font-size: 11px; font-weight: 700; color: var(--teal); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; display: block; }
  .hm-st-text { font-size: 28px; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }

  .hm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
  .hm-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 28px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    transition: all 0.2s;
  }
  .hm-card:hover { border-color: var(--teal-border); background: var(--surface2); transform: translateY(-2px); }
  
  .hm-card-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--teal-bg); border: 1px solid var(--teal-border);
    color: var(--teal); display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 20px;
  }
  .hm-card-title { font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
  .hm-card-desc { font-size: 14px; color: var(--text-muted); line-height: 1.5; }
`;

export default function Home() {
  return (
    <>
      <style>{css}</style>
      <div className="hm-page">
        {/* Animated Background Elements */}
        <div className="hm-bg-elements">
          <div className="hm-bg-grid" />
          <div className="hm-orb-1" />
          <div className="hm-orb-2" />
        </div>

        <div className="hm-accent-bar" />

        <div className="hm-content-wrap">
          {/* Navigation */}
          <nav className="hm-nav">
            <Link to="/" className="hm-logo">
              <div className="hm-logo-mark">🏥</div>
              Hospital<span className="hm-logo-q">Q</span>
            </Link>
            <div className="hm-nav-right">
              <Link to="/login" className="hm-nav-btn">Staff Login</Link>
              <Link to="/register" className="hm-nav-btn primary">Get Started →</Link>
            </div>
          </nav>

          {/* Hero Section */}
          <main>
            <div className="hm-hero-wrap">
              <div className="hm-hero-content">
                <div className="hm-pill"><span className="hm-pill-dot" /> System Online • Live Queue Tracking</div>
                <h1 className="hm-h1">Smart Hospital<br /><em>Queue Management</em></h1>
                <p className="hm-desc">
                  Reduce waiting time, improve patient experience, and streamline hospital operations with an intelligent queue system.
                </p>

                <div className="hm-actions">
                  <Link to="/register" className="hm-btn-primary">Get a Ticket →</Link>
                  <Link to="/login" className="hm-btn-secondary">View Queue Board</Link>
                </div>
              </div>

              <div className="hm-hero-visual">
                <div className="hm-visual-glow" />
                <div className="hm-dashboard">
                  <div className="hm-db-header">
                    <div>
                      <div className="hm-db-title">Live Queue Board</div>
                      <div className="hm-db-sub">Updated just now</div>
                    </div>
                    <div className="hm-pill-dot" />
                  </div>

                  <div className="hm-db-item">
                    <div className="hm-db-dept"><div className="hm-db-icon">🚨</div> Emergency</div>
                    <div className="hm-db-num">E-042 <div className="hm-db-status">Now Serving</div></div>
                  </div>
                  <div className="hm-db-item">
                    <div className="hm-db-dept"><div className="hm-db-icon">🩺</div> General</div>
                    <div className="hm-db-num">G-128 <div className="hm-db-status">Now Serving</div></div>
                  </div>
                  <div className="hm-db-item">
                    <div className="hm-db-dept"><div className="hm-db-icon">❤️</div> Cardiology</div>
                    <div className="hm-db-num">C-015 <div className="hm-db-status">Now Serving</div></div>
                  </div>

                  <div className="hm-db-highlight">
                    <div>
                      <div className="hm-dbh-lbl">Your Ticket</div>
                      <div className="hm-dbh-val">G-130</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="hm-dbh-lbl">Est. Wait</div>
                      <div className="hm-dbh-val" style={{ color: 'var(--teal)' }}>18 min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="hm-features-wrap">
              <div className="hm-section-title">
                <span className="hm-st-badge">Why Hospital Queue?</span>
                <h2 className="hm-st-text">Built for efficiency. Designed for care.</h2>
              </div>

              <div className="hm-grid">
                <div className="hm-card">
                  <div className="hm-card-icon">⚡</div>
                  <h3 className="hm-card-title">Instant Ticketing</h3>
                  <p className="hm-card-desc">Get your queue number in seconds. No forms, no paperwork. Simply check-in digitally.</p>
                </div>
                <div className="hm-card">
                  <div className="hm-card-icon">⏱️</div>
                  <h3 className="hm-card-title">Real-Time Updates</h3>
                  <p className="hm-card-desc">Live queue board keeps everyone informed. No more wondering when your turn will come.</p>
                </div>
                <div className="hm-card">
                  <div className="hm-card-icon">📊</div>
                  <h3 className="hm-card-title">Smart Analytics</h3>
                  <p className="hm-card-desc">Track department performance and average wait times effortlessly from the dashboard.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
