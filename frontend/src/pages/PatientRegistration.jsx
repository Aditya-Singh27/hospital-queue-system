import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { queueAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';

const SYMPTOM_SUGGESTIONS = [
  { label: 'Chest Pain', icon: '💔' },
  { label: 'Fever', icon: '🌡️' },
  { label: 'Headache', icon: '🤕' },
  { label: 'Cough', icon: '😮‍💨' },
  { label: 'Abdominal Pain', icon: '🤢' },
  { label: 'Back Pain', icon: '🦴' },
  { label: 'Breathing Difficulty', icon: '🫁' },
  { label: 'Nausea', icon: '🤮' },
  { label: 'Rash / Skin', icon: '🩹' },
  { label: 'Follow-up Visit', icon: '📋' },
  { label: 'Dizziness', icon: '😵' },
  { label: 'Joint Pain', icon: '🦵' },
  { label: 'Eye Problems', icon: '👁️' },
  { label: 'Ear Pain', icon: '👂' },
];

const AMBULANCE_REASONS = [
  { label: 'Chest Pain / Heart Attack', icon: '❤️‍🔥' },
  { label: 'Road Accident / Trauma', icon: '🚗' },
  { label: 'Stroke / Unconscious', icon: '🧠' },
  { label: 'Severe Breathing Difficulty', icon: '🫁' },
  { label: 'High-risk Pregnancy', icon: '🤱' },
  { label: 'Snake Bite / Poisoning', icon: '🐍' },
];

const STEPS = [
  { label: 'Patient Info' },
  { label: 'Symptoms' },
  { label: 'Doctor' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --bg: #0f1117;
    --surface: #181c27;
    --surface2: #1e2436;
    --surface3: #242a3d;
    --border: #2a3147;
    --border-hover: #3a4260;
    --teal: #14b8a6;
    --teal-light: #2dd4bf;
    --teal-bg: rgba(20,184,166,0.08);
    --teal-border: rgba(20,184,166,0.3);
    --red: #ef4444;
    --red-light: #f87171;
    --red-bg: rgba(239,68,68,0.07);
    --red-border: rgba(239,68,68,0.28);
    --amber: #f59e0b;
    --text: #f1f5f9;
    --text-muted: #8892aa;
    --text-dim: #4a5568;
    --r: 10px;
    --r-lg: 14px;
    --font: 'Plus Jakarta Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pr {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.5;
  }

  .pr-accent-bar {
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, var(--teal) 35%, var(--teal-light) 65%, transparent 100%);
  }

  /* Nav */
  .pr-nav {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 58px;
    background: rgba(15,17,23,0.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .pr-logo {
    display: flex; align-items: center; gap: 9px;
    font-weight: 800; font-size: 15px; color: var(--text);
    text-decoration: none; letter-spacing: -0.02em;
  }
  .pr-logo-mark {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--teal); display: flex; align-items: center;
    justify-content: center; font-size: 13px;
  }
  .pr-logo-q { color: var(--teal); }
  .pr-nav-right { display: flex; gap: 8px; }
  .pr-nav-btn {
    padding: 6px 14px; border-radius: 8px; font-size: 13px;
    font-weight: 600; border: 1px solid var(--border); background: transparent;
    color: var(--text-muted); cursor: pointer; text-decoration: none;
    display: inline-flex; align-items: center; font-family: var(--font);
    transition: all 0.15s;
  }
  .pr-nav-btn:hover { border-color: var(--border-hover); color: var(--text); }
  .pr-nav-btn.primary { background: var(--teal-bg); border-color: var(--teal-border); color: var(--teal); }
  .pr-nav-btn.primary:hover { background: rgba(20,184,166,0.14); }

  /* Page */
  .pr-page { max-width: 700px; margin: 0 auto; padding: 44px 24px 80px; }

  /* Header */
  .pr-header { margin-bottom: 36px; }
  .pr-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--teal-bg); border: 1px solid var(--teal-border);
    color: var(--teal); font-size: 11px; font-weight: 700;
    letter-spacing: 0.07em; text-transform: uppercase;
    padding: 4px 11px; border-radius: 99px; margin-bottom: 16px;
  }
  .pr-pill-dot { width: 5px; height: 5px; background: var(--teal); border-radius: 50%; animation: blink 2s ease infinite; }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

  .pr-h1 { font-size: 34px; font-weight: 800; letter-spacing: -0.03em; color: var(--text); line-height: 1.1; margin-bottom: 8px; }
  .pr-h1 em { font-style: normal; color: var(--teal); }
  .pr-desc { font-size: 14px; color: var(--text-muted); max-width: 380px; }

  .pr-stats { display: flex; gap: 24px; margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--border); }
  .pr-s-num { font-size: 19px; font-weight: 800; color: var(--teal); letter-spacing: -0.02em; }
  .pr-s-lbl { font-size: 11px; color: var(--text-dim); margin-top: 1px; text-transform: uppercase; letter-spacing: 0.06em; }

  /* Emergency bar */
  .pr-emerg-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    background: var(--red-bg); border: 1px solid var(--red-border);
    border-radius: var(--r); padding: 13px 16px; margin-bottom: 18px;
  }
  .pr-eb-left { display: flex; align-items: center; gap: 11px; }
  .pr-eb-ico {
    width: 34px; height: 34px; border-radius: 8px;
    background: rgba(239,68,68,0.1); display: flex; align-items: center;
    justify-content: center; font-size: 15px; flex-shrink: 0;
  }
  .pr-eb-title { font-size: 13px; font-weight: 700; color: var(--red-light); }
  .pr-eb-sub { font-size: 11px; color: #9ca3af; margin-top: 1px; }
  .pr-eb-btn {
    flex-shrink: 0; padding: 7px 15px; border-radius: 8px; font-size: 12px;
    font-weight: 700; background: rgba(239,68,68,0.12); border: 1px solid var(--red-border);
    color: var(--red-light); cursor: pointer; font-family: var(--font); transition: all 0.15s;
  }
  .pr-eb-btn:hover { background: rgba(239,68,68,0.2); }

  /* Tabs */
  .pr-tabs {
    display: grid; grid-template-columns: 1fr 1fr;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 4px; margin-bottom: 22px; gap: 4px;
  }
  .pr-tab {
    padding: 9px 12px; border-radius: 7px; font-size: 13px; font-weight: 600;
    border: 1px solid transparent; background: transparent; color: var(--text-muted);
    cursor: pointer; font-family: var(--font); display: flex; align-items: center;
    justify-content: center; gap: 6px; transition: all 0.18s;
  }
  .pr-tab:hover:not(.t-teal):not(.t-red) { color: var(--text); }
  .pr-tab.t-teal { background: var(--teal-bg); border-color: var(--teal-border); color: var(--teal); }
  .pr-tab.t-red { background: var(--red-bg); border-color: var(--red-border); color: var(--red-light); }

  /* Steps */
  .pr-steps { display: flex; align-items: flex-start; justify-content: center; margin-bottom: 24px; }
  .pr-step-item { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .pr-step-num {
    width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-size: 12px; font-weight: 700;
    border: 1.5px solid var(--border); color: var(--text-dim); background: var(--surface2);
    transition: all 0.25s;
  }
  .pr-step-num.done { border-color: var(--teal); color: var(--teal); background: var(--teal-bg); }
  .pr-step-num.active { background: var(--teal); border-color: var(--teal); color: #0f1117; }
  .pr-step-name { font-size: 11px; font-weight: 600; color: var(--text-dim); white-space: nowrap; transition: color 0.25s; }
  .pr-step-name.done { color: var(--teal); }
  .pr-step-name.active { color: var(--text); }
  .pr-step-connector { width: 52px; height: 1px; background: var(--border); margin: 0 6px; position: relative; top: 15px; transition: background 0.25s; flex-shrink: 0; }
  .pr-step-connector.done { background: var(--teal); }

  /* Card */
  .pr-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 28px;
  }
  .pr-card-hd { font-size: 16px; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 2px; }
  .pr-card-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 22px; }

  /* Emergency toggle row */
  .pr-etoggle {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: var(--r); border: 1px solid var(--border);
    background: var(--surface2); cursor: pointer; width: 100%; text-align: left;
    font-family: var(--font); margin-bottom: 22px; transition: all 0.18s;
  }
  .pr-etoggle:hover { border-color: rgba(239,68,68,0.2); }
  .pr-etoggle.on { border-color: var(--red-border); background: var(--red-bg); }
  .pr-etoggle-ico {
    width: 32px; height: 32px; border-radius: 8px; background: var(--surface3);
    display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
    transition: background 0.18s;
  }
  .pr-etoggle.on .pr-etoggle-ico { background: rgba(239,68,68,0.12); }
  .pr-etoggle-body { flex: 1; }
  .pr-etoggle-lbl { font-size: 13px; font-weight: 700; color: var(--text); display: block; }
  .pr-etoggle-desc { font-size: 11px; color: var(--text-muted); display: block; margin-top: 1px; }
  .pr-sw { width: 36px; height: 20px; border-radius: 99px; background: var(--surface3); position: relative; flex-shrink: 0; transition: background 0.2s; border: 1px solid var(--border); }
  .pr-etoggle.on .pr-sw { background: var(--red); border-color: var(--red); }
  .pr-sw-dot { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.35); }
  .pr-etoggle.on .pr-sw-dot { transform: translateX(16px); }

  /* Form */
  .pr-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
  @media (max-width: 500px) { .pr-g2 { grid-template-columns: 1fr; } .pr-card { padding: 18px; } .pr-nav { padding: 0 16px; } .pr-h1 { font-size: 26px; } }

  .pr-field { display: flex; flex-direction: column; gap: 5px; }
  .pr-lbl { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; }
  .pr-req { color: var(--teal); margin-left: 2px; }

  .pr-input, .pr-select, .pr-textarea {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 10px 12px; font-size: 14px;
    color: var(--text); font-family: var(--font); width: 100%;
    transition: border-color 0.15s, box-shadow 0.15s; outline: none;
  }
  .pr-input::placeholder, .pr-textarea::placeholder { color: var(--text-dim); }
  .pr-input:focus, .pr-select:focus, .pr-textarea:focus {
    border-color: var(--teal); box-shadow: 0 0 0 3px rgba(20,184,166,0.1);
  }
  .pr-input.bad { border-color: var(--red); }
  .pr-input.bad:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
  .pr-select {
    cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238892aa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
  }
  .pr-select option { background: #1e2436; }
  .pr-textarea { resize: none; line-height: 1.6; }
  .pr-err { font-size: 11px; color: #f87171; font-weight: 600; }
  .pr-hint { font-size: 11px; color: var(--text-dim); }

  /* Phone */
  .pr-phone { display: flex; }
  .pr-phone-pre {
    padding: 10px 11px; background: var(--surface3); border: 1px solid var(--border);
    border-right: none; border-radius: var(--r) 0 0 var(--r); font-size: 13px;
    color: var(--text-muted); white-space: nowrap; display: flex; align-items: center; font-family: var(--font);
  }
  .pr-phone .pr-input { border-radius: 0 var(--r) var(--r) 0; }

  /* Symptom area */
  .pr-sym-box {
    min-height: 42px; padding: 9px 11px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r); display: flex; flex-wrap: wrap; gap: 6px;
    align-items: center; margin-bottom: 14px;
  }
  .pr-sym-box.filled { border-color: var(--teal-border); background: rgba(20,184,166,0.05); }
  .pr-sym-tag {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(20,184,166,0.12); border: 1px solid var(--teal-border);
    color: var(--teal-light); padding: 3px 9px 3px 8px; border-radius: 99px;
    font-size: 12px; font-weight: 600;
  }
  .pr-sym-rm {
    background: none; border: none; color: rgba(45,212,191,0.4); cursor: pointer;
    font-size: 11px; padding: 0; line-height: 1; font-family: var(--font); transition: color 0.15s;
  }
  .pr-sym-rm:hover { color: var(--teal); }
  .pr-sym-placeholder { font-size: 12px; color: var(--text-dim); }

  .pr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .pr-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 99px; font-size: 12px; font-weight: 600;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--text-muted); cursor: pointer; font-family: var(--font);
    transition: all 0.15s; user-select: none;
  }
  .pr-chip:hover { border-color: var(--border-hover); color: var(--text); }
  .pr-chip.on { border-color: var(--teal-border); background: var(--teal-bg); color: var(--teal-light); }

  .pr-or { display: flex; align-items: center; gap: 10px; margin: 16px 0; }
  .pr-or-line { flex: 1; height: 1px; background: var(--border); }
  .pr-or-txt { font-size: 11px; color: var(--text-dim); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

  .pr-add-row { display: flex; gap: 8px; }
  .pr-add-btn {
    flex-shrink: 0; padding: 10px 15px; border-radius: var(--r); font-size: 13px;
    font-weight: 700; border: 1px solid var(--teal-border); background: var(--teal-bg);
    color: var(--teal); cursor: pointer; font-family: var(--font); transition: all 0.15s;
  }
  .pr-add-btn:hover { background: rgba(20,184,166,0.14); }

  /* Doctors */
  .pr-docs { display: flex; flex-direction: column; gap: 7px; margin-top: 8px; }
  .pr-doc {
    display: flex; align-items: center; gap: 11px; padding: 12px 13px;
    border-radius: var(--r); border: 1px solid var(--border); background: var(--surface2);
    cursor: pointer; text-align: left; width: 100%; font-family: var(--font); transition: all 0.15s;
  }
  .pr-doc:hover { border-color: var(--border-hover); }
  .pr-doc.sel { border-color: var(--teal); background: rgba(20,184,166,0.06); }
  .pr-doc-av {
    width: 36px; height: 36px; border-radius: 8px; background: var(--surface3);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: var(--teal); flex-shrink: 0;
  }
  .pr-doc-inf { flex: 1; min-width: 0; }
  .pr-doc-name { font-size: 13px; font-weight: 700; color: var(--text); display: block; }
  .pr-doc-spec { font-size: 12px; color: var(--text-muted); margin-top: 1px; display: block; }
  .pr-doc-badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; white-space: nowrap; flex-shrink: 0; background: var(--teal-bg); color: var(--teal); border: 1px solid var(--teal-border); }
  .pr-doc-badge.busy { background: rgba(245,158,11,0.1); color: var(--amber); border-color: rgba(245,158,11,0.25); }
  .pr-doc-chk { width: 17px; height: 17px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; font-size: 9px; color: #0f1117; font-weight: 900; opacity: 0; transition: opacity 0.2s; flex-shrink: 0; }
  .pr-doc.sel .pr-doc-chk { opacity: 1; }
  .pr-no-doc { text-align: center; padding: 26px; color: var(--text-dim); font-size: 13px; border: 1px dashed var(--border); border-radius: var(--r); }

  /* Footer nav */
  .pr-foot { display: flex; gap: 9px; margin-top: 26px; padding-top: 20px; border-top: 1px solid var(--border); }
  .pr-btn-back { padding: 10px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--text-muted); transition: all 0.15s; font-family: var(--font); }
  .pr-btn-back:hover { border-color: var(--border-hover); color: var(--text); }
  .pr-btn-next { flex: 1; padding: 10px 18px; border-radius: var(--r); font-size: 14px; font-weight: 700; cursor: pointer; border: none; font-family: var(--font); background: var(--teal); color: #0f1117; transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .pr-btn-next:hover { background: var(--teal-light); }
  .pr-btn-next:disabled { opacity: 0.35; cursor: not-allowed; }
  .pr-btn-next.danger { background: var(--red); color: white; }
  .pr-btn-next.danger:hover { background: var(--red-light); }

  /* Ambulance */
  .pr-amb-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--red-bg); border: 1px solid var(--red-border); border-radius: var(--r); padding: 13px 16px; margin-bottom: 16px; }
  .pr-amb-txt { font-size: 13px; font-weight: 700; color: var(--red-light); }
  .pr-amb-sub { font-size: 11px; color: #9ca3af; margin-top: 1px; }
  .pr-call-btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 800; background: rgba(239,68,68,0.12); border: 1px solid var(--red-border); color: var(--red-light); text-decoration: none; font-family: var(--font); transition: all 0.15s; white-space: nowrap; }
  .pr-call-btn:hover { background: rgba(239,68,68,0.22); }

  .pr-reasons { display: flex; flex-wrap: wrap; gap: 7px; }
  .pr-reason { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; border: 1px solid var(--border); background: var(--surface2); color: var(--text-muted); cursor: pointer; font-family: var(--font); transition: all 0.15s; }
  .pr-reason:hover { border-color: var(--red-border); color: var(--red-light); }
  .pr-reason.on { border-color: var(--red-border); background: var(--red-bg); color: var(--red-light); }

  .pr-how { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r); padding: 15px 17px; }
  .pr-how-ttl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-dim); margin-bottom: 12px; }
  .pr-how-row { display: flex; gap: 10px; margin-bottom: 9px; }
  .pr-how-row:last-child { margin-bottom: 0; }
  .pr-how-n { width: 19px; height: 19px; border-radius: 50%; flex-shrink: 0; background: rgba(239,68,68,0.1); border: 1px solid var(--red-border); color: var(--red-light); font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  .pr-how-t { font-size: 12px; color: var(--text-muted); line-height: 1.5; padding-top: 1px; }

  .pr-stack > * + * { margin-top: 15px; }

  /* Success */
  .pr-suc { min-height: 100vh; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .pr-suc-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 40px 32px; max-width: 400px; width: 100%; text-align: center; }
  .pr-suc-ico { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px; background: var(--teal-bg); border: 1.5px solid var(--teal-border); display: flex; align-items: center; justify-content: center; font-size: 26px; }
  .pr-suc-ico.red-ico { background: var(--red-bg); border-color: var(--red-border); }
  .pr-suc-title { font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.03em; margin-bottom: 5px; }
  .pr-suc-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 22px; }

  .pr-token-box { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r); padding: 18px; margin-bottom: 12px; }
  .pr-token-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--teal); margin-bottom: 3px; }
  .pr-token-val { font-size: 44px; font-weight: 800; color: var(--text); letter-spacing: 0.08em; line-height: 1; }

  .pr-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 14px; }
  .pr-meta-cell { background: var(--surface2); border-radius: var(--r); padding: 13px; }
  .pr-meta-lbl { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
  .pr-meta-val { font-size: 21px; font-weight: 800; color: var(--text); }

  .pr-qid { font-size: 11px; color: var(--text-dim); margin-bottom: 20px; }
  .pr-qid code { background: var(--surface2); padding: 2px 6px; border-radius: 5px; color: var(--text-muted); font-family: monospace; }

  .pr-suc-btns { display: flex; gap: 8px; }
  .pr-suc-p { flex: 1; padding: 10px; border-radius: var(--r); font-size: 13px; font-weight: 700; cursor: pointer; border: none; background: var(--teal); color: #0f1117; font-family: var(--font); transition: background 0.15s; }
  .pr-suc-p:hover { background: var(--teal-light); }
  .pr-suc-s { flex: 1; padding: 10px; border-radius: var(--r); font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font); transition: all 0.15s; }
  .pr-suc-s:hover { border-color: var(--border-hover); color: var(--text); }

  .pr-hotline { background: var(--red-bg); border: 1px solid var(--red-border); border-radius: var(--r); padding: 15px; margin-bottom: 14px; }
  .pr-hotline-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 3px; }
  .pr-hotline-num { font-size: 32px; font-weight: 800; color: var(--red-light); line-height: 1; }

  .pr-tips { text-align: left; margin-bottom: 18px; }
  .pr-tips-ttl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-dim); margin-bottom: 9px; }
  .pr-tip { display: flex; gap: 8px; margin-bottom: 6px; }
  .pr-tip-n { width: 17px; height: 17px; border-radius: 50%; flex-shrink: 0; background: var(--red-bg); color: var(--red-light); font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
  .pr-tip-t { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
`;

export default function PatientRegistration() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [registeredTicket, setRegisteredTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [ambulanceLoading, setAmbulanceLoading] = useState(false);
  const [ambulanceSubmitted, setAmbulanceSubmitted] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [step, setStep] = useState(0);
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({ defaultValues: { gender: 'male' } });
  const ambulanceForm = useForm();
  const watchDept = watch('department');

  useEffect(() => {
    doctorAPI.getDepartments()
      .then(r => setDepartments(r.data.data || r.data || []))
      .catch(() => setDepartments(['Cardiology', 'General Medicine', 'Orthopedics', 'Neurology', 'Pediatrics']));
  }, []);

  useEffect(() => {
    if (watchDept) {
      doctorAPI.getAll({ department: watchDept, available: true })
        .then(r => { setDoctors(r.data.data || r.data || []); setSelectedDoctorId(''); })
        .catch(() => setDoctors([]));
    }
  }, [watchDept]);

  useEffect(() => { setValue('symptoms', selectedSymptoms.join(', ')); }, [selectedSymptoms, setValue]);

  const toggleSym = (l) => setSelectedSymptoms(p => p.includes(l) ? p.filter(s => s !== l) : [...p, l]);
  const removeSym = (l) => setSelectedSymptoms(p => p.filter(s => s !== l));
  const addCustom = () => {
    const t = customSymptom.trim();
    if (t && !selectedSymptoms.includes(t)) setSelectedSymptoms(p => [...p, t]);
    setCustomSymptom('');
  };

  const nextStep = async () => {
    const map = [['name', 'phone', 'age'], ['symptoms'], ['department']];
    if (await trigger(map[step])) setStep(s => Math.min(s + 1, 2));
  };

  const onSubmit = async (data) => {
    if (!selectedDoctorId) { toast.error('Please select a doctor'); return; }
    setLoading(true);
    try {
      const res = await queueAPI.register({ ...data, symptoms: selectedSymptoms.join(', '), doctorId: selectedDoctorId, age: parseInt(data.age), isEmergency });
      setRegisteredTicket(res.data.data || res.data);
      toast.success('Registered successfully!');
    } catch (e) { toast.error(e.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const onAmb = async () => {
    if (!selectedReason) { toast.error('Select an emergency reason'); return; }
    setAmbulanceLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setAmbulanceSubmitted(true);
    setAmbulanceLoading(false);
    toast.success('🚑 Ambulance dispatched!');
  };

  const reset = () => { setRegisteredTicket(null); setStep(0); setIsEmergency(false); setSelectedDoctorId(''); setSelectedSymptoms([]); };

  // Success screens
  if (registeredTicket) return (
    <>
      <style>{css}</style>
      <div className="pr-suc">
        <div className="pr-suc-card">
          <div className="pr-suc-ico">✓</div>
          <div className="pr-suc-title">You're in the queue</div>
          <div className="pr-suc-sub">Token issued. Please wait for your number to be called.</div>
          <div className="pr-token-box">
            <div className="pr-token-lbl">Token Number</div>
            <div className="pr-token-val">{registeredTicket.token}</div>
          </div>
          <div className="pr-meta">
            <div className="pr-meta-cell">
              <div className="pr-meta-lbl">Est. Wait</div>
              <div className="pr-meta-val">{registeredTicket.estimatedWaitMinutes}<span style={{fontSize:13,fontWeight:500,color:'var(--text-muted)'}}> min</span></div>
            </div>
            <div className="pr-meta-cell">
              <div className="pr-meta-lbl">Position</div>
              <div className="pr-meta-val">#{registeredTicket.position}</div>
            </div>
          </div>
          <p className="pr-qid">Queue ID: <code>{registeredTicket.queueId}</code></p>
          <div className="pr-suc-btns">
            <button className="pr-suc-p" onClick={() => window.location.href = `/track/${registeredTicket.queueId}`}>Track Status →</button>
            <button className="pr-suc-s" onClick={reset}>New Patient</button>
          </div>
        </div>
      </div>
    </>
  );

  if (ambulanceSubmitted) return (
    <>
      <style>{css}</style>
      <div className="pr-suc">
        <div className="pr-suc-card">
          <div className="pr-suc-ico red-ico">🚑</div>
          <div className="pr-suc-title">Ambulance Dispatched</div>
          <div className="pr-suc-sub">Our team is on the way to your location.</div>
          <div className="pr-hotline">
            <div className="pr-hotline-lbl">Emergency Helpline</div>
            <div className="pr-hotline-num">📞 108</div>
          </div>
          <div className="pr-tips">
            <p className="pr-tips-ttl">While you wait</p>
            {['Stay calm, keep patient still', 'Ensure airways are clear', 'Apply pressure to any wounds', 'Do not give food or water', 'Stay at the pickup location'].map((t, i) => (
              <div key={i} className="pr-tip">
                <span className="pr-tip-n">{i + 1}</span>
                <span className="pr-tip-t">{t}</span>
              </div>
            ))}
          </div>
          <button className="pr-suc-s" style={{ width: '100%' }} onClick={() => { setAmbulanceSubmitted(false); setSelectedReason(''); ambulanceForm.reset(); }}>
            Request Another Ambulance
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="pr">
        <div className="pr-accent-bar" />

        <nav className="pr-nav">
          <a href="/" className="pr-logo">
            <div className="pr-logo-mark">🏥</div>
            Hospital<span className="pr-logo-q">Q</span>
          </a>
          <div className="pr-nav-right">
            <a href="/track" className="pr-nav-btn">Track Queue</a>
            <a href="/login" className="pr-nav-btn primary">Staff Login →</a>
          </div>
        </nav>

        <div className="pr-page">

          {/* Header */}
          <div className="pr-header">
            <div className="pr-pill"><span className="pr-pill-dot" /> Live Queue System</div>
            <h1 className="pr-h1">Register for <em>Queue</em></h1>
            <p className="pr-desc">Smart, priority-based patient registration with real-time wait tracking.</p>
            <div className="pr-stats">
              <div><div className="pr-s-num">2.4x</div><div className="pr-s-lbl">Faster</div></div>
              <div><div className="pr-s-num">98%</div><div className="pr-s-lbl">Accuracy</div></div>
              <div><div className="pr-s-num">24/7</div><div className="pr-s-lbl">Available</div></div>
            </div>
          </div>

          {/* Emergency bar */}
          <div className="pr-emerg-bar">
            <div className="pr-eb-left">
              <div className="pr-eb-ico">🚑</div>
              <div>
                <div className="pr-eb-title">Need an Ambulance?</div>
                <div className="pr-eb-sub">Free rural & village pickup available</div>
              </div>
            </div>
            <button className="pr-eb-btn" onClick={() => setActiveTab('ambulance')}>Request →</button>
          </div>

          {/* Tabs */}
          <div className="pr-tabs">
            <button className={`pr-tab ${activeTab === 'register' ? 't-teal' : ''}`} onClick={() => setActiveTab('register')}>🏥 Register for Queue</button>
            <button className={`pr-tab ${activeTab === 'ambulance' ? 't-red' : ''}`} onClick={() => setActiveTab('ambulance')}>🚑 Ambulance Service</button>
          </div>

          {/* REGISTER */}
          {activeTab === 'register' && (<>
            <div className="pr-steps">
              {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="pr-step-item">
                    <div className={`pr-step-num ${i < step ? 'done' : i === step ? 'active' : ''}`}>{i < step ? '✓' : i + 1}</div>
                    <span className={`pr-step-name ${i < step ? 'done' : i === step ? 'active' : ''}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`pr-step-connector ${i < step ? 'done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>

            <div className="pr-card">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 0 */}
                {step === 0 && (<>
                  <div className="pr-card-hd">Patient Information</div>
                  <div className="pr-card-sub">Enter the patient's basic details</div>
                  <button type="button" className={`pr-etoggle ${isEmergency ? 'on' : ''}`} onClick={() => setIsEmergency(e => !e)}>
                    <div className="pr-etoggle-ico">🚨</div>
                    <div className="pr-etoggle-body">
                      <span className="pr-etoggle-lbl">Emergency Case</span>
                      <span className="pr-etoggle-desc">Priority boost in queue for critical conditions</span>
                    </div>
                    <div className="pr-sw"><div className="pr-sw-dot" /></div>
                  </button>
                  <div className="pr-g2">
                    <div className="pr-field" style={{ gridColumn: '1/-1' }}>
                      <label className="pr-lbl">Full Name<span className="pr-req">*</span></label>
                      <input className={`pr-input${errors.name ? ' bad' : ''}`} placeholder="e.g. Ramesh Kumar" {...register('name', { required: 'Name is required' })} />
                      {errors.name && <span className="pr-err">⚠ {errors.name.message}</span>}
                    </div>
                    <div className="pr-field">
                      <label className="pr-lbl">Mobile Number<span className="pr-req">*</span></label>
                      <div className="pr-phone">
                        <span className="pr-phone-pre">🇮🇳 +91</span>
                        <input className={`pr-input${errors.phone ? ' bad' : ''}`} placeholder="9876543210" maxLength={10}
                          {...register('phone', { required: 'Phone required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid 10-digit number' } })}
                          onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }} />
                      </div>
                      {errors.phone ? <span className="pr-err">⚠ {errors.phone.message}</span> : <span className="pr-hint">10 digits, starting with 6–9</span>}
                    </div>
                    <div className="pr-field">
                      <label className="pr-lbl">Age<span className="pr-req">*</span></label>
                      <input type="number" className={`pr-input${errors.age ? ' bad' : ''}`} placeholder="e.g. 35" {...register('age', { required: true, min: 0, max: 150 })} />
                      {errors.age && <span className="pr-err">⚠ Enter a valid age</span>}
                    </div>
                    <div className="pr-field">
                      <label className="pr-lbl">Gender</label>
                      <select className="pr-select" {...register('gender')}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </>)}

                {/* Step 1 */}
                {step === 1 && (<>
                  <div className="pr-card-hd">Symptoms</div>
                  <div className="pr-card-sub">Select all that apply, or type a custom symptom</div>
                  <input type="hidden" {...register('symptoms', { required: 'Select at least one symptom' })} />
                  <div className="pr-field" style={{ marginBottom: 14 }}>
                    <label className="pr-lbl">Selected<span className="pr-req">*</span></label>
                    <div className={`pr-sym-box${selectedSymptoms.length ? ' filled' : ''}`}>
                      {selectedSymptoms.length === 0
                        ? <span className="pr-sym-placeholder">Tap chips below to add symptoms...</span>
                        : selectedSymptoms.map(s => (
                          <span key={s} className="pr-sym-tag">{s}
                            <button type="button" className="pr-sym-rm" onClick={() => removeSym(s)}>✕</button>
                          </span>
                        ))}
                    </div>
                    {errors.symptoms && <span className="pr-err">⚠ {errors.symptoms.message}</span>}
                  </div>
                  <div className="pr-field" style={{ marginBottom: 4 }}>
                    <label className="pr-lbl">Common Symptoms</label>
                    <div className="pr-chips">
                      {SYMPTOM_SUGGESTIONS.map(({ label, icon }) => (
                        <button key={label} type="button" className={`pr-chip ${selectedSymptoms.includes(label) ? 'on' : ''}`} onClick={() => toggleSym(label)}>
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pr-or"><div className="pr-or-line" /><span className="pr-or-txt">or add custom</span><div className="pr-or-line" /></div>
                  <div className="pr-field">
                    <label className="pr-lbl">Custom Symptom</label>
                    <div className="pr-add-row">
                      <input className="pr-input" placeholder="Type and press Add or Enter..." value={customSymptom}
                        onChange={e => setCustomSymptom(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} />
                      <button type="button" className="pr-add-btn" onClick={addCustom}>Add</button>
                    </div>
                  </div>
                </>)}

                {/* Step 2 */}
                {step === 2 && (<>
                  <div className="pr-card-hd">Department & Doctor</div>
                  <div className="pr-card-sub">Choose a department to see available doctors</div>
                  <div className="pr-field" style={{ marginBottom: 18 }}>
                    <label className="pr-lbl">Department<span className="pr-req">*</span></label>
                    <select className="pr-select" {...register('department', { required: 'Select a department' })}>
                      <option value="">Select department...</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <span className="pr-err">⚠ {errors.department.message}</span>}
                  </div>
                  {watchDept && (
                    <div className="pr-field">
                      <label className="pr-lbl">Available Doctors</label>
                      <div className="pr-docs">
                        {doctors.length === 0
                          ? <div className="pr-no-doc">No doctors available in this department right now</div>
                          : doctors.map(d => (
                            <button key={d.id} type="button" className={`pr-doc ${selectedDoctorId === d.id ? 'sel' : ''}`} onClick={() => setSelectedDoctorId(d.id)}>
                              <div className="pr-doc-av">{d.name?.charAt(0) ?? 'D'}</div>
                              <div className="pr-doc-inf">
                                <span className="pr-doc-name">Dr. {d.name}</span>
                                <span className="pr-doc-spec">{d.specialization}</span>
                              </div>
                              <span className={`pr-doc-badge ${d.avg_consultation_minutes > 15 ? 'busy' : ''}`}>~{d.avg_consultation_minutes} min</span>
                              <div className="pr-doc-chk">✓</div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </>)}

                <div className="pr-foot">
                  {step > 0 && <button type="button" className="pr-btn-back" onClick={() => setStep(s => s - 1)}>← Back</button>}
                  {step < 2
                    ? <button type="button" className="pr-btn-next" onClick={nextStep}>Continue →</button>
                    : <button type="submit" className={`pr-btn-next ${isEmergency ? 'danger' : ''}`} disabled={loading || !selectedDoctorId}>
                        {loading ? 'Registering...' : isEmergency ? '🚨 Register Emergency' : '🎫 Get My Token'}
                      </button>}
                </div>
              </form>
            </div>
          </>)}

          {/* AMBULANCE */}
          {activeTab === 'ambulance' && (<>
            <div className="pr-amb-bar">
              <div>
                <div className="pr-amb-txt">Life-threatening emergency?</div>
                <div className="pr-amb-sub">Call the national ambulance helpline immediately</div>
              </div>
              <a href="tel:108" className="pr-call-btn">📞 108</a>
            </div>

            <div className="pr-card">
              <div className="pr-card-hd">Request Ambulance</div>
              <div className="pr-card-sub">Emergency pickup for rural & remote areas — free of charge</div>
              <form onSubmit={ambulanceForm.handleSubmit(onAmb)} className="pr-stack">
                <div className="pr-g2">
                  <div className="pr-field" style={{ gridColumn: '1/-1' }}>
                    <label className="pr-lbl">Patient Name<span className="pr-req">*</span></label>
                    <input className="pr-input" placeholder="Full name" {...ambulanceForm.register('patientName', { required: true })} />
                  </div>
                  <div className="pr-field">
                    <label className="pr-lbl">Contact Number<span className="pr-req">*</span></label>
                    <div className="pr-phone">
                      <span className="pr-phone-pre">+91</span>
                      <input className="pr-input" placeholder="9876543210" maxLength={10}
                        {...ambulanceForm.register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })}
                        onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }} />
                    </div>
                  </div>
                  <div className="pr-field">
                    <label className="pr-lbl">Age</label>
                    <input type="number" className="pr-input" placeholder="e.g. 45" {...ambulanceForm.register('age')} />
                  </div>
                </div>
                <div className="pr-field">
                  <label className="pr-lbl">Emergency Reason<span className="pr-req">*</span></label>
                  <div className="pr-reasons">
                    {AMBULANCE_REASONS.map(({ label, icon }) => (
                      <button key={label} type="button" className={`pr-reason ${selectedReason === label ? 'on' : ''}`} onClick={() => setSelectedReason(label)}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pr-field">
                  <label className="pr-lbl">Additional Details</label>
                  <textarea className="pr-textarea" rows={2} placeholder="Any extra information..." {...ambulanceForm.register('additionalInfo')} />
                </div>
                <div className="pr-field">
                  <label className="pr-lbl">📍 Pickup Location<span className="pr-req">*</span></label>
                  <textarea className="pr-textarea" rows={2} placeholder="House no., Street, Village, District, State" {...ambulanceForm.register('address', { required: true })} />
                  <input className="pr-input" style={{ marginTop: 8 }} placeholder="Nearest landmark" {...ambulanceForm.register('landmark')} />
                  <input className="pr-input" style={{ marginTop: 8 }} placeholder="Pin Code" maxLength={6}
                    onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); }}
                    {...ambulanceForm.register('pinCode')} />
                </div>
                <div className="pr-how">
                  <div className="pr-how-ttl">How it works</div>
                  {['Submit form with patient & location details', 'System alerts nearest available ambulance', 'Ambulance dispatched to your pickup point', 'Patient transported & pre-registered at hospital'].map((t, i) => (
                    <div key={i} className="pr-how-row">
                      <div className="pr-how-n">{i + 1}</div>
                      <div className="pr-how-t">{t}</div>
                    </div>
                  ))}
                </div>
                <button type="submit" className="pr-btn-next danger" style={{ width: '100%' }} disabled={ambulanceLoading}>
                  {ambulanceLoading ? 'Dispatching...' : '🚑 Request Ambulance Now'}
                </button>
              </form>
            </div>
          </>)}
        </div>
      </div>
    </>
  );
}
