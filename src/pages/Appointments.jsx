import { useState } from 'react';
import { APPOINTMENT_TYPES } from '../constants';

export default function Appointments({ data, updateAppointment, addAppointment, deleteAppointment }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: '', doctor: '', date: '', time: '', location: '', notes: '', status: 'scheduled' });
  const todayStr = new Date().toISOString().split('T')[0];

  const appointments = data?.appointments || [];
  const upcoming = appointments.filter(a => a.status === 'scheduled' && a.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const needsScheduling = appointments.filter(a => a.status === 'needs-scheduling');
  const past = appointments.filter(a => a.status === 'completed' || (a.date && a.date < todayStr && a.status === 'scheduled')).sort((a, b) => b.date.localeCompare(a.date));

  const formatDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
  const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date(todayStr)) / 86400000) : null;

  const submitAdd = (e) => {
    e.preventDefault();
    if (!form.type) return;
    addAppointment({ ...form });
    setForm({ type: '', doctor: '', date: '', time: '', location: '', notes: '', status: form.date ? 'scheduled' : 'needs-scheduling' });
    setShowAdd(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New
        </button>
      </div>

      {/* Needs scheduling */}
      {needsScheduling.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">⚠️ Needs Scheduling</h2>
          {needsScheduling.map(appt => {
            const type = APPOINTMENT_TYPES.find(t => t.id === appt.type) || APPOINTMENT_TYPES[7];
            return (
              <div key={appt.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{type.label}</div>
                    {appt.notes && <div className="text-sm text-gray-500">{appt.notes}</div>}
                  </div>
                  <button
                    onClick={() => {
                      const date = prompt('Enter date (YYYY-MM-DD):');
                      if (date) updateAppointment(appt.id, { date, status: 'scheduled' });
                    }}
                    className="bg-amber-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            No upcoming appointments
          </div>
        ) : (
          upcoming.map(appt => {
            const type = APPOINTMENT_TYPES.find(t => t.id === appt.type) || APPOINTMENT_TYPES[7];
            const days = daysUntil(appt.date);
            return (
              <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: type.color + '15' }}>
                    {type.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{type.label}</div>
                    {appt.doctor && <div className="text-sm text-gray-600">{appt.doctor}</div>}
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(appt.date)}
                      {appt.time && ` at ${appt.time}`}
                      {days !== null && <span className="ml-2 text-blue-600 font-medium">({days} days)</span>}
                    </div>
                    {appt.location && <div className="text-xs text-gray-400 mt-1">📍 {appt.location}</div>}
                    {appt.notes && <div className="text-xs text-gray-400 mt-1">{appt.notes}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => updateAppointment(appt.id, { status: 'completed' })}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Done</button>
                    <button onClick={() => deleteAppointment(appt.id)}
                      className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">×</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Past</h2>
          {past.map(appt => {
            const type = APPOINTMENT_TYPES.find(t => t.id === appt.type) || APPOINTMENT_TYPES[7];
            return (
              <div key={appt.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{type.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">{type.label}</div>
                    <div className="text-xs text-gray-500">{formatDate(appt.date)}</div>
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Completed</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">New Appointment</h3>
            <form onSubmit={submitAdd} className="space-y-3">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" required>
                <option value="">Select type...</option>
                {APPOINTMENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                ))}
              </select>
              <input type="text" placeholder="Doctor name" value={form.doctor}
                onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <input type="text" placeholder="Location" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <input type="text" placeholder="Notes" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
