import React from 'react';
import { Cheque, ChequeStatus } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ChequeTableProps {
  cheques: Cheque[];
  onDelete: (id: string) => void;
  onEdit: (cheque: Cheque) => void;
}

const statusWeight = {
  [ChequeStatus.BOUNCE]: 0,
  [ChequeStatus.POSTDATED]: 1,
  [ChequeStatus.CLEAR]: 2,
};

export const ChequeTable: React.FC<ChequeTableProps> = ({ cheques, onDelete, onEdit }) => {
  const sortedCheques = [...cheques].sort((a, b) => {
    const weightA = statusWeight[a.status];
    const weightB = statusWeight[b.status];
    if (weightA !== weightB) return weightA - weightB;
    // Secondary sort by date (descending)
    return b.chequeDateBS.localeCompare(a.chequeDateBS);
  });

  const getStatusBadge = (status: ChequeStatus) => {
    switch (status) {
      case ChequeStatus.BOUNCE: return "bg-red-600 text-white";
      case ChequeStatus.POSTDATED: return "bg-blue-600 text-white";
      case ChequeStatus.CLEAR: return "bg-green-600 text-white";
    }
  };

  const getRowClasses = (status: ChequeStatus) => {
    switch (status) {
      case ChequeStatus.BOUNCE: return "bg-[#fee2e2] border-l-4 border-l-red-500";
      case ChequeStatus.POSTDATED: return "bg-[#dbeafe] border-l-4 border-l-blue-500";
      case ChequeStatus.CLEAR: return "bg-[#dcfce7] border-l-4 border-l-green-500";
    }
  };

  return (
    <div className="w-full flex-1 overflow-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200">Bank Details</th>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200">Customer Name</th>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200">Date (BS)</th>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200">Received (BS)</th>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200">Amount (NPR)</th>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200">Contact No.</th>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200">Remark</th>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200">Status</th>
            <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight bg-[#f8fafc] border-b border-slate-200 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y-0 text-slate-700">
          {sortedCheques.map((cheque) => (
            <motion.tr
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={cheque.id}
              className={cn("group transition-colors", getRowClasses(cheque.status))}
            >
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200">
                <div className="font-semibold text-[13px]">{cheque.bankName}</div>
              </td>
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200">
                <div className="text-[13px] font-medium text-slate-900">{cheque.customerName || '-'}</div>
              </td>
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200 whitespace-nowrap text-[13px] font-mono">
                {cheque.chequeDateBS}
              </td>
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200 whitespace-nowrap text-[13px] font-mono">
                {cheque.receivedDateBS}
              </td>
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200 text-[13px] font-bold">
                {new Intl.NumberFormat('en-NP', { minimumFractionDigits: 2 }).format(cheque.amount)}
              </td>
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200 text-[13px]">
                {cheque.contactNo}
              </td>
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200 text-[13px] max-w-[150px] truncate" title={cheque.remarks}>
                {cheque.remarks || '-'}
              </td>
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200">
                <span className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                  getStatusBadge(cheque.status)
                )}>
                  {cheque.status}
                </span>
              </td>
              <td className="px-3 py-2.5 border-b border-dotted border-slate-200 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(cheque)}
                    className="p-1 px-2 text-[11px] font-bold uppercase text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(cheque.id)}
                    className="p-1 px-2 text-[11px] font-bold uppercase text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
          {sortedCheques.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-xs uppercase tracking-widest font-bold">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
