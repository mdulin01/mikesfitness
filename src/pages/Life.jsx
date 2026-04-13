import { useState, useMemo } from 'react';
import { ALL_EVENT_TYPES, MEDICAL_EVENT_TYPES, FITNESS_EVENT_TYPES, SOCIAL_EVENT_TYPES } from '../constants';
import { toLocalDateStr, offsetDateStr } from '../utils/dateUtils';
import { healthPlan } from '../data/healthPlan';
import { exercisePlan } from '../data/exercisePlan';

const TABS = [
  { id: 'events', label: 'Events', emoji: '📅' },
  { id: 'plan', label: '10-Year Plan', emoji: '🎯' },
  { id: 'review', label: 'Review', emoji: '📋' },
];

const EVENT_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📅' },
  { id: 'medical', label: 'Medical', emoji: '🩺' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'social', label: 'Social', emoji: '🎉' },
];

/* ─── Collapsible Section (for Plan & Review) ─── */
function Section({ title, emoji, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/50 transition-colors">
        <h2 className="font-semibold text-white">{emoji && `${emoji} `}{title}</h2>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4 -mt-1 border-t border-slate-700">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EVENTS TAB
   ═══════════════════════════════════════════════════ */
function EventsTab({ data, updateAppointment, addAppointment, deleteAppointment }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [form, setForm] = useState({ type: '', category: 'medical', doctor: '', date: '', time: '', location: '', notes: '', status: 'scheduled' });
  const todayStr = toLocalDateStr();

  const appointments = data?.appointments || [];

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
    const status = form.date ? 'scheduled' : 'needs-scheduling';
    addAppointment({ ...form, status, category: eventType?.category || form.category });
    setForm({ type: '', category: 'medical', doctor: '', date: '', time: '', location: '', notes: '', status: 'scheduled' });
    setShowAdd(false);
  };

  const [showTodo, setShowTodo] = useState(false);
  const [todoForm, setTodoForm] = useState({ type: '', category: 'medical', notes: '' });
  const submitTodo = (e) => {
    e.preventDefault();
    if (!todoForm.notes) return;
    const eventType = ALL_EVENT_TYPES.find(t => t.id === todoForm.type);
    addAppointment({ ...todoForm, status: 'needs-scheduling', date: '', time: '', location: '', doctor: '', category: eventType?.category || todoForm.category });
    setTodoForm({ type: '', category: 'medical', notes: '' });
    setShowTodo(false);
  };

  const startEdit = (appt) => {
    setEditingAppt(appt);
    setEditForm({
      type: appt.type || '', category: appt.category || 'medical', doctor: appt.doctor || '',
      date: appt.date || '', time: appt.time || '', location: appt.location || '',
      notes: appt.notes || '', status: appt.status || 'scheduled',
      prepNotes: appt.prepNotes || '', followUp: appt.followUp || '', referral: appt.referral || '',
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">{upcoming.length} upcoming · {needsScheduling.length} to schedule</div>
        <div className="flex gap-2">
          <button onClick={() => setShowTodo(true)} className="bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium">+ To-Do</button>
          <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium">+ Event</button>
        </div>
      </div>

      {/* Quick templates */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { label: 'Annual Physical', type: 'primary', category: 'medical', notes: 'Annual physical exam' },
          { label: 'Lab Work', type: 'lab', category: 'medical', notes: 'Routine labs (lipids, CBC, CMP)' },
          { label: 'GI Follow-up', type: 'gi', category: 'medical', notes: "Crohn's follow-up" },
          { label: 'Dentist', type: 'dentist', category: 'medical', notes: 'Dental cleaning' },
          { label: 'Eye Exam', type: 'eye', category: 'medical', notes: 'Annual eye exam' },
          { label: 'Dermatology', type: 'dermatology', category: 'medical', notes: 'Skin check' },
          { label: 'NIH MRI', type: 'other-medical', category: 'medical', notes: 'HPRC MRI surveillance (NIH)' },
        ].map(tmpl => (
          <button key={tmpl.label} onClick={() => {
            addAppointment({ type: tmpl.type, category: tmpl.category, notes: tmpl.notes, status: 'needs-scheduling', date: '', time: '', location: '', doctor: '' });
          }} className="text-xs px-2.5 py-1.5 bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap hover:bg-slate-600 transition-colors border border-slate-600">
            + {tmpl.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
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
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white" />
                      <button onClick={() => { if (scheduleDate) { updateAppointment(appt.id, { date: scheduleDate, status: 'scheduled' }); setSchedulingId(null); setScheduleDate(''); } }}
                        className="bg-green-600 text-white px-2 py-1 rounded-lg text-sm">Save</button>
                      <button onClick={() => { setSchedulingId(null); setScheduleDate(''); }}
                        className="bg-slate-600 text-white px-2 py-1 rounded-lg text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(appt)} className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">Edit</button>
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
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center text-slate-500 text-sm">No upcoming events</div>
        ) : upcoming.map(appt => {
          const type = ALL_EVENT_TYPES.find(t => t.id === appt.type) || ALL_EVENT_TYPES[ALL_EVENT_TYPES.length - 1];
          const days = daysUntil(appt.date);
          return (
            <div key={appt.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: type.color + '20' }}>{type.emoji}</div>
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
                    {formatDate(appt.date)}{appt.time && ` at ${appt.time}`}
                    {days !== null && <span className="ml-2 text-blue-400 font-medium">({days} days)</span>}
                  </div>
                  {appt.location && <div className="text-xs text-slate-500 mt-1">📍 {appt.location}</div>}
                  {appt.prepNotes && <div className="text-xs text-amber-400/80 mt-1">📝 Prep: {appt.prepNotes}</div>}
                  {appt.followUp && <div className="text-xs text-blue-400/80 mt-1">↩️ Follow-up: {appt.followUp}</div>}
                  {appt.referral && <div className="text-xs text-purple-400/80 mt-1">🔗 Referral: {appt.referral}</div>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(appt)} className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">Edit</button>
                  <button onClick={() => updateAppointment(appt.id, { status: 'completed' })} className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded">✓</button>
                  <button onClick={() => deleteAppointment(appt.id)} className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">×</button>
                </div>
              </div>
            </div>
          );
        })}
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
                    <button onClick={() => startEdit(appt)} className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">Edit</button>
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
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'medical', label: 'Medical', emoji: '🩺' }, { id: 'fitness', label: 'Fitness', emoji: '💪' }, { id: 'social', label: 'Social', emoji: '🎉' }].map(cat => (
                  <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, category: cat.id, type: '' }))}
                    className={`p-2 rounded-lg text-center text-xs transition-all ${form.category === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    <div className="text-lg">{cat.emoji}</div>{cat.label}
                  </button>
                ))}
              </div>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" required>
                <option value="">Select type...</option>
                {getTypesForCategory(form.category).map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
              </select>
              {form.category === 'medical' && (
                <input type="text" placeholder="Doctor name" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              )}
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <input type="text" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Notes / Description" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'medical', label: 'Medical', emoji: '🩺' }, { id: 'fitness', label: 'Fitness', emoji: '💪' }, { id: 'social', label: 'Social', emoji: '🎉' }].map(cat => (
                  <button key={cat.id} type="button" onClick={() => setEditForm(f => ({ ...f, category: cat.id, type: '' }))}
                    className={`p-2 rounded-lg text-center text-xs transition-all ${editForm.category === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    <div className="text-lg">{cat.emoji}</div>{cat.label}
                  </button>
                ))}
              </div>
              <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white">
                <option value="">Select type...</option>
                {getTypesForCategory(editForm.category).map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
              </select>
              <input type="text" placeholder="Doctor / Contact" value={editForm.doctor} onChange={e => setEditForm(f => ({ ...f, doctor: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
                <input type="time" value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              </div>
              <input type="text" placeholder="Location" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <textarea placeholder="Notes / Description" value={editForm.notes} rows={2} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400 resize-none" />
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

      {/* To-Do modal (quick add needs-scheduling) */}
      {showTodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTodo(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Add To-Do</h3>
            <p className="text-xs text-slate-400 mb-3">Something that needs to be scheduled</p>
            <form onSubmit={submitTodo} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'medical', label: 'Medical', emoji: '🩺' }, { id: 'fitness', label: 'Fitness', emoji: '💪' }, { id: 'social', label: 'Social', emoji: '🎉' }].map(cat => (
                  <button key={cat.id} type="button" onClick={() => setTodoForm(f => ({ ...f, category: cat.id, type: '' }))}
                    className={`p-2 rounded-lg text-center text-xs transition-all ${todoForm.category === cat.id ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    <div className="text-lg">{cat.emoji}</div>{cat.label}
                  </button>
                ))}
              </div>
              <select value={todoForm.type} onChange={e => setTodoForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white">
                <option value="">Type (optional)</option>
                {getTypesForCategory(todoForm.category).map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
              </select>
              <input type="text" placeholder="What needs to be scheduled?" value={todoForm.notes}
                onChange={e => setTodoForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" required />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowTodo(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium">Add To-Do</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PLAN TAB
   ═══════════════════════════════════════════════════ */
function PlanTab() {
  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Age 59–69 · Cardio + muscle + brain + inflammation + cancer prevention</p>

      {/* Risks */}
      <Section title="The Big Goals" emoji="🎯" defaultOpen={true}>
        <div className="space-y-2 mt-2">
          {healthPlan.risks.map(r => (
            <div key={r.risk} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg text-sm">
              <span className="font-medium text-white">{r.risk}</span>
              <span className="text-slate-400">{r.why}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Meds & Supplements */}
      <Section title="Prevention Stack" emoji="💊" defaultOpen={false}>
        <div className="space-y-2 mt-2">
          {healthPlan.medications.map(m => (
            <div key={m.name} className="flex justify-between items-start p-3 bg-slate-700/50 rounded-lg text-sm">
              <div>
                <div className="font-medium text-white">💊 {m.name}</div>
                <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">{m.category}</span>
              </div>
              <span className="text-slate-400 text-right">{m.why}</span>
            </div>
          ))}
          {healthPlan.supplements.map(s => (
            <div key={s.name} className="flex justify-between items-start p-3 bg-slate-700/50 rounded-lg text-sm">
              <div>
                <div className="font-medium text-white">🧪 {s.name}</div>
                <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">supplement</span>
              </div>
              <span className="text-slate-400 text-right">{s.why}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Lab Schedule */}
      <Section title="Lab Schedule" emoji="🧪" defaultOpen={false}>
        <div className="space-y-3 mt-2">
          {[
            { key: 'every6Months', label: 'Every 6 Months', color: 'blue' },
            { key: 'crohns', label: "Crohn's Monitoring", color: 'purple' },
            { key: 'every3Years', label: 'Every 3 Years', color: 'green' },
            { key: 'every5Years', label: 'Every 5 Years', color: 'amber' },
            { key: 'yearly', label: 'Yearly', color: 'rose' },
          ].map(({ key, label, color }) => (
            <div key={key}>
              <h3 className="text-sm font-medium text-slate-300 mb-2">{label}</h3>
              <div className="flex flex-wrap gap-2">
                {healthPlan.labSchedule[key].map(l => (
                  <span key={l} className={`bg-${color}-900/40 text-${color}-300 px-3 py-1 rounded-full text-xs font-medium`}>{l}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Exercise */}
      <Section title="Exercise" emoji="🏃" defaultOpen={false}>
        <div className="space-y-2 mt-2">
          {exercisePlan.formula.map(f => (
            <div key={f} className="flex items-center gap-2 p-2 bg-green-900/30 rounded text-sm text-green-300">
              <span>✓</span> {f}
            </div>
          ))}
          <div className="text-sm text-slate-400 mt-2">
            Total: <strong className="text-slate-300">{exercisePlan.totalHoursPerWeek} hours/week</strong>
          </div>
        </div>
      </Section>

      {/* Weight & Sleep */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="font-semibold text-white mb-3">⚖️ Weight</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Current</span><span className="text-white font-bold">{healthPlan.weightGoals.current}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Target</span><span className="text-green-400 font-bold">{healthPlan.weightGoals.target}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Waist</span><span className="text-blue-400 font-bold">{healthPlan.weightGoals.waistTarget}</span></div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="font-semibold text-white mb-3">😴 Sleep</h3>
          <div className="text-2xl font-bold text-blue-400 mb-2">{healthPlan.sleepGoals.hours}+ hrs</div>
          <div className="space-y-1">
            {healthPlan.sleepGoals.notes.map(n => <div key={n} className="text-xs text-slate-400">• {n}</div>)}
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
        <h2 className="font-semibold mb-3">At Age 69: The Goal</h2>
        <div className="space-y-2">
          {healthPlan.outcomes.atAge69.map(o => (
            <div key={o} className="flex items-center gap-2 text-sm"><span className="text-green-300">✓</span> {o}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   REVIEW TAB
   ═══════════════════════════════════════════════════ */
function ReviewTab({ data, getWeekKey, save }) {
  const weekKey = getWeekKey();
  const weeklyData = data?.weeklyReview?.[weekKey] || {};

  const [form, setForm] = useState({
    sleepAvg: weeklyData.sleepAvg || '',
    bloodPressure: weeklyData.bloodPressure || '',
    alcohol: weeklyData.alcohol || false,
    notes: weeklyData.notes || '',
    nextWeekPlan: weeklyData.nextWeekPlan || '',
  });

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const getWeekDateRange = (offset = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() - daysToMonday);
    const mondayStr = toLocalDateStr(mondayDate);
    const mondayAdjusted = offsetDateStr(mondayStr, offset * 7);
    const sundayStr = offsetDateStr(mondayAdjusted, 6);
    return { monday: mondayAdjusted, sunday: sundayStr };
  };

  const displayWeek = getWeekDateRange(currentWeekOffset);

  const metrics = useMemo(() => {
    const weekCompletions = data?.weeklyCompletions?.[weekKey] || {};
    const dailyChecklist = data?.dailyChecklist || {};
    const medicationChecks = data?.medicationChecks || {};
    const weightEntries = data?.weightEntries || [];
    const fiberLog = data?.fiberLog || {};

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const workoutsDone = days.filter(d => weekCompletions[d]).length;

    const sortedWeights = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
    const weekStartStr = offsetDateStr(toLocalDateStr(), -6);
    const weightsThisWeek = sortedWeights.filter(w => w.date >= weekStartStr);
    let weightChange = null;
    if (weightsThisWeek.length >= 2) {
      weightChange = (weightsThisWeek[weightsThisWeek.length - 1].weight - weightsThisWeek[0].weight).toFixed(1);
    }

    let habitsCompletedCount = 0, daysWithData = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = offsetDateStr(toLocalDateStr(), -i);
      const dayChecklist = dailyChecklist[dateStr];
      if (dayChecklist) { daysWithData++; habitsCompletedCount += Object.values(dayChecklist).filter(v => v).length; }
    }
    const avgHabitsPerDay = daysWithData > 0 ? (habitsCompletedCount / daysWithData).toFixed(1) : 0;

    const totalMeds = healthPlan.medications.length + healthPlan.supplements.length;
    let medDaysCompleted = 0, medDaysTracked = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = offsetDateStr(toLocalDateStr(), -i);
      const dayMeds = medicationChecks[dateStr];
      if (dayMeds) { medDaysTracked++; if (Object.values(dayMeds).filter(v => v).length === totalMeds) medDaysCompleted++; }
    }
    const medAdherence = medDaysTracked > 0 ? Math.round((medDaysCompleted / medDaysTracked) * 100) : 0;

    let fiberDaysComplete = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = offsetDateStr(toLocalDateStr(), -i);
      const dayFiber = fiberLog[dateStr];
      if (dayFiber?.morning && dayFiber?.evening) fiberDaysComplete++;
    }

    return { workoutsDone, weightChange, avgHabitsPerDay, medAdherence, fiberDaysComplete };
  }, [data, weekKey]);

  const handleSave = () => {
    save({
      weeklyReview: {
        ...data.weeklyReview,
        [weekKey]: {
          sleepAvg: form.sleepAvg ? parseFloat(form.sleepAvg) : null,
          bloodPressure: form.bloodPressure,
          alcohol: form.alcohol,
          notes: form.notes,
          nextWeekPlan: form.nextWeekPlan,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">{formatDate(displayWeek.monday)} – {formatDate(displayWeek.sunday)}</div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentWeekOffset(o => o - 1)} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm">← Prev</button>
          <button onClick={() => setCurrentWeekOffset(0)} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm">Today</button>
          <button onClick={() => setCurrentWeekOffset(o => o + 1)} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm">Next →</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Workouts', value: `${metrics.workoutsDone}/4`, color: 'blue' },
          { label: 'Weight Δ', value: metrics.weightChange === null ? '—' : `${parseFloat(metrics.weightChange) > 0 ? '+' : ''}${metrics.weightChange}`, color: metrics.weightChange && parseFloat(metrics.weightChange) <= 0 ? 'green' : 'red' },
          { label: 'Habits/Day', value: metrics.avgHabitsPerDay, color: 'blue' },
          { label: 'Med Adherence', value: `${metrics.medAdherence}%`, color: 'purple' },
          { label: 'Fiber Days', value: `${metrics.fiberDaysComplete}/7`, color: 'orange' },
        ].map(m => (
          <div key={m.label} className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">{m.label}</div>
            <div className={`text-lg font-bold text-${m.color}-400`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Day breakdown */}
      <div className="grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
          const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][idx];
          const completed = data?.weeklyCompletions?.[weekKey]?.[dayKey];
          return (
            <div key={day} className={`p-2 rounded text-center text-xs font-medium ${completed ? 'bg-green-900/40 text-green-300' : 'bg-slate-700/50 text-slate-400'}`}>
              {completed ? '✓' : '—'} {day}
            </div>
          );
        })}
      </div>

      {/* Review form */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Avg Sleep (hrs)</label>
            <input type="number" step="0.5" min="0" max="12" value={form.sleepAvg} onChange={e => setForm(f => ({ ...f, sleepAvg: e.target.value }))}
              placeholder="7.5" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Avg BP</label>
            <input type="text" value={form.bloodPressure} onChange={e => setForm(f => ({ ...f, bloodPressure: e.target.value }))}
              placeholder="120/80" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Alcohol?</label>
          <div className="flex gap-2">
            <button onClick={() => setForm(f => ({ ...f, alcohol: false }))}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium ${!form.alcohol ? 'bg-green-900/40 text-green-300 border border-green-600' : 'bg-slate-700 text-slate-300'}`}>No</button>
            <button onClick={() => setForm(f => ({ ...f, alcohol: true }))}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium ${form.alcohol ? 'bg-amber-900/40 text-amber-300 border border-amber-600' : 'bg-slate-700 text-slate-300'}`}>Yes</button>
          </div>
        </div>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="How did the week go?" rows="2"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400 resize-none" />
        <textarea value={form.nextWeekPlan} onChange={e => setForm(f => ({ ...f, nextWeekPlan: e.target.value }))} placeholder="Plan for next week?" rows="2"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400 resize-none" />
        <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm">Save Review</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN LIFE PAGE
   ═══════════════════════════════════════════════════ */
export default function Life(props) {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">📅 Life</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
            }`}>
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'events' && <EventsTab {...props} />}
      {activeTab === 'plan' && <PlanTab />}
      {activeTab === 'review' && <ReviewTab {...props} />}
    </div>
  );
}
