import React, { useState } from 'react';
import { BankDetail } from '../types';
import { X, Save, Building2 } from 'lucide-react';

interface BankFormProps {
  onSave: (data: Partial<BankDetail>) => void;
  onCancel: () => void;
}

export const BankForm: React.FC<BankFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<BankDetail>>({
    bankName: '',
    accountNumber: '',
    branch: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankName) {
      alert("Bank name is required");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-bottom border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded text-white">
              <Building2 size={14} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-[#0f172a]">Secure Bank Directory</h2>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Institution Name *</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g. Nepal Investment Bank"
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Identity</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 uppercase placeholder:text-slate-300"
              placeholder="ACC-0000-0000"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Branch Location</label>
            <input
              type="text"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
              placeholder="Main Branch / Corporate"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#0f172a] text-white rounded text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
            >
              <Save size={14} />
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
