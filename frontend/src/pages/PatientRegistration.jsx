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

export default function PatientRegistration() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [registeredTicket, setRegisteredTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [ambulanceLoading, setAmbulanceLoading] = useState(false);
  const [ambulanceSubmitted, setAmbulanceSubmitted] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { isEmergency: false, gender: 'male' }
  });

  const ambulanceForm = useForm();
  const watchDept = watch('department');

  useEffect(() => {
    doctorAPI.getDepartments().then(r => setDepartments(r.data || []));
  }, []);

  useEffect(() => {
    if (watchDept) {
      doctorAPI.getAll({ department: watchDept, available: true })
        .then(r => setDoctors(r.data || []));
    }
  }, [watchDept]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await queueAPI.register({
        ...data,
        age: parseInt(data.age),
        isEmergency: data.isEmergency === true || data.isEmergency === 'true',
      });
      setRegisteredTicket(result.data);
      toast.success('Registered successfully!');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
      toast.success('🚑 Ambulance dispatched! Help is on the way.');
    } catch {
      toast.error('Failed. Please call 108 immediately.');
    } finally {
      setAmbulanceLoading(false);
    }
  };

  // ── Ticket success ─────────────────────────────────────────────────────────
  if (registeredTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You're Registered!</h2>
          <div className="bg-blue-50 rounded-xl p-6 my-4">
            <p className="text-sm text-blue-600 font-medium mb-1">Your Token Number</p>
            <p className="text-4xl font-bold text-blue-700 tracking-wider">{registeredTicket.token}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-orange-600">Estimated Wait</p>
              <p className="text-2xl font-bold text-orange-700">{registeredTicket.estimatedWaitMinutes} min</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600">Queue Position</p>
              <p className="text-2xl font-bold text-purple-700">#{registeredTicket.position}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Save your Queue ID: <br />
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{registeredTicket.queueId}</code>
          </p>
          <div className="flex gap-3">
            <button onClick={() => window.location.href = `/track/${registeredTicket.queueId}`}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
              Track Status
            </button>
            <button onClick={() => setRegisteredTicket(null)}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50">
              New Patient
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Ambulance success ──────────────────────────────────────────────────────
  if (ambulanceSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚑</div>
          <div className="bg-red-600 rounded-xl p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Ambulance Dispatched!</h2>
            <p className="text-red-100 text-sm mb-4">Our team is on the way to your location.</p>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs text-red-100 mb-1">Emergency Helpline</p>
              <p className="text-3xl font-bold">📞 108</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-3">While waiting for the ambulance:</p>
            {['Stay calm and keep the patient still',
              'Keep airways clear — tilt head back slightly',
              'Apply pressure to any bleeding wounds',
              'Do not give food or water',
              'Keep someone at the pickup location to guide the driver'].map((tip, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setAmbulanceSubmitted(false); setSelectedReason(''); ambulanceForm.reset(); }}
            className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50">
            Request Another Ambulance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Staff Login header */}
      <div className="flex justify-end px-6 pt-4">
        <a href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 border border-blue-300 px-4 py-2 rounded-full bg-white shadow-sm transition-colors">
          🔐 Staff Login →
        </a>
      </div>

      <div className="max-w-2xl mx-auto py-6 px-4">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span>🏥</span> Hospital Queue System
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Smart Hospital Bridge</h1>
          <p className="text-gray-500 mt-2">Queue registration & rural ambulance service</p>
        </div>

        {/* Emergency ambulance banner */}
        <div className="bg-red-600 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚑</span>
            <div>
              <p className="font-bold text-white text-sm">Rural Emergency? Need Ambulance?</p>
              <p className="text-red-200 text-xs">We bridge the gap — pickup from your village</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('ambulance')}
            className="bg-white text-red-600 font-bold text-sm px-4 py-2 rounded-xl flex-shrink-0 hover:bg-red-50 transition-colors">
            Request 🚨
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 bg-white rounded-2xl p-1.5 shadow mb-6">
          <button onClick={() => setActiveTab('register')}
            className={`py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'register' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            🏥 Register for Queue
          </button>
          <button onClick={() => setActiveTab('ambulance')}
            className={`py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'ambulance' ? 'bg-red-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            🚑 Ambulance Service
          </button>
        </div>

        {/* ── REGISTER TAB ───────────────────────────────────────────────── */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Emergency checkbox */}
              <label className="flex items-center gap-3 p-4 border-2 border-red-200 bg-red-50 rounded-xl cursor-pointer hover:border-red-400 transition-colors">
                <input type="checkbox" {...register('isEmergency')} className="w-5 h-5 text-red-600 rounded" />
                <div>
                  <p className="font-semibold text-red-700">🚨 Emergency Case</p>
                  <p className="text-sm text-red-500">Check for critical conditions requiring immediate attention</p>
                </div>
              </label>

              {/* Personal info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input {...register('name', { required: 'Name is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input {...register('phone', { required: 'Phone required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input type="number" {...register('age', { required: true, min: 0, max: 150 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select {...register('gender')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Department & Doctor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select {...register('department', { required: 'Select department' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                  <select {...register('doctorId', { required: 'Select doctor' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!watchDept}>
                    <option value="">Select doctor...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.name} ({d.avg_consultation_minutes} min avg)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms / Reason *</label>
                <textarea {...register('symptoms', { required: 'Please describe symptoms' })} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your symptoms..." />
                <div className="flex flex-wrap gap-2 mt-2">
                  {SYMPTOM_SUGGESTIONS.map(s => (
                    <button key={s} type="button" onClick={() => setValue('symptoms', s)}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <><span className="animate-spin">⏳</span> Registering...</> : <>Get My Token 🎫</>}
              </button>
            </form>
          </div>
        )}

        {/* ── AMBULANCE TAB ──────────────────────────────────────────────── */}
        {activeTab === 'ambulance' && (
          <div className="space-y-4">

            {/* Call 108 banner */}
            <div className="bg-red-600 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Life-threatening emergency?</p>
                <p className="text-red-200 text-sm">Call national ambulance helpline immediately</p>
              </div>
              <a href="tel:108" className="bg-white text-red-600 font-bold text-xl px-5 py-2 rounded-xl no-underline hover:bg-red-50">
                📞 108
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Request Ambulance</h2>
                <p className="text-gray-500 text-sm mt-1">Emergency pickup for rural & remote areas</p>
              </div>

              <form onSubmit={ambulanceForm.handleSubmit(onAmbulanceSubmit)} className="space-y-5">

                {/* Patient details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                    <input {...ambulanceForm.register('patientName', { required: true })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Full name of patient" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input {...ambulanceForm.register('phone', { required: true })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Age</label>
                    <input type="number" {...ambulanceForm.register('age')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g. 45" />
                  </div>
                </div>

                {/* Emergency reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Reason *</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {AMBULANCE_REASONS.map(r => (
                      <button key={r} type="button" onClick={() => setSelectedReason(r)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${selectedReason === r ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400 hover:text-red-600'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea {...ambulanceForm.register('additionalInfo')} rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Any other details about the emergency..." />
                </div>

                {/* Pickup location */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">📍 Pickup Location *</label>
                  <textarea {...ambulanceForm.register('address', { required: true })} rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="House no., Street, Village / Town, District, State" />
                  <input {...ambulanceForm.register('landmark')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nearest landmark (e.g. Near Shiv Mandir, Behind Gram Panchayat)" />
                  <input {...ambulanceForm.register('pinCode')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Pin Code" />
                </div>

                {/* How it works */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">How it works</p>
                  {[
                    { icon: '📝', text: 'Submit this form with patient & location details' },
                    { icon: '📡', text: 'Our system alerts the nearest available ambulance' },
                    { icon: '🚑', text: 'Ambulance is dispatched to your pickup location' },
                    { icon: '🏥', text: 'Patient is transported and pre-registered at hospital' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 mb-2">
                      <span className="text-lg">{step.icon}</span>
                      <p className="text-sm text-gray-600">{step.text}</p>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={ambulanceLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {ambulanceLoading ? <><span className="animate-spin">⏳</span> Dispatching...</> : <>🚑 Request Ambulance Now</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
