import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Cheque, ChequeStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, CheckCircle2, AlertCircle, Clock, Users, Building2 } from 'lucide-react';

interface ReportsOverviewProps {
  cheques: Cheque[];
}

const COLORS = {
  [ChequeStatus.CLEAR]: '#22c55e', // Green
  [ChequeStatus.POSTDATED]: '#3b82f6', // Blue
  [ChequeStatus.BOUNCE]: '#ef4444', // Red
};

export const ReportsOverview: React.FC<ReportsOverviewProps> = ({ cheques }) => {
  // 2. Amount Distribution Data
  const amountData = useMemo(() => {
    const sums = cheques.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sums).map(([name, value]) => ({ name, value }));
  }, [cheques]);

  // 3. Top Customers (by amount)
  const topCustomers = useMemo(() => {
    const customerSum = cheques.reduce((acc, curr) => {
      acc[curr.customerName] = (acc[curr.customerName] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(customerSum)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [cheques]);

  // 4. Monthly Volume (BS Months)
  const monthlyVolume = useMemo(() => {
    const months = [
      'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];

    const volume = cheques.reduce((acc, curr) => {
      // Assuming format YYYY/MM/DD
      const monthIndex = parseInt(curr.chequeDateBS.split('/')[1]) - 1;
      const monthName = months[monthIndex] || 'Unknown';
      acc[monthName] = (acc[monthName] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return months.map(name => ({ name, amount: volume[name] || 0 }));
  }, [cheques]);

  const stats = {
    total: cheques.reduce((sum, c) => sum + c.amount, 0),
    cleared: cheques.filter(c => c.status === ChequeStatus.CLEAR).reduce((sum, c) => sum + c.amount, 0),
    postdated: cheques.filter(c => c.status === ChequeStatus.POSTDATED).reduce((sum, c) => sum + c.amount, 0),
    bounced: cheques.filter(c => c.status === ChequeStatus.BOUNCE).reduce((sum, c) => sum + c.amount, 0),
    successRate: cheques.length > 0 ? (cheques.filter(c => c.status === ChequeStatus.CLEAR).length / cheques.length) * 100 : 0,
    bounceRate: cheques.length > 0 ? (cheques.filter(c => c.status === ChequeStatus.BOUNCE).length / cheques.length) * 100 : 0,
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NP', { 
      style: 'currency', 
      currency: 'NPR', 
      maximumFractionDigits: 1 
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Volume</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
          <div className="text-[10px] text-slate-400 mt-1">{cheques.length} Total Cheques</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cleared Cash</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.cleared)}</div>
          <div className="text-[10px] text-slate-400 mt-1">{Math.round(stats.successRate)}% Success Rate</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bounced Value</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.bounced)}</div>
          <div className="text-[10px] text-slate-400 mt-1">{Math.round(stats.bounceRate)}% Bounce Rate</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending (PDC)</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(stats.postdated)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting Settlement</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Volume Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-800">Monthly Volume (BS)</h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Financial Year</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyVolume}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={val => formatCurrency(val).replace('NPR', '')}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [formatCurrency(val), 'Volume']}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution (Amount) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Status Breakdown (Value)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={amountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {amountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as ChequeStatus] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [formatCurrency(val), 'Amount']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Parties */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
          <div className="flex items-center gap-2 mb-6">
             <Users size={18} className="text-slate-400" />
             <h3 className="text-sm font-bold text-slate-800">Top 5 Parties (Value)</h3>
          </div>
          <div className="space-y-4">
            {topCustomers.map((customer, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{customer.name}</span>
                  <span className="font-mono text-slate-500">{formatCurrency(customer.amount)}</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(customer.amount / topCustomers[0].amount) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
            {topCustomers.length === 0 && <p className="text-xs text-slate-400 italic">No customer data available yet.</p>}
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
          <div className="flex items-center gap-2 mb-6">
             <Building2 size={18} className="text-slate-400" />
             <h3 className="text-sm font-bold text-slate-800">Operational Breakdown</h3>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Bank-wise Diversity</span>
                <span className="text-sm font-bold">{[...new Set(cheques.map(c => c.bankName))].length} Institutions</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Active Parties</span>
                <span className="text-sm font-bold">{[...new Set(cheques.map(c => c.customerName))].length} Registered</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Average Cheque Value</span>
                <span className="text-sm font-bold">{formatCurrency(cheques.length > 0 ? stats.total / cheques.length : 0)}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Clearance Efficiency</span>
                <span className="text-sm font-bold text-green-600">{Math.round(stats.successRate)}%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
