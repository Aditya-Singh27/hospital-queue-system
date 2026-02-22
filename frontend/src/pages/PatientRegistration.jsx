import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { queueAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';

const SYMPTOM_SUGGESTIONS = [
  'Chest pain', 'Fever', 'Headache', 'Cough', 'Abdominal pain',
  'Back pain', 'Difficulty breathing', 'Nausea', 'Rash', 'Follow-up visit',
];

const AMBULANCE_REASONS = [
  'Chest pain / Heart attack',
  'Road accident / Trauma',
  'Stroke / Unconscious',
  'Severe breathing difficulty',
  'High-risk pregnancy',
  'Snake bite / Poisoning',
];

const STEPS = ['Patient Info', 'Symptoms', 'Department & Doctor'];

// ── Inline styles ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .reg-root {
    min-height: 100vh;
    background: #050b14;
    color: #e8edf5;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .reg-root * { box-sizing: border-box; }

  /* Ambient background */
  .reg-ambient {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 80% 50% at 10% 0%, rgba(0,200,170,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 90% 100%, rgba(220,38,38,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 50% 50%, rgba(15,25,45,0.9) 0%, transparent 100%);
  }

  .reg-grid {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0,200,170,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,200,170,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* Nav */
  .reg-nav {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(5,11,20,0.8);
    backdrop-filter: blur(20px);
  }

  .reg-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 18px; letter-spacing: -0.04em;
    color: #e8edf5; text-decoration: none;
  }

  .reg-logo-mark {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #00c8aa, #0ea5e9);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }

  .reg-nav-links { display: flex; gap: 8px; align-items: center; }

  .reg-nav-btn {
    padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: 1px solid rgba(255,255,255,0.12);
    background: transparent; color: rgba(232,237,245,0.7);
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    text-decoration: none; display: inline-block;
  }
  .reg-nav-btn:hover { border-color: rgba(0,200,170,0.4); color: #00c8aa; }
  .reg-nav-btn.primary {
    background: rgba(0,200,170,0.12); border-color: rgba(0,200,170,0.3);
    color: #00c8aa;
  }
  .reg-nav-btn.primary:hover { background: rgba(0,200,170,0.2); }

  /* Layout */
  .reg-body {
    position: relative; z-index: 1;
    max-width: 780px; margin: 0 auto; padding: 48px 24px 80px;
  }

  /* Header */
  .reg-header { text-align: center; margin-bottom: 48px; }
  .reg-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(0,200,170,0.08); border: 1px solid rgba(0,200,170,0.2);
    color: #00c8aa; font-size: 12px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 6px 14px; border-radius: 99px;
    margin-bottom: 20px;
  }
  .reg-title {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(28px, 5vw, 44px);
    letter-spacing: -0.04em; line-height: 1.05; color: #e8edf5;
    margin: 0 0 12px;
  }
  .reg-title span { color: #00c8aa; }
  .reg-subtitle { color: rgba(232,237,245,0.45); font-size: 15px; margin: 0; }

  /* Emergency banner */
  .reg-emerg-banner {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.06));
    border: 1px solid rgba(220,38,38,0.25); border-radius: 16px;
    padding: 18px 22px; margin-bottom: 32px;
    animation: fadeUp 0.5s ease both;
  }
  .reg-emerg-left { display: flex; align-items: center; gap: 14px; }
  .reg-emerg-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    background: rgba(220,38,38,0.2); display: flex; align-items: center;
    justify-content: center; font-size: 20px;
  }
  .reg-emerg-title { font-weight: 700; font-size: 14px; color: #fca5a5; margin: 0 0 2px; }
  .reg-emerg-sub { font-size: 12px; color: rgba(252,165,165,0.6); margin: 0; }
  .reg-emerg-btn {
    flex-shrink: 0; padding: 10px 20px; border-radius: 10px; font-size: 13px;
    font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif;
    background: rgba(220,38,38,0.2); border: 1px solid rgba(220,38,38,0.4);
    color: #fca5a5; transition: all 0.2s; white-space: nowrap;
  }
  .reg-emerg-btn:hover { background: rgba(220,38,38,0.3); }

  /* Tab switcher */
  .reg-tabs {
    display: grid; grid-template-columns: 1fr 1fr;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 5px; margin-bottom: 32px;
    animation: fadeUp 0.5s 0.1s ease both;
  }
  .reg-tab {
    padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600;
    cursor: pointer; border: none; background: transparent;
    color: rgba(232,237,245,0.4); transition: all 0.25s;
    font-family: 'DM Sans', sans-serif; display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }
  .reg-tab.active-queue {
    background: rgba(0,200,170,0.12); border: 1px solid rgba(0,200,170,0.25);
    color: #00c8aa;
  }
  .reg-tab.active-amb {
    background: rgba(220,38,38,0.12); border: 1px solid rgba(220,38,38,0.25);
    color: #fca5a5;
  }

  /* Step indicator */
  .reg-steps {
    display: flex; align-items: center; justify-content: center;
    gap: 0; margin-bottom: 36px;
    animation: fadeUp 0.5s 0.15s ease both;
  }
  .reg-step-item { display: flex; align-items: center; }
  .reg-step-circle {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; transition: all 0.3s;
    border: 1.5px solid rgba(255,255,255,0.1); color: rgba(232,237,245,0.3);
    background: transparent; position: relative;
  }
  .reg-step-circle.done {
    background: rgba(0,200,170,0.15); border-color: #00c8aa; color: #00c8aa;
  }
  .reg-step-circle.current {
    background: #00c8aa; border-color: #00c8aa; color: #050b14;
    box-shadow: 0 0 0 4px rgba(0,200,170,0.15);
  }
  .reg-step-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
    color: rgba(232,237,245,0.3); margin-top: 6px; white-space: nowrap;
    transition: color 0.3s;
  }
  .reg-step-label.current { color: #00c8aa; }
  .reg-step-label.done { color: rgba(0,200,170,0.6); }
  .reg-step-connector {
    width: 60px; height: 1px; margin: 0 8px;
    background: rgba(255,255,255,0.08); position: relative; top: -10px;
    transition: background 0.3s;
  }
  .reg-step-connector.done { background: rgba(0,200,170,0.3); }
  .reg-step-wrap { display: flex; flex-direction: column; align-items: center; }

  /* Card */
  .reg-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px; padding: 40px;
    animation: fadeUp 0.5s 0.2s ease both;
    backdrop-filter: blur(10px);
  }

  .reg-section-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px;
    color: #e8edf5; margin: 0 0 6px; letter-spacing: -0.02em;
  }
  .reg-section-sub { font-size: 13px; color: rgba(232,237,245,0.4); margin: 0 0 28px; }

  /* Emergency toggle */
  .reg-emerg-toggle {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 20px; border-radius: 14px; cursor: pointer;
    border: 1.5px solid rgba(255,255,255,0.08); margin-bottom: 28px;
    background: transparent; transition: all 0.25s; width: 100%;
    text-align: left; font-family: 'DM Sans', sans-serif;
  }
  .reg-emerg-toggle.on {
    border-color: rgba(220,38,38,0.4); background: rgba(220,38,38,0.06);
  }
  .reg-emerg-toggle-icon {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    background: rgba(255,255,255,0.06); display: flex; align-items: center;
    justify-content: center; font-size: 18px; transition: background 0.25s;
  }
  .reg-emerg-toggle.on .reg-emerg-toggle-icon { background: rgba(220,38,38,0.15); }
  .reg-emerg-toggle-text { flex: 1; }
  .reg-emerg-toggle-label { font-weight: 600; font-size: 14px; color: #e8edf5; display: block; }
  .reg-emerg-toggle-desc { font-size: 12px; color: rgba(232,237,245,0.4); display: block; margin-top: 2px; }
  .reg-toggle-switch {
    width: 44px; height: 24px; border-radius: 99px; flex-shrink: 0;
    background: rgba(255,255,255,0.1); position: relative; transition: background 0.25s;
  }
  .reg-emerg-toggle.on .reg-toggle-switch { background: #dc2626; }
  .reg-toggle-knob {
    position: absolute; top: 3px; left: 3px;
    width: 18px; height: 18px; border-radius: 50%; background: white;
    transition: transform 0.25s; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .reg-emerg-toggle.on .reg-toggle-knob { transform: translateX(20px); }

  /* Form grid */
  .reg-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 560px) { .reg-grid2 { grid-template-columns: 1fr; } .reg-card { padding: 24px; } }

  /* Field */
  .reg-field { display: flex; flex-direction: column; gap: 6px; }
  .reg-label {
    font-size: 12px; font-weight: 600; color: rgba(232,237,245,0.5);
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .reg-input, .reg-select, .reg-textarea {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 12px 14px; font-size: 14px;
    color: #e8edf5; font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s, background 0.2s; outline: none; width: 100%;
  }
  .reg-input::placeholder, .reg-textarea::placeholder { color: rgba(232,237,245,0.2); }
  .reg-input:focus, .reg-select:focus, .reg-textarea:focus {
    border-color: rgba(0,200,170,0.4); background: rgba(0,200,170,0.04);
  }
  .reg-select { cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(232,237,245,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 36px;
  }
  .reg-select option { background: #0d1829; color: #e8edf5; }
  .reg-select:disabled { opacity: 0.4; cursor: not-allowed; }
  .reg-textarea { resize: none; line-height: 1.6; }
  .reg-error { font-size: 11px; color: #f87171; margin-top: -2px; }

  /* Symptom chips */
  .reg-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .reg-chip {
    padding: 6px 12px; border-radius: 99px; font-size: 12px; font-weight: 500;
    border: 1px solid rgba(255,255,255,0.1); background: transparent;
    color: rgba(232,237,245,0.5); cursor: pointer; transition: all 0.18s;
    font-family: 'DM Sans', sans-serif;
  }
  .reg-chip:hover {
    border-color: rgba(0,200,170,0.4); color: #00c8aa;
    background: rgba(0,200,170,0.06);
  }

  /* Doctor cards */
  .reg-doctor-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
  .reg-doctor-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 12px; cursor: pointer;
    border: 1.5px solid rgba(255,255,255,0.08); background: transparent;
    transition: all 0.2s; text-align: left; width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .reg-doctor-card:hover { border-color: rgba(0,200,170,0.2); background: rgba(0,200,170,0.04); }
  .reg-doctor-card.selected { border-color: #00c8aa; background: rgba(0,200,170,0.08); }
  .reg-doctor-avatar {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(0,200,170,0.2), rgba(14,165,233,0.2));
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #00c8aa;
    font-family: 'Syne', sans-serif;
  }
  .reg-doctor-name { font-weight: 600; font-size: 14px; color: #e8edf5; display: block; }
  .reg-doctor-spec { font-size: 12px; color: rgba(232,237,245,0.4); display: block; margin-top: 1px; }
  .reg-doctor-badge {
    margin-left: auto; padding: 4px 10px; border-radius: 99px; font-size: 11px;
    font-weight: 600; background: rgba(0,200,170,0.1); color: #00c8aa;
    border: 1px solid rgba(0,200,170,0.2); white-space: nowrap;
  }
  .reg-doctor-badge.busy { background: rgba(251,191,36,0.1); color: #fbbf24; border-color: rgba(251,191,36,0.2); }
  .reg-no-doctors {
    text-align: center; padding: 32px; color: rgba(232,237,245,0.3);
    font-size: 14px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 12px;
  }

  /* Navigation buttons */
  .reg-nav-row {
    display: flex; gap: 12px; margin-top: 36px; padding-top: 28px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .reg-btn-back {
    padding: 13px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
    cursor: pointer; border: 1px solid rgba(255,255,255,0.1);
    background: transparent; color: rgba(232,237,245,0.6);
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .reg-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #e8edf5; }
  .reg-btn-next {
    flex: 1; padding: 13px 24px; border-radius: 12px; font-size: 14px; font-weight: 700;
    cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
    background: linear-gradient(135deg, #00c8aa, #0ea5e9);
    color: #050b14; transition: all 0.2s; display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }
  .reg-btn-next:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,200,170,0.25); }
  .reg-btn-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .reg-btn-next.danger {
    background: linear-gradient(135deg, #dc2626, #b91c1c); color: white;
    box-shadow: none;
  }
  .reg-btn-next.danger:hover { box-shadow: 0 8px 24px rgba(220,38,38,0.3); }

  /* Success screen */
  .reg-success {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; background: #050b14; position: relative;
  }
  .reg-success-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 28px; padding: 48px 40px; max-width: 440px; width: 100%;
    text-align: center; backdrop-filter: blur(20px);
    animation: scaleIn 0.4s ease both;
  }
  .reg-success-ring {
    width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 28px;
    background: rgba(0,200,170,0.1); border: 1.5px solid rgba(0,200,170,0.3);
    display: flex; align-items: center; justify-content: center; font-size: 32px;
  }
  .reg-success-title {
    font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
    letter-spacing: -0.03em; color: #e8edf5; margin: 0 0 8px;
  }
  .reg-success-sub { font-size: 14px; color: rgba(232,237,245,0.4); margin: 0 0 32px; }
  .reg-token-box {
    background: rgba(0,200,170,0.06); border: 1px solid rgba(0,200,170,0.2);
    border-radius: 16px; padding: 24px; margin-bottom: 20px;
  }
  .reg-token-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #00c8aa; font-weight: 600; margin-bottom: 8px; }
  .reg-token-value {
    font-family: 'Syne', sans-serif; font-size: 42px; font-weight: 800;
    color: #e8edf5; letter-spacing: 0.05em;
  }
  .reg-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .reg-stat-box { background: rgba(255,255,255,0.04); border-radius: 12px; padding: 16px; }
  .reg-stat-label { font-size: 11px; color: rgba(232,237,245,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .reg-stat-val { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #e8edf5; }
  .reg-queue-id { font-size: 11px; color: rgba(232,237,245,0.3); margin-bottom: 28px; }
  .reg-queue-id code {
    background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 6px;
    font-family: monospace; font-size: 11px; color: rgba(232,237,245,0.5);
  }
  .reg-success-btns { display: flex; gap: 10px; }
  .reg-success-btn-primary {
    flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700;
    cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
    background: linear-gradient(135deg, #00c8aa, #0ea5e9); color: #050b14;
    transition: opacity 0.2s;
  }
  .reg-success-btn-primary:hover { opacity: 0.85; }
  .reg-success-btn-secondary {
    flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    border: 1px solid rgba(255,255,255,0.12); background: transparent;
    color: rgba(232,237,245,0.6); transition: all 0.2s;
  }
  .reg-success-btn-secondary:hover { border-color: rgba(255,255,255,0.2); color: #e8edf5; }

  /* Ambulance tab */
  .reg-amb-call {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.25);
    border-radius: 16px; padding: 18px 22px; margin-bottom: 20px;
  }
  .reg-amb-call p { margin: 0; font-size: 14px; font-weight: 700; color: #fca5a5; }
  .reg-amb-call span { font-size: 12px; color: rgba(252,165,165,0.5); }
  .reg-amb-call-btn {
    background: rgba(220,38,38,0.2); border: 1px solid rgba(220,38,38,0.4);
    color: #fca5a5; font-size: 16px; font-weight: 800; padding: 10px 20px;
    border-radius: 10px; text-decoration: none; font-family: 'Syne', sans-serif;
    transition: background 0.2s;
  }
  .reg-amb-call-btn:hover { background: rgba(220,38,38,0.3); }

  .reg-reason-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  .reg-reason-chip {
    padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: 1px solid rgba(255,255,255,0.1);
    background: transparent; color: rgba(232,237,245,0.5);
    transition: all 0.18s; font-family: 'DM Sans', sans-serif;
  }
  .reg-reason-chip:hover { border-color: rgba(220,38,38,0.3); color: #fca5a5; }
  .reg-reason-chip.selected {
    border-color: rgba(220,38,38,0.5); background: rgba(220,38,38,0.12);
    color: #fca5a5;
  }

  .reg-how-box {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 20px 22px; margin-top: 4px;
  }
  .reg-how-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(232,237,245,0.4); margin: 0 0 14px; }
  .reg-how-step { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
  .reg-how-num {
    width: 22px; height: 22px; border-radius: 50%; background: rgba(220,38,38,0.15);
    border: 1px solid rgba(220,38,38,0.3); color: #fca5a5; font-size: 11px;
    font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .reg-how-text { font-size: 13px; color: rgba(232,237,245,0.5); line-height: 1.5; margin: 1px 0 0; }

  /* Ambulance success */
  .reg-amb-success-ring {
    width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 28px;
    background: rgba(220,38,38,0.1); border: 1.5px solid rgba(220,38,38,0.3);
    display: flex; align-items: center; justify-content: center; font-size: 36px;
  }
  .reg-amb-hotline {
    background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2);
    border-radius: 14px; padding: 20px; margin-bottom: 20px;
  }
  .reg-amb-hotline-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(252,165,165,0.5); margin-bottom: 6px; }
  .reg-amb-hotline-num { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: #fca5a5; }
  .reg-tips { text-align: left; }
  .reg-tips-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(232,237,245,0.4); margin: 0 0 12px; }
  .reg-tip { display: flex; gap: 10px; margin-bottom: 8px; }
  .reg-tip-num {
    width: 20px; height: 20px; border-radius: 50%; background: rgba(220,38,38,0.15);
    color: #fca5a5; font-size: 10px; font-weight: 800;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
  }
  .reg-tip-text { font-size: 13px; color: rgba(232,237,245,0.45); line-height: 1.5; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .space-y > * + * { margin-top: 16px; }
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

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    defaultValues: { isEmergency: false, gender: 'male' }
  });

  const ambulanceForm = useForm();
  const watchDept = watch('department');
  const watchSymptoms = watch('symptoms');

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAmbulanceSubmitted(true);
      toast.success('🚑 Ambulance dispatched!');
    } catch {
      toast.error('Failed. Please call 108 immediately.');
    } finally {
      setAmbulanceLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (registeredTicket) return (
    <>
      <style>{css}</style>
      <div className="reg-success">
        <div className="reg-ambient" />
        <div className="reg-grid" />
        <div className="reg-success-card">
          <div className="reg-success-ring">✓</div>
          <h2 className="reg-success-title">You're in the queue</h2>
          <p className="reg-success-sub">Your token has been issued. Please wait for your turn.</p>
          <div className="reg-token-box">
            <div className="reg-token-label">Your Token</div>
            <div className="reg-token-value">{registeredTicket.token}</div>
          </div>
          <div className="reg-stats-row">
            <div className="reg-stat-box">
              <div className="reg-stat-label">Est. Wait</div>
              <div className="reg-stat-val">{registeredTicket.estimatedWaitMinutes}<span style={{fontSize:14,fontWeight:400,color:'rgba(232,237,245,0.4)'}}> min</span></div>
            </div>
            <div className="reg-stat-box">
              <div className="reg-stat-label">Position</div>
              <div className="reg-stat-val">#{registeredTicket.position}</div>
            </div>
          </div>
          <p className="reg-queue-id">Queue ID: <code>{registeredTicket.queueId}</code></p>
          <div className="reg-success-btns">
            <button className="reg-success-btn-primary" onClick={() => window.location.href = `/track/${registeredTicket.queueId}`}>
              Track Status →
            </button>
            <button className="reg-success-btn-secondary" onClick={() => { setRegisteredTicket(null); setStep(0); setIsEmergency(false); setSelectedDoctorId(''); }}>
              New Patient
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── Ambulance success ───────────────────────────────────────────────────────
  if (ambulanceSubmitted) return (
    <>
      <style>{css}</style>
      <div className="reg-success">
        <div className="reg-ambient" />
        <div className="reg-grid" />
        <div className="reg-success-card">
          <div className="reg-amb-success-ring">🚑</div>
          <h2 className="reg-success-title">Ambulance Dispatched</h2>
          <p className="reg-success-sub">Our team is on the way to your location.</p>
          <div className="reg-amb-hotline">
            <div className="reg-amb-hotline-label">Emergency Helpline</div>
            <div className="reg-amb-hotline-num">📞 108</div>
          </div>
          <div className="reg-tips">
            <p className="reg-tips-title">While you wait</p>
            {['Stay calm and keep the patient still', 'Keep airways clear', 'Apply pressure to bleeding wounds', 'Do not give food or water', 'Stay at the pickup location'].map((t, i) => (
              <div key={i} className="reg-tip">
                <span className="reg-tip-num">{i + 1}</span>
                <span className="reg-tip-text">{t}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <button className="reg-success-btn-secondary" style={{ width: '100%' }}
              onClick={() => { setAmbulanceSubmitted(false); setSelectedReason(''); ambulanceForm.reset(); }}>
              Request Another Ambulance
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="reg-root">
        <div className="reg-ambient" />
        <div className="reg-grid" />

        {/* Nav */}
        <nav className="reg-nav">
          <a href="/" className="reg-logo">
            <div className="reg-logo-mark">🏥</div>
            HospitalQ
          </a>
          <div className="reg-nav-links">
            <a href="/track" className="reg-nav-btn">Track Queue</a>
            <a href="/login" className="reg-nav-btn primary">Staff Login →</a>
          </div>
        </nav>

        <div className="reg-body">

          {/* Header */}
          <div className="reg-header">
            <div className="reg-pill">🏥 Smart Queue System</div>
            <h1 className="reg-title">Register for <span>Queue</span></h1>
            <p className="reg-subtitle">Fast, priority-based patient registration with real-time tracking</p>
          </div>

          {/* Emergency banner */}
          <div className="reg-emerg-banner">
            <div className="reg-emerg-left">
              <div className="reg-emerg-icon">🚑</div>
              <div>
                <p className="reg-emerg-title">Rural Emergency? Need Ambulance?</p>
                <p className="reg-emerg-sub">We bridge the gap — pickup from your village</p>
              </div>
            </div>
            <button className="reg-emerg-btn" onClick={() => setActiveTab('ambulance')}>
              Request 🚨
            </button>
          </div>

          {/* Tab switcher */}
          <div className="reg-tabs">
            <button className={`reg-tab ${activeTab === 'register' ? 'active-queue' : ''}`}
              onClick={() => setActiveTab('register')}>
              🏥 Register for Queue
            </button>
            <button className={`reg-tab ${activeTab === 'ambulance' ? 'active-amb' : ''}`}
              onClick={() => setActiveTab('ambulance')}>
              🚑 Ambulance Service
            </button>
          </div>

          {/* ── REGISTER TAB ──────────────────────────────────────────────── */}
          {activeTab === 'register' && (
            <>
              {/* Step indicator */}
              <div className="reg-steps">
                {STEPS.map((label, i) => (
                  <div key={i} className="reg-step-item">
                    <div className="reg-step-wrap">
                      <div className={`reg-step-circle ${i < step ? 'done' : i === step ? 'current' : ''}`}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <div className={`reg-step-label ${i < step ? 'done' : i === step ? 'current' : ''}`}>
                        {label}
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`reg-step-connector ${i < step ? 'done' : ''}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="reg-card">
                <form onSubmit={handleSubmit(onSubmit)}>

                  {/* Step 0 — Patient Info */}
                  {step === 0 && (
                    <>
                      <p className="reg-section-title">Patient Information</p>
                      <p className="reg-section-sub">Basic details about the patient</p>

                      {/* Emergency toggle */}
                      <button type="button" className={`reg-emerg-toggle ${isEmergency ? 'on' : ''}`}
                        onClick={() => setIsEmergency(e => !e)}>
                        <div className="reg-emerg-toggle-icon">🚨</div>
                        <div className="reg-emerg-toggle-text">
                          <span className="reg-emerg-toggle-label">Emergency Case</span>
                          <span className="reg-emerg-toggle-desc">Mark for critical conditions — priority +100 in queue</span>
                        </div>
                        <div className="reg-toggle-switch">
                          <div className="reg-toggle-knob" />
                        </div>
                      </button>

                      <div className="reg-grid2">
                        <div className="reg-field">
                          <label className="reg-label">Full Name *</label>
                          <input className="reg-input" placeholder="e.g. Ramesh Kumar"
                            {...register('name', { required: 'Name is required' })} />
                          {errors.name && <span className="reg-error">{errors.name.message}</span>}
                        </div>
                        <div className="reg-field">
                          <label className="reg-label">Phone Number *</label>
                          <input className="reg-input" placeholder="+91 98765 43210"
                            {...register('phone', { required: 'Phone is required' })} />
                          {errors.phone && <span className="reg-error">{errors.phone.message}</span>}
                        </div>
                        <div className="reg-field">
                          <label className="reg-label">Age *</label>
                          <input type="number" className="reg-input" placeholder="e.g. 35"
                            {...register('age', { required: true, min: 0, max: 150 })} />
                          {errors.age && <span className="reg-error">Valid age required</span>}
                        </div>
                        <div className="reg-field">
                          <label className="reg-label">Gender</label>
                          <select className="reg-select" {...register('gender')}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 1 — Symptoms */}
                  {step === 1 && (
                    <>
                      <p className="reg-section-title">Symptoms & Reason</p>
                      <p className="reg-section-sub">Describe what brought the patient in today</p>
                      <div className="reg-field">
                        <label className="reg-label">Describe Symptoms *</label>
                        <textarea className="reg-textarea" rows={4}
                          placeholder="Describe symptoms, duration, and severity..."
                          {...register('symptoms', { required: 'Please describe symptoms' })} />
                        {errors.symptoms && <span className="reg-error">{errors.symptoms.message}</span>}
                        <div className="reg-chips">
                          {SYMPTOM_SUGGESTIONS.map(s => (
                            <button key={s} type="button" className="reg-chip"
                              onClick={() => setValue('symptoms', s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2 — Department & Doctor */}
                  {step === 2 && (
                    <>
                      <p className="reg-section-title">Department & Doctor</p>
                      <p className="reg-section-sub">Choose your department to see available doctors</p>
                      <div className="reg-field" style={{ marginBottom: 24 }}>
                        <label className="reg-label">Department *</label>
                        <select className="reg-select"
                          {...register('department', { required: 'Select a department' })}>
                          <option value="">Select department...</option>
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.department && <span className="reg-error">{errors.department.message}</span>}
                      </div>

                      {watchDept && (
                        <div className="reg-field">
                          <label className="reg-label">Available Doctors</label>
                          <div className="reg-doctor-grid">
                            {doctors.length === 0 ? (
                              <div className="reg-no-doctors">No available doctors in this department right now</div>
                            ) : doctors.map(d => (
                              <button key={d.id} type="button"
                                className={`reg-doctor-card ${selectedDoctorId === d.id ? 'selected' : ''}`}
                                onClick={() => setSelectedDoctorId(d.id)}>
                                <div className="reg-doctor-avatar">
                                  {d.name?.charAt(0) ?? 'D'}
                                </div>
                                <div>
                                  <span className="reg-doctor-name">Dr. {d.name}</span>
                                  <span className="reg-doctor-spec">{d.specialization}</span>
                                </div>
                                <span className={`reg-doctor-badge ${d.avg_consultation_minutes > 15 ? 'busy' : ''}`}>
                                  ~{d.avg_consultation_minutes} min
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Navigation */}
                  <div className="reg-nav-row">
                    {step > 0 && (
                      <button type="button" className="reg-btn-back" onClick={() => setStep(s => s - 1)}>
                        ← Back
                      </button>
                    )}
                    {step < 2 ? (
                      <button type="button" className="reg-btn-next" onClick={nextStep}>
                        Continue →
                      </button>
                    ) : (
                      <button type="submit" className={`reg-btn-next ${isEmergency ? 'danger' : ''}`}
                        disabled={loading || !selectedDoctorId}>
                        {loading ? '⏳ Registering...' : isEmergency ? '🚨 Register Emergency' : '🎫 Get My Token'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ── AMBULANCE TAB ─────────────────────────────────────────────── */}
          {activeTab === 'ambulance' && (
            <>
              {/* Call 108 */}
              <div className="reg-amb-call">
                <div>
                  <p>Life-threatening emergency?</p>
                  <span>Call the national ambulance helpline immediately</span>
                </div>
                <a href="tel:108" className="reg-amb-call-btn">📞 108</a>
              </div>

              <div className="reg-card">
                <p className="reg-section-title">Request Ambulance</p>
                <p className="reg-section-sub">Emergency pickup for rural & remote areas</p>

                <form onSubmit={ambulanceForm.handleSubmit(onAmbulanceSubmit)} className="space-y">
                  <div className="reg-grid2">
                    <div className="reg-field" style={{ gridColumn: '1 / -1' }}>
                      <label className="reg-label">Patient Name *</label>
                      <input className="reg-input" placeholder="Full name of patient"
                        {...ambulanceForm.register('patientName', { required: true })} />
                    </div>
                    <div className="reg-field">
                      <label className="reg-label">Contact Number *</label>
                      <input className="reg-input" placeholder="9876543210"
                        {...ambulanceForm.register('phone', { required: true })} />
                    </div>
                    <div className="reg-field">
                      <label className="reg-label">Patient Age</label>
                      <input type="number" className="reg-input" placeholder="e.g. 45"
                        {...ambulanceForm.register('age')} />
                    </div>
                  </div>

                  <div className="reg-field">
                    <label className="reg-label">Emergency Reason *</label>
                    <div className="reg-reason-chips">
                      {AMBULANCE_REASONS.map(r => (
                        <button key={r} type="button"
                          className={`reg-reason-chip ${selectedReason === r ? 'selected' : ''}`}
                          onClick={() => setSelectedReason(r)}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <textarea className="reg-textarea" rows={2}
                      placeholder="Any additional details about the emergency..."
                      {...ambulanceForm.register('additionalInfo')} />
                  </div>

                  <div className="reg-field">
                    <label className="reg-label">📍 Pickup Location *</label>
                    <textarea className="reg-textarea" rows={2}
                      placeholder="House no., Street, Village / Town, District, State"
                      {...ambulanceForm.register('address', { required: true })} />
                    <input className="reg-input" style={{ marginTop: 8 }}
                      placeholder="Nearest landmark (e.g. Near Shiv Mandir)"
                      {...ambulanceForm.register('landmark')} />
                    <input className="reg-input" style={{ marginTop: 8 }}
                      placeholder="Pin Code"
                      {...ambulanceForm.register('pinCode')} />
                  </div>

                  <div className="reg-how-box">
                    <p className="reg-how-title">How it works</p>
                    {[
                      'Submit form with patient & location details',
                      'System alerts the nearest available ambulance',
                      'Ambulance dispatched to your pickup point',
                      'Patient transported & pre-registered at hospital',
                    ].map((t, i) => (
                      <div key={i} className="reg-how-step">
                        <div className="reg-how-num">{i + 1}</div>
                        <p className="reg-how-text">{t}</p>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="reg-btn-next danger" style={{ width: '100%' }}
                    disabled={ambulanceLoading}>
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
