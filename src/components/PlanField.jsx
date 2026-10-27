import { useState } from 'react';

// Keep typing local. A transaction commits once on blur, rather than replacing
// each keystroke with a subscription value while the network write is pending.
export default function PlanField({ value, onCommit, ...props }) {
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const normalized = text => props.type === 'number' && text !== '' && text != null ? String(Number(text)) : String(text ?? '');
  // Clear the buffer only after the subscription echoes the saved value. This
  // conditional render adjustment also permits later remote changes to show.
  if (draft?.saved && normalized(value) === normalized(draft.text)) setDraft(null);
  const commit = async event => {
    if (draft === null || draft.saved || saving || !event.target.reportValidity()) return;
    if (normalized(draft.text) === normalized(value)) { setDraft(null); return; }
    setSaving(true);
    try {
      if (await onCommit(draft.text)) setDraft({ ...draft, saved: true });
    } finally { setSaving(false); }
  };
  return <input {...props} value={draft?.text ?? value ?? ''} disabled={saving}
    aria-busy={saving} onChange={event => setDraft({ text: event.target.value, saved: false })} onBlur={commit}
    onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} />;
}
