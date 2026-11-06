'use client';

import { useState, useRef, useEffect } from 'react';
import { FiEdit2, FiCheck, FiX, FiLock } from 'react-icons/fi';

/**
 * EditableField
 * -------------
 * Renders either a static display value (for non-admins / view mode)
 * or an inline edit control (for admins only).
 *
 * Props:
 *   value       - current display value (string | number)
 *   onSave      - async (newValue) => void   called when admin confirms edit
 *   isAdmin     - boolean; only admins see the edit icon / pencil
 *   type        - 'text' | 'number' | 'select' | 'textarea'  (default: 'text')
 *   options     - array of { value, label } – used when type='select'
 *   className   - extra classes for the display span
 *   inputClass  - extra classes for the input element
 *   prefix      - string shown before value in display mode (e.g. 'KSh ')
 *   placeholder - placeholder for the input
 *   disabled    - force non-editable even for admin
 */
export default function EditableField({
  value,
  onSave,
  isAdmin = false,
  type = 'text',
  options = [],
  className = '',
  inputClass = '',
  prefix = '',
  placeholder = '',
  disabled = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Sync draft when parent value changes
  useEffect(() => {
    if (!editing) setDraft(String(value ?? ''));
  }, [value, editing]);

  // Auto-focus the input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
    }
  }, [editing]);

  const handleEdit = () => {
    setDraft(String(value ?? ''));
    setError('');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!onSave) { setEditing(false); return; }
    setSaving(true);
    setError('');
    try {
      const parsed = type === 'number' ? Number(draft) : draft.trim();
      if (type === 'number' && isNaN(parsed)) {
        setError('Please enter a valid number.');
        setSaving(false);
        return;
      }
      await onSave(parsed);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  // ── View mode ──
  if (!editing) {
    return (
      <span className={`inline-flex items-center gap-1 group ${className}`}>
        <span>
          {prefix}
          {value ?? '—'}
        </span>
        {isAdmin && !disabled && (
          <button
            onClick={handleEdit}
            title="Edit (Admin only)"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#E31E24] ml-1 p-0.5 rounded"
          >
            <FiEdit2 className="w-3 h-3" />
          </button>
        )}
        {!isAdmin && (
          <FiLock
            className="w-2.5 h-2.5 text-gray-300 ml-1 flex-shrink-0"
            title="Read-only – Admin only"
          />
        )}
      </span>
    );
  }

  // ── Edit mode (admin) ──
  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-1">
        {type === 'select' ? (
          <select
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`border border-[#E31E24] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#E31E24]/30 bg-white ${inputClass}`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            className={`border border-[#E31E24] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#E31E24]/30 bg-white resize-none ${inputClass}`}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`border border-[#E31E24] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#E31E24]/30 bg-white ${inputClass}`}
          />
        )}

        {/* Confirm */}
        <button
          onClick={handleSave}
          disabled={saving}
          title="Save"
          className="text-[#009639] hover:text-green-700 disabled:opacity-50 p-0.5 rounded"
        >
          <FiCheck className="w-4 h-4" />
        </button>

        {/* Cancel */}
        <button
          onClick={handleCancel}
          disabled={saving}
          title="Cancel"
          className="text-gray-400 hover:text-red-600 p-0.5 rounded"
        >
          <FiX className="w-4 h-4" />
        </button>
      </span>

      {error && <span className="text-[10px] text-red-600 font-semibold">{error}</span>}
    </span>
  );
}

