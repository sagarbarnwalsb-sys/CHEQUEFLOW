import React, { useState, useEffect } from 'react';
import { Cheque, ChequeStatus, BankDetail, CustomerDetail } from '../types';
import { BSDatePicker } from './BSDatePicker';
import { X, Save, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChequeFormProps {
  initialData?: Cheque | null;
  banks: BankDetail[];
  customers: CustomerDetail[];
  onSave: (data: Partial<Cheque>) => void;
  onCancel: () => void;
  onAddBank: () => void;
  onAddCustomer: () => void;
}

export const ChequeForm: React.FC<ChequeFormProps> = ({ initialData, banks, customers, onSave, onCancel, onAddBank, onAddCustomer }) => {
  const [formData, setFormData] = useState<Partial<Cheque>>({
    bankName: '',
    customerName: '',
    amount: 0,
    chequeDateBS: '',
    receivedDateBS: '',
    contactNo: '',
    status: ChequeStatus.POSTDATED,
    remarks: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankName || !formData.customerName || !formData.amount || !formData.chequeDateBS || !formData.receivedDateBS) {
      alert("Please fill all required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-bottom border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded text-white italic">
              <Plus size={14} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-[#0f172a]">
              {initialData ? 'Update Cheque Record' : 'Record New Cheque Entry'}
            </h2>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Bank *</label>
                <button 
                  type="button" 
                  onClick={onAddBank}
                  className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold uppercase transition-colors"
                >
                  <Plus size={10} /> Register Bank
                </button>
              </div>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium"
                required
              >
                <option value="">-- Select Registered Bank --</option>
                {banks.map(bank => (
                  <option key={bank.id} value={bank.bankName}>{bank.bankName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer Name *</label>
                <button 
                  type="button" 
                  onClick={onAddCustomer}
                  className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold uppercase transition-colors"
                >
                  <Plus size={10} /> Register Customer
                </button>
              </div>
              <select
                value={formData.customerName || ''}
                onChange={(e) => {
                  const selectedCustomer = customers.find(c => c.customerName === e.target.value);
                  setFormData({ 
                    ...formData, 
                    customerName: e.target.value,
                    contactNo: selectedCustomer?.contactNo || formData.contactNo 
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium"
                required
              >
                <option value="">-- Select Registered Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.customerName}>{customer.customerName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Settlement Amount *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Contact Reference</label>
              <input
                type="text"
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                placeholder="Primary Contact"
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
              />
            </div>

            <BSDatePicker
              label="Dated BS *"
              value={formData.chequeDateBS || ''}
              onChange={(val) => setFormData({ ...formData, chequeDateBS: val })}
            />

            <BSDatePicker
              label="Received BS *"
              value={formData.receivedDateBS || ''}
              onChange={(val) => setFormData({ ...formData, receivedDateBS: val })}
            />

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Asset Status *</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(ChequeStatus).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={cn(
                      "py-2 px-3 rounded text-[9px] font-bold uppercase tracking-[0.1em] border transition-all",
                      formData.status === status 
                        ? (status === ChequeStatus.BOUNCE ? "bg-red-600 border-red-700 text-white shadow-sm" : 
                           status === ChequeStatus.CLEAR ? "bg-green-600 border-green-700 text-white shadow-sm" : 
                           "bg-blue-600 border-blue-700 text-white shadow-sm")
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Remarks / Notes</label>
              <textarea
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional details (e.g. Bill No, Purpose)"
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 min-h-[60px]"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#0f172a] text-white rounded text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
            >
              <Save size={14} />
              Commit Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
