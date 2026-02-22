import React, { useState, useEffect, useRef } from 'react';
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
  { label: 'Patient Info', icon: '👤' },
  { label: 'Symptoms', icon: '🩺' },
  { label: 'Doctor', icon: '🏥' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap');

  :root {
    --bg: #060a12;
    --surface: #0c1220;
    --surface2: #111827;
    --border: rgba(255,255,255,0.08);
    --border-hover: rgba(255,255,255,0.16);
    --teal: #00d4b4;
    --teal-dim: rgba(0,212,180,0.12);
    --teal-glow: rgba(0,212,180,0.25);
    --red: #ff4d4d;
    --red-dim: rgba(255,77,77,0.1);
    --red-glow: rgba(255,77,77,0.25);
    --amber: #f59e0b;
    --text: #eef2ff;
    --text-muted: rgba(238,242,255,0.45);
    --text-dim: rgba(238,242,255,0.2);
    --radius: 16px;
    --font-display: 'Bricolage Grotesque', sans-serif;
    --font-body: 'Space Grotesk', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .rr { min-height: 100vh; background: var(--bg); color: var(--text); font-family: var(--font-body); overflow-x: hidden; position: relative; }

  /* Background layers */
  .rr-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    overflow: hidden;
  }
  .rr-bg-orb1 {
    position: absolute; width: 700px; height: 700px;
    border-radius: 50%; filter: blur(120px); opacity: 0.07;
    background: var(--teal); top: -200px; left: -200px;
    animation: orb1float 12s ease-in-out infinite alternate;
  }
  .rr-bg-orb2 {
    position: absolute; width: 500px; height: 500px;
    border-radius: 50%; filter: blur(100px); opacity: 0.06;
    background: var(--red); bottom: -150px; right: -100px;
    animation: orb2float 15s ease-in-out infinite alternate;
  }
  .rr-bg-orb3 {
    position: absolute; width: 300px; height: 300px;
    border-radius: 50%; filter: blur(80px); opacity: 0.04;
    background: #818cf8; top: 50%; left: 60%;
  }
  .rr-bg-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(0,212,180,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,180,0.025) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%);
  }

  @keyframes orb1float { from { transform: translate(0,0) scale(1); } to { transform: translate(40px, 60px) scale(1.1); } }
  @keyframes orb2float { from { transform: translate(0,0); } to { transform: translate(-30px, -40px); } }

  /* Nav */
  .rr-nav {
    position: relative; z-index: 20;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 40px;
    background: rgba(6,10,18,0.7);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
  }
  .rr-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--font-display); font-weight: 800; font-size: 17px;
    color: var(--text); text-decoration: none; letter-spacing: -0.02em;
  }
  .rr-logo-mark {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--teal) 0%, #0ea5e9 100%);
    display: flex; align-items: center; justify-content: center; font-size: 15px;
    box-shadow: 0 0 20px var(--teal-glow);
  }
  .rr-logo-dot { color: var(--teal); }

  .rr-nav-links { display: flex; gap: 8px; }
  .rr-nav-link {
    padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
    border: 1px solid var(--border); background: transparent;
    color: var(--text-muted); cursor: pointer; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s; font-family: var(--font-body);
  }
  .rr-nav-link:hover { border-color: var(--border-hover); color: var(--text); }
  .rr-nav-link.primary {
    background: var(--teal-dim); border-color: rgba(0,212,180,0.3); color: var(--teal);
  }
  .rr-nav-link.primary:hover { background: rgba(0,212,180,0.18); box-shadow: 0 0 20px var(--teal-glow); }

  /* Page body */
  .rr-page { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; padding: 52px 24px 100px; }

  /* Header */
  .rr-header { text-align: center; margin-bottom: 52px; animation: slideUp 0.6s ease both; }
  .rr-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--teal-dim); border: 1px solid rgba(0,212,180,0.25);
    color: var(--teal); font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; padding: 5px 14px; border-radius: 99px;
    margin-bottom: 22px;
  }
  .rr-badge-dot { width: 6px; height: 6px; background: var(--teal); border-radius: 50%; animation: pulse 2s ease infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }

  .rr-h1 {
    font-family: var(--font-display); font-weight: 800; font-size: clamp(32px, 6vw, 52px);
    letter-spacing: -0.04em; line-height: 1.05; color: var(--text); margin-bottom: 14px;
  }
  .rr-h1 em { font-style: normal; color: var(--teal); }
  .rr-h1-sub { font-size: 15px; color: var(--text-muted); max-width: 440px; margin: 0 auto; line-height: 1.65; }

  /* Stats bar */
  .rr-statsbar {
    display: flex; justify-content: center; gap: 32px; margin-top: 28px;
    padding-top: 28px; border-top: 1px solid var(--border);
  }
  .rr-stat { text-align: center; }
  .rr-stat-val { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--teal); }
  .rr-stat-lbl { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }

  /* Emergency banner */
  .rr-emerg-banner {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: linear-gradient(135deg, rgba(255,77,77,0.1), rgba(255,77,77,0.05));
    border: 1px solid rgba(255,77,77,0.2); border-radius: var(--radius);
    padding: 16px 20px; margin-bottom: 24px;
    animation: slideUp 0.5s 0.1s ease both;
    position: relative; overflow: hidden;
  }
  .rr-emerg-banner::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--red);
  }
  .rr-emerg-banner-left { display: flex; align-items: center; gap: 14px; padding-left: 8px; }
  .rr-emerg-icon {
    width: 42px; height: 42px; border-radius: 12px; background: rgba(255,77,77,0.15);
    display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
  }
  .rr-emerg-title { font-weight: 700; font-size: 14px; color: #fca5a5; }
  .rr-emerg-sub { font-size: 12px; color: rgba(252,165,165,0.55); margin-top: 2px; }
  .rr-emerg-cta {
    flex-shrink: 0; padding: 9px 18px; border-radius: 10px; font-size: 12px; font-weight: 700;
    background: rgba(255,77,77,0.18); border: 1px solid rgba(255,77,77,0.35); color: #fca5a5;
    cursor: pointer; font-family: var(--font-body); transition: all 0.2s;
  }
  .rr-emerg-cta:hover { background: rgba(255,77,77,0.28); box-shadow: 0 0 20px var(--red-glow); }

  /* Tabs */
  .rr-tabs {
    display: grid; grid-template-columns: 1fr 1fr;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 5px; margin-bottom: 28px;
    animation: slideUp 0.5s 0.15s ease both;
  }
  .rr-tab {
    padding: 11px 16px; border-radius: 12px; font-size: 13px; font-weight: 600;
    border: none; background: transparent; color: var(--text-dim); cursor: pointer;
    font-family: var(--font-body); display: flex; align-items: center; justify-content: center;
    gap: 7px; transition: all 0.25s;
  }
  .rr-tab-teal { background: var(--teal-dim); border: 1px solid rgba(0,212,180,0.25); color: var(--teal); }
  .rr-tab-red { background: var(--red-dim); border: 1px solid rgba(255,77,77,0.25); color: #fca5a5; }

  /* Steps */
  .rr-steps { display: flex; align-items: center; justify-content: center; margin-bottom: 32px; animation: slideUp 0.5s 0.18s ease both; }
  .rr-step-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .rr-step-bubble {
    width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-size: 13px; font-weight: 700;
    border: 1.5px solid var(--border); color: var(--text-dim); background: var(--surface);
    transition: all 0.3s; position: relative;
  }
  .rr-step-bubble.done {
    background: var(--teal-dim); border-color: var(--teal); color: var(--teal);
  }
  .rr-step-bubble.done::after {
    content: '✓'; position: absolute; font-size: 12px;
  }
  .rr-step-bubble.active {
    background: var(--teal); border-color: var(--teal); color: #060a12;
    box-shadow: 0 0 0 4px rgba(0,212,180,0.2), 0 0 20px var(--teal-glow);
  }
  .rr-step-lbl { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: var(--text-dim); transition: color 0.3s; }
  .rr-step-lbl.done { color: rgba(0,212,180,0.6); }
  .rr-step-lbl.active { color: var(--teal); }
  .rr-step-line { width: 64px; height: 1px; background: var(--border); margin: 0 10px; position: relative; top: -14px; transition: background 0.3s; }
  .rr-step-line.done { background: rgba(0,212,180,0.4); }

  /* Card */
  .rr-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 36px;
    animation: slideUp 0.5s 0.2s ease both;
    position: relative; overflow: hidden;
  }
  .rr-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,212,180,0.3), transparent);
  }
  .rr-card-title { font-family: var(--font-display); font-weight: 700; font-size: 19px; color: var(--text); letter-spacing: -0.02em; margin-bottom: 4px; }
  .rr-card-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 28px; }

  /* Emergency toggle */
  .rr-emerg-toggle {
    display: flex; align-items: center; gap: 14px;
    padding: 15px 18px; border-radius: 14px; border: 1.5px solid var(--border);
    background: transparent; cursor: pointer; width: 100%; text-align: left;
    font-family: var(--font-body); margin-bottom: 28px; transition: all 0.25s;
  }
  .rr-emerg-toggle:hover { border-color: rgba(255,77,77,0.2); background: rgba(255,77,77,0.03); }
  .rr-emerg-toggle.on { border-color: rgba(255,77,77,0.35); background: rgba(255,77,77,0.06); }
  .rr-emerg-toggle-ico {
    width: 38px; height: 38px; border-radius: 10px; background: var(--surface2);
    display: flex; align-items: center; justify-content: center; font-size: 17px;
    flex-shrink: 0; transition: background 0.25s;
  }
  .rr-emerg-toggle.on .rr-emerg-toggle-ico { background: rgba(255,77,77,0.15); }
  .rr-emerg-toggle-text { flex: 1; }
  .rr-emerg-toggle-lbl { font-weight: 600; font-size: 14px; color: var(--text); display: block; }
  .rr-emerg-toggle-desc { font-size: 11px; color: var(--text-dim); display: block; margin-top: 2px; }
  .rr-switch { width: 42px; height: 22px; border-radius: 99px; background: rgba(255,255,255,0.1); position: relative; transition: background 0.25s; flex-shrink: 0; }
  .rr-emerg-toggle.on .rr-switch { background: var(--red); box-shadow: 0 0 12px var(--red-glow); }
  .rr-switch-knob { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: transform 0.25s; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
  .rr-emerg-toggle.on .rr-switch-knob { transform: translateX(20px); }

  /* Form grid */
  .rr-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 560px) { .rr-g2 { grid-template-columns: 1fr; } .rr-card { padding: 22px; } .rr-nav { padding: 14px 20px; } }

  .rr-field { display: flex; flex-direction: column; gap: 7px; }
  .rr-lbl { font-size: 11px; font-weight: 700; color: var(--text-dim); letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
  .rr-lbl-req { color: var(--teal); }

  .rr-input, .rr-select, .rr-textarea {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 14px; font-size: 14px;
    color: var(--text); font-family: var(--font-body);
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    outline: none; width: 100%;
  }
  .rr-input::placeholder, .rr-textarea::placeholder { color: var(--text-dim); }
  .rr-input:focus, .rr-select:focus, .rr-textarea:focus {
    border-color: rgba(0,212,180,0.4); background: rgba(0,212,180,0.04);
    box-shadow: 0 0 0 3px rgba(0,212,180,0.08);
  }
  .rr-input.err { border-color: rgba(255,77,77,0.4); }
  .rr-input.err:focus { box-shadow: 0 0 0 3px rgba(255,77,77,0.08); }
  .rr-select {
    cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(238,242,255,0.25)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
  }
  .rr-select option { background: #111827; color: var(--text); }
  .rr-select:disabled { opacity: 0.35; cursor: not-allowed; }
  .rr-textarea { resize: none; line-height: 1.6; }
  .rr-err { font-size: 11px; color: #f87171; display: flex; align-items: center; gap: 4px; }
  .rr-help { font-size: 11px; color: var(--text-dim); }

  /* Phone input group */
  .rr-phone-wrap { display: flex; gap: 0; }
  .rr-phone-prefix {
    padding: 12px 13px; background: var(--surface2); border: 1px solid var(--border);
    border-right: none; border-radius: 12px 0 0 12px; font-size: 14px; color: var(--text-muted);
    font-family: var(--font-body); white-space: nowrap; display: flex; align-items: center;
  }
  .rr-phone-wrap .rr-input { border-radius: 0 12px 12px 0; }

  /* Symptom section */
  .rr-sym-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .rr-sym-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 13px; border-radius: 99px; font-size: 12px; font-weight: 600;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--text-muted); cursor: pointer; font-family: var(--font-body);
    transition: all 0.18s; user-select: none;
  }
  .rr-sym-chip:hover { border-color: rgba(0,212,180,0.3); color: var(--teal); background: var(--teal-dim); }
  .rr-sym-chip.selected {
    border-color: var(--teal); background: var(--teal-dim); color: var(--teal);
    box-shadow: 0 0 0 2px rgba(0,212,180,0.12);
  }
  .rr-sym-chip.selected .rr-sym-chip-ico { opacity: 1; }
  .rr-sym-chip-ico { font-size: 14px; }

  /* Selected symptoms display */
  .rr-selected-syms {
    display: flex; flex-wrap: wrap; gap: 7px; padding: 12px;
    background: var(--teal-dim); border: 1px solid rgba(0,212,180,0.2);
    border-radius: 12px; margin-bottom: 12px; min-height: 48px; align-items: center;
  }
  .rr-selected-sym {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(0,212,180,0.18); border: 1px solid rgba(0,212,180,0.3);
    color: var(--teal); padding: 4px 10px 4px 8px; border-radius: 99px;
    font-size: 12px; font-weight: 600;
  }
  .rr-selected-sym-remove {
    background: none; border: none; color: rgba(0,212,180,0.6); cursor: pointer;
    font-size: 13px; padding: 0; line-height: 1; margin-left: 2px; transition: color 0.15s;
  }
  .rr-selected-sym-remove:hover { color: var(--teal); }
  .rr-sym-placeholder { font-size: 12px; color: var(--text-dim); }

  /* Custom symptom input */
  .rr-custom-sym-row { display: flex; gap: 8px; }
  .rr-custom-sym-row .rr-input { flex: 1; }
  .rr-add-btn {
    padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 700;
    border: 1px solid rgba(0,212,180,0.3); background: var(--teal-dim); color: var(--teal);
    cursor: pointer; font-family: var(--font-body); white-space: nowrap; transition: all 0.2s;
  }
  .rr-add-btn:hover { background: rgba(0,212,180,0.2); box-shadow: 0 0 16px var(--teal-glow); }

  /* Doctor cards */
  .rr-docs { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .rr-doc-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 14px; cursor: pointer;
    border: 1.5px solid var(--border); background: var(--surface2);
    transition: all 0.2s; text-align: left; width: 100%;
    font-family: var(--font-body);
  }
  .rr-doc-card:hover { border-color: rgba(0,212,180,0.25); background: var(--teal-dim); }
  .rr-doc-card.sel { border-color: var(--teal); background: var(--teal-dim); box-shadow: 0 0 0 3px rgba(0,212,180,0.1); }
  .rr-doc-av {
    width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(0,212,180,0.2), rgba(14,165,233,0.2));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--teal);
  }
  .rr-doc-name { font-weight: 700; font-size: 14px; color: var(--text); display: block; }
  .rr-doc-spec { font-size: 12px; color: var(--text-muted); margin-top: 2px; display: block; }
  .rr-doc-badge {
    margin-left: auto; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;
    background: rgba(0,212,180,0.12); color: var(--teal); border: 1px solid rgba(0,212,180,0.2);
    white-space: nowrap;
  }
  .rr-doc-badge.busy { background: rgba(245,158,11,0.1); color: var(--amber); border-color: rgba(245,158,11,0.2); }
  .rr-doc-check {
    width: 20px; height: 20px; border-radius: 50%; background: var(--teal);
    display: flex; align-items: center; justify-content: center; font-size: 10px;
    color: #060a12; flex-shrink: 0; font-weight: 900;
    opacity: 0; transition: opacity 0.2s; margin-left: 8px;
  }
  .rr-doc-card.sel .rr-doc-check { opacity: 1; }
  .rr-no-doc { text-align: center; padding: 30px; color: var(--text-dim); font-size: 13px; border: 1px dashed var(--border); border-radius: 12px; }

  /* Nav row */
  .rr-nav-row { display: flex; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border); }
  .rr-btn-back {
    padding: 13px 22px; border-radius: 12px; font-size: 14px; font-weight: 600;
    cursor: pointer; border: 1px solid var(--border); background: transparent;
    color: var(--text-muted); transition: all 0.2s; font-family: var(--font-body);
  }
  .rr-btn-back:hover { border-color: var(--border-hover); color: var(--text); }
  .rr-btn-next {
    flex: 1; padding: 13px 24px; border-radius: 12px; font-size: 14px; font-weight: 700;
    cursor: pointer; border: none; font-family: var(--font-body);
    background: linear-gradient(135deg, #00d4b4 0%, #0ea5e9 100%);
    color: #060a12; transition: all 0.22s; display: flex; align-items: center; justify-content: center; gap: 8px;
    position: relative; overflow: hidden;
  }
  .rr-btn-next::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0); transition: background 0.2s; }
  .rr-btn-next:hover::after { background: rgba(255,255,255,0.1); }
  .rr-btn-next:hover { transform: translateY(-1px); box-shadow: 0 8px 28px var(--teal-glow); }
  .rr-btn-next:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }
  .rr-btn-next.danger {
    background: linear-gradient(135deg, #ff4d4d, #dc2626); color: white;
  }
  .rr-btn-next.danger:hover { box-shadow: 0 8px 28px var(--red-glow); }

  /* Divider */
  .rr-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .rr-divider-line { flex: 1; height: 1px; background: var(--border); }
  .rr-divider-lbl { font-size: 11px; font-weight: 600; color: var(--text-dim); letter-spacing: 0.08em; text-transform: uppercase; }

  /* Ambulance */
  .rr-amb-call {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2);
    border-radius: var(--radius); padding: 16px 20px; margin-bottom: 20px;
  }
  .rr-amb-call-text { font-size: 14px; font-weight: 700; color: #fca5a5; }
  .rr-amb-call-sub { font-size: 11px; color: rgba(252,165,165,0.5); margin-top: 2px; }
  .rr-amb-call-btn {
    background: rgba(255,77,77,0.18); border: 1px solid rgba(255,77,77,0.35); color: #fca5a5;
    font-size: 15px; font-weight: 800; padding: 10px 20px; border-radius: 10px;
    text-decoration: none; font-family: var(--font-display); transition: all 0.2s;
    letter-spacing: -0.01em; white-space: nowrap;
  }
  .rr-amb-call-btn:hover { background: rgba(255,77,77,0.28); box-shadow: 0 0 20px var(--red-glow); }

  .rr-reason-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .rr-reason-chip {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 14px; border-radius: 12px; font-size: 12px; font-weight: 600;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--text-muted); cursor: pointer; font-family: var(--font-body);
    transition: all 0.18s;
  }
  .rr-reason-chip:hover { border-color: rgba(255,77,77,0.3); color: #fca5a5; }
  .rr-reason-chip.sel { border-color: rgba(255,77,77,0.4); background: var(--red-dim); color: #fca5a5; }

  .rr-howbox {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 14px; padding: 18px 20px; margin-top: 4px;
  }
  .rr-how-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); margin-bottom: 14px; }
  .rr-how-step { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
  .rr-how-num {
    width: 22px; height: 22px; border-radius: 50%; background: rgba(255,77,77,0.12);
    border: 1px solid rgba(255,77,77,0.25); color: #fca5a5; font-size: 11px;
    font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rr-how-txt { font-size: 12px; color: var(--text-muted); line-height: 1.55; margin: 2px 0 0; }

  .rr-spacey > * + * { margin-top: 18px; }

  /* Success screens */
  .rr-success { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--bg); position: relative; }
  .rr-success-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 24px; padding: 48px 40px; max-width: 440px; width: 100%;
    text-align: center; animation: scaleIn 0.4s ease both; position: relative; z-index: 1;
  }
  .rr-success-ring {
    width: 76px; height: 76px; border-radius: 50%; margin: 0 auto 24px;
    background: var(--teal-dim); border: 1.5px solid rgba(0,212,180,0.35);
    display: flex; align-items: center; justify-content: center; font-size: 30px;
    box-shadow: 0 0 40px var(--teal-glow);
  }
  .rr-success-title { font-family: var(--font-display); font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: var(--text); margin-bottom: 8px; }
  .rr-success-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 28px; }
  .rr-token-box { background: var(--teal-dim); border: 1px solid rgba(0,212,180,0.25); border-radius: 16px; padding: 22px; margin-bottom: 16px; }
  .rr-token-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--teal); font-weight: 700; margin-bottom: 6px; }
  .rr-token-val { font-family: var(--font-display); font-size: 48px; font-weight: 800; color: var(--text); letter-spacing: 0.06em; }
  .rr-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .rr-stat-box { background: var(--surface2); border-radius: 12px; padding: 16px; }
  .rr-stat-box-lbl { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .rr-stat-box-val { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text); }
  .rr-queue-id { font-size: 11px; color: var(--text-dim); margin-bottom: 24px; }
  .rr-queue-id code { background: var(--surface2); padding: 3px 8px; border-radius: 6px; font-size: 11px; color: var(--text-muted); }
  .rr-suc-btns { display: flex; gap: 10px; }
  .rr-suc-btn-p { flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; font-family: var(--font-body); background: linear-gradient(135deg, #00d4b4, #0ea5e9); color: #060a12; transition: opacity 0.2s; }
  .rr-suc-btn-p:hover { opacity: 0.85; }
  .rr-suc-btn-s { flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font-body); border: 1px solid var(--border); background: transparent; color: var(--text-muted); transition: all 0.2s; }
  .rr-suc-btn-s:hover { border-color: var(--border-hover); color: var(--text); }

  .rr-amb-suc-ring { width: 76px; height: 76px; border-radius: 50%; margin: 0 auto 24px; background: var(--red-dim); border: 1.5px solid rgba(255,77,77,0.3); display: flex; align-items: center; justify-content: center; font-size: 34px; box-shadow: 0 0 40px var(--red-glow); }
  .rr-amb-hotline { background: var(--red-dim); border: 1px solid rgba(255,77,77,0.2); border-radius: 14px; padding: 18px; margin-bottom: 20px; }
  .rr-amb-hotline-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(252,165,165,0.5); margin-bottom: 6px; }
  .rr-amb-hotline-num { font-family: var(--font-display); font-size: 36px; font-weight: 800; color: #fca5a5; }

  .rr-tips { text-align: left; }
  .rr-tips-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); margin-bottom: 12px; }
  .rr-tip { display: flex; gap: 10px; margin-bottom: 8px; }
  .rr-tip-num { width: 20px; height: 20px; border-radius: 50%; background: rgba(255,77,77,0.12); color: #fca5a5; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .rr-tip-txt { font-size: 12px; color: var(--text-muted); line-height: 1.5; }

  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
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

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    defaultValues: { isEmergency: false, gender: 'male' }
  });

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

  // Keep RHF symptoms field synced with selectedSymptoms array
  useEffect(() => {
    setValue('symptoms', selectedSymptoms.join(', '));
  }, [selectedSymptoms, setValue]);

  const toggleSymptom = (label) => {
    setSelectedSymptoms(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms(prev => [...prev, trimmed]);
    }
    setCustomSymptom('');
  };

  const removeSymptom = (label) => setSelectedSymptoms(prev => prev.filter(s => s !== label));

  const nextStep = async () => {
    const fieldsPerStep = [
      ['name', 'phone', 'age'],
      ['symptoms'],
      ['department'],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep(s => Math.min(s + 1, 2));
  };

  const onSubmit = async (data) => {
    if (!selectedDoctorId) { toast.error('Please select a doctor'); return; }
    setLoading(true);
    try {
      const result = await queueAPI.register({
        ...data,
        symptoms: selectedSymptoms.join(', '),
        doctorId: selectedDoctorId,
        age: parseInt(data.age),
        isEmergency,
      });
      setRegisteredTicket(result.data.data || result.data);
      toast.success('Registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onAmbulanceSubmit = async (data) => {
    if (!selectedReason) { toast.error('Please select an emergency reason'); return; }
    setAmbulanceLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setAmbulanceSubmitted(true);
      toast.success('🚑 Ambulance dispatched!');
    } catch {
      toast.error('Failed. Please call 108 immediately.');
    } finally {
      setAmbulanceLoading(false);
    }
  };

  // Success screens
  if (registeredTicket) return (
    <>
      <style>{css}</style>
      <div className="rr-success">
        <div className="rr-bg"><div className="rr-bg-orb1" /><div className="rr-bg-orb2" /><div className="rr-bg-grid" /></div>
        <div className="rr-success-card">
          <div className="rr-success-ring">✓</div>
          <h2 className="rr-success-title">You're in the queue!</h2>
          <p className="rr-success-sub">Your token has been issued. Please wait for your turn.</p>
          <div className="rr-token-box">
            <div className="rr-token-lbl">Your Token</div>
            <div className="rr-token-val">{registeredTicket.token}</div>
          </div>
          <div className="rr-stats-row">
            <div className="rr-stat-box">
              <div className="rr-stat-box-lbl">Est. Wait</div>
              <div className="rr-stat-box-val">{registeredTicket.estimatedWaitMinutes}<span style={{fontSize:13,fontWeight:400,color:'rgba(238,242,255,0.4)'}}> min</span></div>
            </div>
            <div className="rr-stat-box">
              <div className="rr-stat-box-lbl">Position</div>
              <div className="rr-stat-box-val">#{registeredTicket.position}</div>
            </div>
          </div>
          <p className="rr-queue-id">Queue ID: <code>{registeredTicket.queueId}</code></p>
          <div className="rr-suc-btns">
            <button className="rr-suc-btn-p" onClick={() => window.location.href = `/track/${registeredTicket.queueId}`}>Track Status →</button>
            <button className="rr-suc-btn-s" onClick={() => { setRegisteredTicket(null); setStep(0); setIsEmergency(false); setSelectedDoctorId(''); setSelectedSymptoms([]); }}>New Patient</button>
          </div>
        </div>
      </div>
    </>
  );

  if (ambulanceSubmitted) return (
    <>
      <style>{css}</style>
      <div className="rr-success">
        <div className="rr-bg"><div className="rr-bg-orb1" /><div className="rr-bg-orb2" /><div className="rr-bg-grid" /></div>
        <div className="rr-success-card">
          <div className="rr-amb-suc-ring">🚑</div>
          <h2 className="rr-success-title">Ambulance Dispatched</h2>
          <p className="rr-success-sub">Our team is on the way to your location.</p>
          <div className="rr-amb-hotline">
            <div className="rr-amb-hotline-lbl">Emergency Helpline</div>
            <div className="rr-amb-hotline-num">📞 108</div>
          </div>
          <div className="rr-tips">
            <p className="rr-tips-title">While you wait</p>
            {['Stay calm and keep the patient still','Keep airways clear','Apply pressure to bleeding wounds','Do not give food or water','Stay at the pickup location'].map((t, i) => (
              <div key={i} className="rr-tip">
                <span className="rr-tip-num">{i + 1}</span>
                <span className="rr-tip-txt">{t}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <button className="rr-suc-btn-s" style={{ width: '100%' }} onClick={() => { setAmbulanceSubmitted(false); setSelectedReason(''); ambulanceForm.reset(); }}>
              Request Another Ambulance
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="rr">
        <div className="rr-bg">
          <div className="rr-bg-orb1" />
          <div className="rr-bg-orb2" />
          <div className="rr-bg-orb3" />
          <div className="rr-bg-grid" />
        </div>

        {/* Nav */}
        <nav className="rr-nav">
          <a href="/" className="rr-logo">
            <div className="rr-logo-mark">🏥</div>
            Hospital<span className="rr-logo-dot">Q</span>
          </a>
          <div className="rr-nav-links">
            <a href="/track" className="rr-nav-link">📍 Track Queue</a>
            <a href="/login" className="rr-nav-link primary">Staff Login →</a>
          </div>
        </nav>

        <div className="rr-page">
          {/* Header */}
          <div className="rr-header">
            <div className="rr-badge"><span className="rr-badge-dot" /> Smart Queue System</div>
            <h1 className="rr-h1">Register for <em>Queue</em></h1>
            <p className="rr-h1-sub">Priority-based registration with real-time tracking and AI-assisted triage</p>
            <div className="rr-statsbar">
              <div className="rr-stat"><div className="rr-stat-val">2.4x</div><div className="rr-stat-lbl">Faster Wait</div></div>
              <div className="rr-stat"><div className="rr-stat-val">98%</div><div className="rr-stat-lbl">Accuracy</div></div>
              <div className="rr-stat"><div className="rr-stat-val">24/7</div><div className="rr-stat-lbl">Available</div></div>
            </div>
          </div>

          {/* Emergency banner */}
          <div className="rr-emerg-banner">
            <div className="rr-emerg-banner-left">
              <div className="rr-emerg-icon">🚑</div>
              <div>
                <div className="rr-emerg-title">Rural Emergency? Need Ambulance?</div>
                <div className="rr-emerg-sub">We bridge the gap — free pickup from your village</div>
              </div>
            </div>
            <button className="rr-emerg-cta" onClick={() => setActiveTab('ambulance')}>Request 🚨</button>
          </div>

          {/* Tabs */}
          <div className="rr-tabs">
            <button className={`rr-tab ${activeTab === 'register' ? 'rr-tab-teal' : ''}`} onClick={() => setActiveTab('register')}>
              🏥 Register for Queue
            </button>
            <button className={`rr-tab ${activeTab === 'ambulance' ? 'rr-tab-red' : ''}`} onClick={() => setActiveTab('ambulance')}>
              🚑 Ambulance Service
            </button>
          </div>

          {/* === REGISTER TAB === */}
          {activeTab === 'register' && (
            <>
              {/* Steps */}
              <div className="rr-steps">
                {STEPS.map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="rr-step-wrap">
                      <div className={`rr-step-bubble ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                        {i < step ? '' : s.icon}
                      </div>
                      <div className={`rr-step-lbl ${i < step ? 'done' : i === step ? 'active' : ''}`}>{s.label}</div>
                    </div>
                    {i < STEPS.length - 1 && <div className={`rr-step-line ${i < step ? 'done' : ''}`} />}
                  </React.Fragment>
                ))}
              </div>

              <div className="rr-card">
                <form onSubmit={handleSubmit(onSubmit)}>

                  {/* Step 0 — Patient Info */}
                  {step === 0 && (
                    <>
                      <div className="rr-card-title">Patient Information</div>
                      <div className="rr-card-sub">Basic details about the patient visiting today</div>

                      <button type="button" className={`rr-emerg-toggle ${isEmergency ? 'on' : ''}`} onClick={() => setIsEmergency(e => !e)}>
                        <div className="rr-emerg-toggle-ico">🚨</div>
                        <div className="rr-emerg-toggle-text">
                          <span className="rr-emerg-toggle-lbl">Emergency Case</span>
                          <span className="rr-emerg-toggle-desc">Priority +100 in queue — for critical conditions</span>
                        </div>
                        <div className="rr-switch"><div className="rr-switch-knob" /></div>
                      </button>

                      <div className="rr-g2">
                        <div className="rr-field" style={{ gridColumn: '1 / -1' }}>
                          <label className="rr-lbl">Full Name <span className="rr-lbl-req">*</span></label>
                          <input className={`rr-input${errors.name ? ' err' : ''}`} placeholder="e.g. Ramesh Kumar"
                            {...register('name', { required: 'Full name is required' })} />
                          {errors.name && <span className="rr-err">⚠ {errors.name.message}</span>}
                        </div>

                        <div className="rr-field">
                          <label className="rr-lbl">Phone <span className="rr-lbl-req">*</span></label>
                          <div className="rr-phone-wrap">
                            <span className="rr-phone-prefix">🇮🇳 +91</span>
                            <input
                              className={`rr-input${errors.phone ? ' err' : ''}`}
                              placeholder="9876543210"
                              maxLength={10}
                              {...register('phone', {
                                required: 'Phone number is required',
                                pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian mobile number' }
                              })}
                              onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }}
                            />
                          </div>
                          {errors.phone ? <span className="rr-err">⚠ {errors.phone.message}</span> : <span className="rr-help">10 digits, starts with 6–9</span>}
                        </div>

                        <div className="rr-field">
                          <label className="rr-lbl">Age <span className="rr-lbl-req">*</span></label>
                          <input type="number" className={`rr-input${errors.age ? ' err' : ''}`} placeholder="e.g. 35"
                            {...register('age', { required: true, min: 0, max: 150 })} />
                          {errors.age && <span className="rr-err">⚠ Valid age required (0–150)</span>}
                        </div>

                        <div className="rr-field">
                          <label className="rr-lbl">Gender</label>
                          <select className="rr-select" {...register('gender')}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other / Prefer not to say</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 1 — Symptoms (multi-select) */}
                  {step === 1 && (
                    <>
                      <div className="rr-card-title">Symptoms & Reason</div>
                      <div className="rr-card-sub">Select all that apply — you can add custom symptoms too</div>

                      {/* Hidden field for validation */}
                      <input type="hidden" {...register('symptoms', { required: 'Please select at least one symptom' })} />

                      {/* Selected symptoms display */}
                      <div className="rr-field" style={{ marginBottom: 20 }}>
                        <label className="rr-lbl">Selected Symptoms <span className="rr-lbl-req">*</span></label>
                        <div className="rr-selected-syms">
                          {selectedSymptoms.length === 0 ? (
                            <span className="rr-sym-placeholder">Tap chips below to add symptoms...</span>
                          ) : selectedSymptoms.map(s => (
                            <span key={s} className="rr-selected-sym">
                              {s}
                              <button type="button" className="rr-selected-sym-remove" onClick={() => removeSymptom(s)}>✕</button>
                            </span>
                          ))}
                        </div>
                        {errors.symptoms && <span className="rr-err">⚠ {errors.symptoms.message}</span>}
                      </div>

                      {/* Chip suggestions */}
                      <div className="rr-field" style={{ marginBottom: 20 }}>
                        <label className="rr-lbl">Common Symptoms</label>
                        <div className="rr-sym-chips">
                          {SYMPTOM_SUGGESTIONS.map(({ label, icon }) => (
                            <button key={label} type="button"
                              className={`rr-sym-chip ${selectedSymptoms.includes(label) ? 'selected' : ''}`}
                              onClick={() => toggleSymptom(label)}>
                              <span className="rr-sym-chip-ico">{icon}</span>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rr-divider"><div className="rr-divider-line" /><div className="rr-divider-lbl">or describe</div><div className="rr-divider-line" /></div>

                      {/* Custom symptom input */}
                      <div className="rr-field">
                        <label className="rr-lbl">Custom Symptom</label>
                        <div className="rr-custom-sym-row">
                          <input className="rr-input" placeholder="Type a symptom and press Add..."
                            value={customSymptom}
                            onChange={e => setCustomSymptom(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSymptom(); } }}
                          />
                          <button type="button" className="rr-add-btn" onClick={addCustomSymptom}>+ Add</button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2 — Department & Doctor */}
                  {step === 2 && (
                    <>
                      <div className="rr-card-title">Department & Doctor</div>
                      <div className="rr-card-sub">Choose your department to see available doctors</div>

                      <div className="rr-field" style={{ marginBottom: 24 }}>
                        <label className="rr-lbl">Department <span className="rr-lbl-req">*</span></label>
                        <select className="rr-select" {...register('department', { required: 'Please select a department' })}>
                          <option value="">Select department...</option>
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.department && <span className="rr-err">⚠ {errors.department.message}</span>}
                      </div>

                      {watchDept && (
                        <div className="rr-field">
                          <label className="rr-lbl">Available Doctors</label>
                          <div className="rr-docs">
                            {doctors.length === 0 ? (
                              <div className="rr-no-doc">No available doctors in this department right now</div>
                            ) : doctors.map(d => (
                              <button key={d.id} type="button"
                                className={`rr-doc-card ${selectedDoctorId === d.id ? 'sel' : ''}`}
                                onClick={() => setSelectedDoctorId(d.id)}>
                                <div className="rr-doc-av">{d.name?.charAt(0) ?? 'D'}</div>
                                <div>
                                  <span className="rr-doc-name">Dr. {d.name}</span>
                                  <span className="rr-doc-spec">{d.specialization}</span>
                                </div>
                                <span className={`rr-doc-badge ${d.avg_consultation_minutes > 15 ? 'busy' : ''}`}>
                                  ~{d.avg_consultation_minutes} min
                                </span>
                                <div className="rr-doc-check">✓</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Navigation */}
                  <div className="rr-nav-row">
                    {step > 0 && <button type="button" className="rr-btn-back" onClick={() => setStep(s => s - 1)}>← Back</button>}
                    {step < 2 ? (
                      <button type="button" className="rr-btn-next" onClick={nextStep}>Continue →</button>
                    ) : (
                      <button type="submit" className={`rr-btn-next ${isEmergency ? 'danger' : ''}`}
                        disabled={loading || !selectedDoctorId}>
                        {loading ? '⏳ Registering...' : isEmergency ? '🚨 Register Emergency' : '🎫 Get My Token'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}

          {/* === AMBULANCE TAB === */}
          {activeTab === 'ambulance' && (
            <>
              <div className="rr-amb-call">
                <div>
                  <div className="rr-amb-call-text">Life-threatening emergency?</div>
                  <div className="rr-amb-call-sub">Call the national ambulance helpline immediately</div>
                </div>
                <a href="tel:108" className="rr-amb-call-btn">📞 108</a>
              </div>

              <div className="rr-card">
                <div className="rr-card-title">Request Ambulance</div>
                <div className="rr-card-sub">Emergency pickup for rural & remote areas — free of charge</div>

                <form onSubmit={ambulanceForm.handleSubmit(onAmbulanceSubmit)} className="rr-spacey">
                  <div className="rr-g2">
                    <div className="rr-field" style={{ gridColumn: '1 / -1' }}>
                      <label className="rr-lbl">Patient Name <span className="rr-lbl-req">*</span></label>
                      <input className="rr-input" placeholder="Full name of patient"
                        {...ambulanceForm.register('patientName', { required: true })} />
                    </div>
                    <div className="rr-field">
                      <label className="rr-lbl">Contact Number <span className="rr-lbl-req">*</span></label>
                      <div className="rr-phone-wrap">
                        <span className="rr-phone-prefix">+91</span>
                        <input className="rr-input" placeholder="9876543210" maxLength={10}
                          {...ambulanceForm.register('phone', {
                            required: true,
                            pattern: /^[6-9]\d{9}$/
                          })}
                          onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }}
                        />
                      </div>
                    </div>
                    <div className="rr-field">
                      <label className="rr-lbl">Patient Age</label>
                      <input type="number" className="rr-input" placeholder="e.g. 45"
                        {...ambulanceForm.register('age')} />
                    </div>
                  </div>

                  <div className="rr-field">
                    <label className="rr-lbl">Emergency Reason <span className="rr-lbl-req">*</span></label>
                    <div className="rr-reason-chips">
                      {AMBULANCE_REASONS.map(({ label, icon }) => (
                        <button key={label} type="button"
                          className={`rr-reason-chip ${selectedReason === label ? 'sel' : ''}`}
                          onClick={() => setSelectedReason(label)}>
                          <span>{icon}</span> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rr-field">
                    <label className="rr-lbl">Additional Details</label>
                    <textarea className="rr-textarea" rows={2} placeholder="Any extra information about the emergency..."
                      {...ambulanceForm.register('additionalInfo')} />
                  </div>

                  <div className="rr-field">
                    <label className="rr-lbl">📍 Pickup Location <span className="rr-lbl-req">*</span></label>
                    <textarea className="rr-textarea" rows={2} placeholder="House no., Street, Village / Town, District, State"
                      {...ambulanceForm.register('address', { required: true })} />
                    <input className="rr-input" style={{ marginTop: 8 }} placeholder="Nearest landmark (e.g. Near Shiv Mandir)"
                      {...ambulanceForm.register('landmark')} />
                    <input className="rr-input" style={{ marginTop: 8 }} placeholder="Pin Code (6 digits)"
                      maxLength={6}
                      onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); }}
                      {...ambulanceForm.register('pinCode')} />
                  </div>

                  <div className="rr-howbox">
                    <div className="rr-how-title">How it works</div>
                    {['Submit form with patient & location details','System alerts nearest available ambulance','Ambulance dispatched to your pickup point','Patient transported & pre-registered at hospital'].map((t, i) => (
                      <div key={i} className="rr-how-step">
                        <div className="rr-how-num">{i + 1}</div>
                        <p className="rr-how-txt">{t}</p>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="rr-btn-next danger" style={{ width: '100%' }} disabled={ambulanceLoading}>
                    {ambulanceLoading ? '⏳ Dispatching...' : '🚑 Request Ambulance Now'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
