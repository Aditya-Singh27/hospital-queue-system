import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

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
    --text: #eaf0fb;
    --text-muted: #7e92b4;
    --text-dim: #3d5070;
    --r: 10px;
    --r-lg: 14px;
    --font: 'Plus Jakarta Sans', sans-serif;
  }

  * { box-sizing: border-box; }

  .lg-page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    display: flex; flex-direction: column;
  }

  .lg-accent-bar {
    height: 2px; width: 100%;
    background: linear-gradient(90deg, transparent 0%, var(--teal-dim) 25%, var(--teal) 50%, var(--teal-light) 75%, transparent 100%);
    box-shadow: 0 0 12px rgba(15,214,194,0.35);
  }

  .lg-center {
    flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px;
  }

  .lg-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 40px 32px;
    width: 100%; max-width: 420px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.5);
  }

  .lg-logo {
    display: flex; align-items: center; justify-content: center; gap: 9px;
    font-weight: 800; font-size: 18px; color: var(--text);
    text-decoration: none; letter-spacing: -0.02em; margin-bottom: 24px;
  }
  .lg-logo-mark {
    width: 36px; height: 36px; border-radius: 8px;
    background: linear-gradient(135deg, var(--teal-dim), var(--teal));
    display: flex; align-items: center; justify-content: center; font-size: 16px;
    box-shadow: 0 0 12px rgba(15,214,194,0.3);
  }
  .lg-logo-q { color: var(--teal); }

  .lg-title { text-align: center; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 4px; }
  .lg-sub { text-align: center; font-size: 13px; color: var(--text-muted); margin-bottom: 32px; }

  /* Tabs */
  .lg-tabs {
    display: grid; grid-template-columns: 1fr 1fr;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 4px; margin-bottom: 24px; gap: 4px;
  }
  .lg-tab {
    padding: 10px 12px; border-radius: 7px; font-size: 13px; font-weight: 600;
    border: 1px solid transparent; background: transparent; color: var(--text-muted);
    cursor: pointer; font-family: var(--font); display: flex; align-items: center;
    justify-content: center; gap: 6px; transition: all 0.18s;
  }
  .lg-tab:hover:not(.sel) { color: var(--text); }
  .lg-tab.sel { background: var(--teal-bg); border-color: var(--teal-border); color: var(--teal); }

  .lg-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .lg-lbl { font-size: 11px; font-weight: 700; color: #a0b2cc; letter-spacing: 0.05em; text-transform: uppercase; }
  
  .lg-input {
    background: var(--surface3);
    border: 1px solid var(--border);
    border-radius: var(--r); padding: 12px 14px; font-size: 14px;
    color: var(--text); font-family: var(--font); width: 100%;
    transition: all 0.15s; outline: none;
  }
  .lg-input::placeholder { color: var(--text-dim); }
  .lg-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(15,214,194,0.1); background: #1c2a3e; }

  .lg-btn {
    width: 100%; padding: 12px 18px; border-radius: var(--r); font-size: 14px; font-weight: 700;
    cursor: pointer; border: none; font-family: var(--font);
    background: var(--teal); color: #080b12; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 0 16px rgba(15,214,194,0.2); margin-top: 24px;
  }
  .lg-btn:hover:not(:disabled) { background: var(--teal-light); box-shadow: 0 0 22px rgba(15,214,194,0.35); }
  .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

  .lg-demo { margin-top: 24px; padding: 12px; border-radius: var(--r); background: var(--surface2); border: 1px dashed var(--border); text-align: center; font-size: 11px; color: var(--text-dim); }
  
  .lg-footer { text-align: center; margin-top: 24px; font-size: 13px; color: var(--text-muted); }
  .lg-link { color: var(--teal); font-weight: 600; text-decoration: none; transition: color 0.15s; }
  .lg-link:hover { color: var(--teal-light); text-decoration: underline; }
`;

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'admin' });
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.email, form.password, form.role);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate(form.role === 'doctor' ? '/doctor/queue' : '/admin');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="lg-page">
        <div className="lg-accent-bar" />
        <div className="lg-center">
          <div className="lg-card">
            <div className="lg-logo">
              <div className="lg-logo-mark">🏥</div>
              Hospital<span className="lg-logo-q">Q</span>
            </div>

            <h1 className="lg-title">Staff Portal</h1>
            <p className="lg-sub">Secure access for hospital personnel</p>

            <div className="lg-tabs">
              {['admin', 'doctor'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`lg-tab ${form.role === r ? 'sel' : ''}`}
                >
                  {r === 'admin' ? '👤 Admin' : '🩺 Doctor'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="lg-field">
                <label className="lg-lbl">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="lg-input"
                  placeholder={form.role === 'admin' ? 'admin@hospital.com' : 'doctor@hospital.com'}
                />
              </div>

              <div className="lg-field" style={{ marginBottom: 0 }}>
                <label className="lg-lbl">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="lg-input"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={isLoading} className="lg-btn">
                {isLoading ? 'Authenticating...' : 'Secure Login →'}
              </button>
            </form>

            <div className="lg-demo">
              Demo access: {form.role === 'admin' ? 'admin@hospital.com' : 'doctor1@hospital.com'} <br /> Password: Admin@1234
            </div>

            <div className="lg-footer">
              Not staff? <a href="/" className="lg-link">Register for Queue →</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
