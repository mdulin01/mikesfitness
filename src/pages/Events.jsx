import { useState } from 'react';
import { ALL_EVENT_TYPES, MEDICAL_EVENT_TYPES, FITNESS_EVENT_TYPES, SOCIAL_EVENT_TYPES } from '../constants';
import { toLocalDateStr } from '../utils/dateUtils';

const EVENT_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📅' },
  { id: 'medical', label: 'Medical', emoji: '🩺' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'social', label: 'Social', emoji: '🎉' },
];

export default function Events({ data, updateAppointment, addAppointment, deleteAppointment, ...rest }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null); // appointment being edited
  const [editForm, setEditForm] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [form, setForm] = useState({ type: '', category: 'medical', doctor: '', date: '', time: '', location: '', notes: '', status: 'scheduled' });
  const todayStr = toLocalDateStr();

  const appointments = data?.appointments || [];

  // Filter by category
  const filtered = activeCategory === 'all'
    ? appointments
    : appointments.filter(a => {
        const type = ALL_EVENT_TYPES.find(t => t.id === a.type);
        return type?.category === activeCategory || a.category === activeCategory;
      });

  const upcoming = filtered.filter(a => a.status === 'scheduled' && a.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const needsScheduling = filtered.filter(a => a.status === 'needs-scheduling');
  const past = filtered.filter(a => a.status === 'completed' || (a.date && a.date < todayStr && a.status === 'scheduled')).sort((a, b) => b.date.localeCompare(a.date));

  const formatDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
  const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date(todayStr)) / 86400000) : null;

  // Get event types for selected category in form
  const getTypesForCategory = (cat) => {
    switch (cat) {
      case 'medical': return MEDICAL_EVENT_TYPES;
      case 'fitness': return FITNESS_EVENT_TYPES;
      case 'social': return SOCIAL_EVENT_TYPES;
      default: return ALL_EVENT_TYPES;
    }
  };

  const submitAdd = (e) => {
    e.preventDefault();
    if (!form.type) return;
    const eventType = ALL_EVENT_TYPES.find(t => t.id === form.type);
    addAppointment({ ...form, category: eventType?.category || form.category });
    setForm({ type: '', category: 'medical', doctor: '', date: '', time: '', location: '', notes: '', status: form.date ? 'scheduled' : 'needs-scheduling' });
    setShowAdd(false);
  };

  const startEdit = (appt) => {
    setEditingAppt(appt);
    setEditForm({
      type: appt.type || '',
      category: appt.category || 'medical',
      doctor: appt.doctor || '',
      date: appt.date || '',
      time: appt.time || '',
      location: appt.location || '',
      notes: appt.notes || '',
      status: appt.status || 'scheduled',
      prepNotes: appt.prepNotes || '',
      followUp: appt.followUp || '',
      referral: appt.referral || '',
    });
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editingAppt) return;
    const eventType = ALL_EVENT_TYPES.find(t => t.id === editForm.type);
    updateAppointment(editingAppt.id, {
      ...editForm,
      category: eventType?.category || editForm.category,
      status: editForm.date ? (editForm.status === 'needs-scheduling' ? 'scheduled' : editForm.status) : editForm.status,
    });
    setEditingAppt(null);
    setEditForm(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📅 Events</h1>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 bg-slate-700/50 rounded-lg p-1">
        {EVENT_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === cat.id ? 'bg-slate-600 text-blue-400 shadow-sm' : 'text-slate-400'
            }`}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Needs scheduling */}
      {needsScheduling.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">⚠️ Needs Scheduling</h2>
          {needsScheduling.map(appt => {
            const type = ALL_EVENT_TYPES.find(t => t.id === appt.type) || ALL_EVENT_TYPES[ALL_EVENT_TYPES.length - 1];
            return (
              <div key={appt.id} className="bg-amber-900/30 border border-amber-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{appt.notes || type.label}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      type.category === 'medical' ? 'bg-blue-900/40 text-blue-400' :
                      type.category === 'fitness' ? 'bg-green-900/40 text-green-400' :
                      'bg-purple-900/40 text-purple-400'
                    }`}>{type.category}</span>
                  </div>
                  {schedulingId === appt.id ? (
                    <div className="flex items-center gap-2">
                      <input type="date" value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white" />
                      <button onClick={() => {
                        if (scheduleDate) {
                          updateAppointment(appt.id, { date: scheduleDate, status: 'scheduled' });
                          setSchedulingId(null);
                          setScheduleDate('');
                        }
                      }} className="bg-green-600 text-white px-2 py-1 rounded-lg text-sm">Save</button>
                      <button onClick={() => { setSchedulingId(null); setScheduleDate(''); }}
                        className="bg-slate-600 text-white px-2 py-1 rounded-lg text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(appt)}
                        className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">Edit</button>
                      <button onClick={() => { setSchedulingId(appt.id); setScheduleDate(toLocalDateStr()); }}
                        className="bg-amber-600 text-white px-3 py-1 rounded-lg text-sm">Schedule</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center text-slate-500 text-sm">
            No upcoming events
          </div>
        ) : (
          upcoming.map(appt => {
            const type = ALL_EVENT_TYPES.find(t => t.id === appt.type) || ALL_EVENT_TYPES[ALL_EVENT_TYPES.length - 1];
            const days = daysUntil(appt.date);
            return (
              <div key={appt.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: type.color + '20' }}>
                    {type.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-white">{appt.notes || type.label}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        type.category === 'medical' ? 'bg-blue-900/40 text-blue-400' :
                        type.category === 'fitness' ? 'bg-green-900/40 text-green-400' :
                        'bg-purple-900/40 text-purple-400'
                      }`}>{type.category}</span>
                    </div>
                    {appt.doctor && <div className="text-sm text-slate-300">{appt.doctor}</div>}
                    <div className="text-sm text-slate-400 mt-1">
                      {formatDate(appt.date)}
                      {appt.time && ` at ${appt.time}`}
                      {days !== null && <span className="ml-2 text-blue-400 font-medium">({days} days)</span>}
                    </div>
                    {appt.location && <div className="text-xs text-slate-500 mt-1">📍 {appt.location}</div>}
                    {appt.prepNotes && <div className="text-xs text-amber-400/80 mt-1">📝 Prep: {appt.prepNotes}</div>}
                    {appt.followUp && <div className="text-xs text-blue-400/80 mt-1">↩️ Follow-up: {appt.followUp}</div>}
                    {appt.referral && <div className="text-xs text-purple-400/80 mt-1">🔗 Referral: {appt.referral}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(appt)}
                      className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => updateAppointment(appt.id, { status: 'completed' })}
                      className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded">✓</button>
                    <button onClick={() => deleteAppointment(appt.id)}
                      className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">×</button>
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
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Past</h2>
          {past.map(appt => {
            const type = ALL_EVENT_TYPES.find(t => t.id === appt.type) || ALL_EVENT_TYPES[ALL_EVENT_TYPES.length - 1];
            return (
              <div key={appt.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 opacity-70">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{type.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-300">{appt.notes || type.label}</div>
                    {appt.doctor && <div className="text-xs text-slate-400">{appt.doctor}</div>}
                    <div className="text-xs text-slate-500">{formatDate(appt.date)}</div>
                    {appt.followUp && <div className="text-xs text-blue-400/70 mt-1">↩️ {appt.followUp}</div>}
                  </div>
                  <div className="flex gap-1 items-center">
                    <button onClick={() => startEdit(appt)}
                      className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">Edit</button>
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-full">Done</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">New Event</h3>
            <form onSubmit={submitAdd} className="space-y-3">
              {/* Category selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'medical', label: 'Medical', emoji: '🩺' },
                  { id: 'fitness', label: 'Fitness', emoji: '💪' },
                  { id: 'social', label: 'Social', emoji: '🎉' },
                ].map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.id, type: '' }))}
                    className={`p-2 rounded-lg text-center text-xs transition-all ${
                      form.category === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                    <div className="text-lg">{cat.emoji}</div>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Type selector */}
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" required>
                <option value="">Select type...</option>
                {getTypesForCategory(form.category).map(t => (
                  <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                ))}
              </select>

              {/* Doctor/Contact — only for medical */}
              {form.category === 'medical' && (
                <input type="text" placeholder="Doctor name" value={form.doctor}
                  onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              )}

              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <input type="text" placeholder="Location" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Notes / Description" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingAppt && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setEditingAppt(null); setEditForm(null); }}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Edit Event</h3>
            <form onSubmit={submitEdit} className="space-y-3">
              {/* Category */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'medical', label: 'Medical', emoji: '🩺' },
                  { id: 'fitness', label: 'Fitness', emoji: '💪' },
                  { id: 'social', label: 'Social', emoji: '🎉' },
                ].map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => setEditForm(f => ({ ...f, category: cat.id, type: '' }))}
                    className={`p-2 rounded-lg text-center text-xs transition-all ${
                      editForm.category === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                    <div className="text-lg">{cat.emoji}</div>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Type */}
              <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white">
                <option value="">Select type...</option>
                {getTypesForCategory(editForm.category).map(t => (
                  <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                ))}
              </select>

              {/* Doctor */}
              <input type="text" placeholder="Doctor / Contact" value={editForm.doctor}
                onChange={e => setEditForm(f => ({ ...f, doctor: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
                <input type="time" value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              </div>

              {/* Location */}
              <input type="text" placeholder="Location" value={editForm.location}
                onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />

              {/* Notes */}
              <textarea placeholder="Notes / Description" value={editForm.notes} rows={2}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400 resize-none" />

              {/* Extra detail fields for medical visits */}
              <div className="border-t border-slate-700 pt-3 space-y-2">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Details</div>
                <textarea placeholder="Prep notes (fasting, bring records, questions to ask...)" value={editForm.prepNotes} rows={2}
                  onChange={e => setEditForm(f => ({ ...f, prepNotes: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400 resize-none" />
                <textarea placeholder="Follow-up / Results" value={editForm.followUp} rows={2}
                  onChange={e => setEditForm(f => ({ ...f, followUp: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400 resize-none" />
                <input type="text" placeholder="Referral (referred by / referred to)" value={editForm.referral}
                  onChange={e => setEditForm(f => ({ ...f, referral: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              </div>

              {/* Status */}
              <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white">
                <option value="scheduled">Scheduled</option>
                <option value="needs-scheduling">Needs Scheduling</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingAppt(null); setEditForm(null); }}
                  className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
