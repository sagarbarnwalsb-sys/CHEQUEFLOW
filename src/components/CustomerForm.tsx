import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { CustomerDetail } from '../types';
import { motion } from 'motion/react';

interface CustomerFormProps {
  onSave: (data: Partial<CustomerDetail>) => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<CustomerDetail>>({
    customerName: '',
    contactNo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} />
            <h3 className="font-bold tracking-tight">Register New Customer</h3>
          </div>
          <button onClick={onCancel} className="hover:bg-white/10 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer Name *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Full Name of Party"
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Primary Contact (Optional)</label>
            <input
              type="text"
              value={formData.contactNo}
              onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
              placeholder="Phone or Mobile Number"
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Save Record
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
