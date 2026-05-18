import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
// @ts-expect-error - no types for ad-bs-converter
import adbs from 'ad-bs-converter';

interface BSDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const BSDatePicker: React.FC<BSDatePickerProps> = ({ value, onChange, label, className }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = val;
    if (val.length > 4) {
      formatted = val.slice(0, 4) + '/' + val.slice(4);
    }
    if (val.length > 6) {
      formatted = formatted.slice(0, 7) + '/' + val.slice(6);
    }
    
    setLocalValue(formatted);
    if (formatted.length === 10) {
      if (adbs) {
        // ad-bs-converter can be used for extra validation here if desired
      }
      onChange(formatted);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</label>}
      <input
        type="text"
        placeholder="YYYY/MM/DD (BS)"
        value={localValue}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-slate-200 rounded font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium transition-all"
        maxLength={10}
      />
    </div>
  );
};
