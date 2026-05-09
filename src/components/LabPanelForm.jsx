import { useState, useMemo } from 'react';
import { getKnownTestNames } from '../data/labData';
import { toLocalDateStr } from '../utils/dateUtils';

// Modal form for adding or editing a lab panel.
// Props:
//   initial:   optional existing panel { id?, date, source, provider, values }
//   onSubmit:  async (panel) => void   — caller handles add vs update
//   onCancel:  () => void
//   onDelete:  optional async () => void — only shown in edit mode

const COMMON_SOURCES = ['Labcorp', 'NIH Clinical Center', 'Quest', 'H&H Labs', 'Atrium Health'];
const FLAGS = ['', 'high', 'low', 'critical', 'abnormal'];

function emptyRow() {
  return { name: '', value: '', unit: '', flag: '', ref: '', note: '' };
}

// Convert Firestore values map → editable rows array
function valuesToRows(values) {
  return Object.entries(values || {}).map(([name, v]) => ({
    name,
    value: v.value ?? '',
    unit: v.unit ?? '',
    flag: v.flag || '',
    ref: v.ref ?? '',
    note: v.note ?? '',
  }));
}

// Convert rows back to a values map
function rowsToValues(rows) {
  const out = {};
  for (const r of rows) {
    if (!r.name.trim()) continue;
    const value = r.value === '' ? null : (isNaN(r.value) ? r.value : Number(r.value));
    out[r.name.trim()] = {
      value,
      unit: r.unit,
      flag: r.flag || null,
      ref: r.ref,
      note: r.note,
    };
  }
  return out;
}

export default function LabPanelForm({ initial, onSubmit, onCancel, onDelete }) {
  const isEdit = !!initial?.id;

  const [date, setDate] = useState(initial?.date || toLocalDateStr());
  const [source, setSource] = useState(initial?.source || 'Labcorp');
  const [provider, setProvider] = useState(initial?.provider || '');
  const [rows, setRows] = useState(
    initial?.values ? valuesToRows(initial.values) : [emptyRow(), emptyRow(), emptyRow()]
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Autocomplete suggestions pulled from existing static + Firestore panels
  const knownTests = useMemo(() => getKnownTestNames(), []);

  const updateRow = (i, patch) => {
    setRows(rs => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const addRow = () => setRows(rs => [...rs, emptyRow()]);
  const removeRow = (i) => setRows(rs => rs.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    try {
      await onSubmit({
        date,
        source,
        provider: provider.trim(),
        values: rowsToValues(rows),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-3xl w-full my-8" onClick={e => e.stopPropagation()}>
        <form onSubmit={submit}>
          <div className="p-5 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Lab Panel' : 'New Lab Panel'}</h2>
            <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
          </div>

          {/* Header fields */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-slate-700">
            <label className="block">
              <span className="text-xs text-slate-400 block mb-1">Date</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
            </label>
            <label className="block">
              <span className="text-xs text-slate-400 block mb-1">Source</span>
              <input type="text" list="lab-sources" value={source} onChange={e => setSource(e.target.value)}
                placeholder="Labcorp / NIH / etc."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500" />
              <datalist id="lab-sources">
                {COMMON_SOURCES.map(s => <option key={s} value={s} />)}
              </datalist>
            </label>
            <label className="block">
              <span className="text-xs text-slate-400 block mb-1">Provider (optional)</span>
              <input type="text" value={provider} onChange={e => setProvider(e.target.value)}
                placeholder="Last, First"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500" />
            </label>
          </div>

          {/* Test rows */}
          <div className="p-5 space-y-2 max-h-[50vh] overflow-y-auto">
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-slate-500 font-medium px-1">
              <span className="col-span-3">Test name</span>
              <span className="col-span-2">Value</span>
              <span className="col-span-2">Unit</span>
              <span className="col-span-1">Flag</span>
              <span className="col-span-2">Ref range</span>
              <span className="col-span-2">Note</span>
            </div>
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input type="text" list="known-tests" placeholder="e.g. ApoB" value={r.name}
                  onChange={e => updateRow(i, { name: e.target.value })}
                  className="col-span-3 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500" />
                <input type="text" placeholder="—" value={r.value}
                  onChange={e => updateRow(i, { value: e.target.value })}
                  className="col-span-2 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500" />
                <input type="text" placeholder="mg/dL" value={r.unit}
                  onChange={e => updateRow(i, { unit: e.target.value })}
                  className="col-span-2 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500" />
                <select value={r.flag} onChange={e => updateRow(i, { flag: e.target.value })}
                  className="col-span-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white">
                  {FLAGS.map(f => <option key={f} value={f}>{f || '—'}</option>)}
                </select>
                <input type="text" placeholder="0-99" value={r.ref}
                  onChange={e => updateRow(i, { ref: e.target.value })}
                  className="col-span-2 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500" />
                <div className="col-span-2 flex gap-1">
                  <input type="text" placeholder="note" value={r.note}
                    onChange={e => updateRow(i, { note: e.target.value })}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500" />
                  <button type="button" onClick={() => removeRow(i)}
                    className="text-slate-400 hover:text-red-400 px-2" title="Remove row">×</button>
                </div>
              </div>
            ))}
            <datalist id="known-tests">
              {knownTests.map(n => <option key={n} value={n} />)}
            </datalist>
            <button type="button" onClick={addRow}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300">+ Add row</button>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-700 flex items-center justify-between">
            <div>
              {isEdit && onDelete && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-400">Delete this panel?</span>
                    <button type="button" onClick={async () => { await onDelete(); }}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Yes, delete</button>
                    <button type="button" onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-400 px-2 py-1">Cancel</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(true)}
                    className="text-sm text-red-400 hover:text-red-300">Delete panel</button>
                )
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onCancel}
                className="px-4 py-2 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add panel'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
