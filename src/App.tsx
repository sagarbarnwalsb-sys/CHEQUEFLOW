import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Auth } from './components/Auth';
import { ChequeTable } from './components/ChequeTable';
import { ChequeForm } from './components/ChequeForm';
import { BankForm } from './components/BankForm';
import { CustomerForm } from './components/CustomerForm';
import { ReportsOverview } from './components/ReportsOverview';
import { Cheque, BankDetail, CustomerDetail, UserProfile, OperationType, ChequeStatus } from './types';
import { handleFirestoreError, cn } from './lib/utils';
import { LogOut, Plus, Building2, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [banks, setBanks] = useState<BankDetail[]>([]);
  const [customers, setCustomers] = useState<CustomerDetail[]>([]);
  const [showChequeForm, setShowChequeForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Cheque | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'banks' | 'reports'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCheques = cheques.filter(c => 
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bankName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalsByStatus = {
    [ChequeStatus.BOUNCE]: filteredCheques.filter(c => c.status === ChequeStatus.BOUNCE).reduce((sum, c) => sum + c.amount, 0),
    [ChequeStatus.CLEAR]: filteredCheques.filter(c => c.status === ChequeStatus.CLEAR).reduce((sum, c) => sum + c.amount, 0),
    [ChequeStatus.POSTDATED]: filteredCheques.filter(c => c.status === ChequeStatus.POSTDATED).reduce((sum, c) => sum + c.amount, 0),
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setCheques([]);
      setBanks([]);
      setCustomers([]);
      setUserProfile(null);
      return;
    }

    // Fetch Profile
    const profileRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    });

    // Fetch Cheques
    const chequesRef = collection(db, 'users', user.uid, 'cheques');
    const qCheques = query(chequesRef);
    const unsubCheques = onSnapshot(qCheques, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Cheque));
      setCheques(docs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'cheques'));

    // Fetch Banks
    const banksRef = collection(db, 'users', user.uid, 'banks');
    const qBanks = query(banksRef);
    const unsubBanks = onSnapshot(qBanks, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as BankDetail));
      setBanks(docs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'banks'));

    // Fetch Customers
    const customersRef = collection(db, 'users', user.uid, 'customers');
    const qCustomers = query(customersRef);
    const unsubCustomers = onSnapshot(qCustomers, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerDetail));
      setCustomers(docs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'customers'));

    return () => {
      unsubProfile();
      unsubCheques();
      unsubBanks();
      unsubCustomers();
    };
  }, [user]);

  const handleSaveCheque = async (data: Partial<Cheque>) => {
    if (!user) return;
    try {
      const chequeData = {
        userId: user.uid,
        bankName: data.bankName || '',
        customerName: data.customerName || '',
        amount: data.amount || 0,
        chequeDateBS: data.chequeDateBS || '',
        receivedDateBS: data.receivedDateBS || '',
        contactNo: data.contactNo || '',
        status: data.status || ChequeStatus.POSTDATED,
        remarks: data.remarks || '',
        updatedAt: serverTimestamp(),
      };

      if (editingCheque) {
        const docRef = doc(db, 'users', user.uid, 'cheques', editingCheque.id);
        await updateDoc(docRef, chequeData);
      } else {
        const colRef = collection(db, 'users', user.uid, 'cheques');
        await addDoc(colRef, {
          ...chequeData,
          createdAt: serverTimestamp(),
        });
      }
      setShowChequeForm(false);
      setEditingCheque(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/cheques`);
    }
  };

  const handleDeleteCheque = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cheques', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/cheques/${id}`);
    }
  };

  const handleSaveBank = async (data: Partial<BankDetail>) => {
    if (!user) return;
    try {
      const colRef = collection(db, 'users', user.uid, 'banks');
      
      const bankObject: Record<string, string | number | ReturnType<typeof serverTimestamp>> = {
        userId: user.uid,
        bankName: data.bankName || '',
        createdAt: serverTimestamp(),
      };

      if (data.branch) bankObject.branch = data.branch;
      if (data.accountNumber) bankObject.accountNumber = data.accountNumber;

      await addDoc(colRef, bankObject);
      setShowBankForm(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/banks`);
    }
  };

  const handleSaveCustomer = async (data: Partial<CustomerDetail>) => {
    if (!user) return;
    try {
      const colRef = collection(db, 'users', user.uid, 'customers');
      
      const customerObject: Record<string, string | number | ReturnType<typeof serverTimestamp>> = {
        userId: user.uid,
        customerName: data.customerName || '',
        createdAt: serverTimestamp(),
      };

      if (data.contactNo) customerObject.contactNo = data.contactNo;

      await addDoc(colRef, customerObject);
      setShowCustomerForm(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/customers`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E4E3E0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] text-[#1e293b] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0f172a] text-white flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-blue-600 p-1.5 rounded text-white">
              <Wallet size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ChequeReport</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Bikram Sambat Ledger</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 py-2 px-3 rounded text-sm font-medium transition-colors relative",
              activeTab === 'dashboard' ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"
            )}
          >
            {activeTab === 'dashboard' && <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r" />}
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('entry')}
            className={cn(
              "w-full flex items-center gap-3 py-2 px-3 rounded text-sm font-medium transition-colors relative",
              activeTab === 'entry' ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"
            )}
          >
            {activeTab === 'entry' && <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r" />}
            Cheque Ledger
          </button>
          <button 
            onClick={() => setActiveTab('banks')}
            className={cn(
              "w-full flex items-center gap-3 py-2 px-3 rounded text-sm font-medium transition-colors relative",
              activeTab === 'banks' ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"
            )}
          >
            {activeTab === 'banks' && <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r" />}
            Bank Accounts
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={cn(
              "w-full flex items-center gap-3 py-2 px-3 rounded text-sm font-medium transition-colors relative",
              activeTab === 'reports' ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"
            )}
          >
            {activeTab === 'reports' && <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r" />}
            Reports
          </button>
        </nav>

        <div className="p-4 bg-[#020617] text-[10px] text-slate-500 font-medium text-center italic">
          v1.0.4 • Created by Sagar Barnwal
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
              {userProfile?.firmName?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{userProfile?.firmName || user.displayName || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="ml-auto p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold tracking-tight capitalize shrink-0">{activeTab.replace('-', ' ')}</h2>
            
            {(activeTab === 'dashboard' || activeTab === 'entry') && (
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search customer or bank..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-1.5 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(activeTab === 'dashboard' || activeTab === 'entry') && (
              <>
                <button
                  onClick={() => setShowBankForm(true)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <Building2 size={16} className="text-slate-500" />
                  Bank Records
                </button>
                <button
                  onClick={() => setShowChequeForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Cheque
                </button>
              </>
            )}
          </div>
        </header>

        {/* Stats Summary Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-12 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {searchQuery ? `Filtered Status (${searchQuery}):` : 'Overall:'}
            </span>
            <span className="text-sm font-bold text-slate-900">
              {new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' }).format(filteredCheques.reduce((acc, curr) => acc + curr.amount, 0))}
            </span>
          </div>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-red-600">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span>Bounce: {new Intl.NumberFormat('en-NP').format(totalsByStatus[ChequeStatus.BOUNCE])}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span>Postdated: {new Intl.NumberFormat('en-NP').format(totalsByStatus[ChequeStatus.POSTDATED])}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                <span>Cleared: {new Intl.NumberFormat('en-NP').format(totalsByStatus[ChequeStatus.CLEAR])}</span>
              </div>
          </div>
        </div>

        {/* Dynamic Content Section */}
        <section className="flex-1 overflow-hidden p-6 flex flex-col bg-[#f1f5f9]">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6 h-full overflow-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Volume Overview</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{cheques.length}</span>
                      <span className="text-xs text-slate-400">Total Entries</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total Liquidity</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-600">
                        {new Intl.NumberFormat('en-NP').format(totalsByStatus[ChequeStatus.CLEAR] + totalsByStatus[ChequeStatus.POSTDATED])}
                      </span>
                      <span className="text-xs text-slate-400">NPR</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bank Institutions</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{banks.length}</span>
                      <span className="text-xs text-slate-400">Registered</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <ChequeTable 
                    cheques={filteredCheques} 
                    onDelete={handleDeleteCheque}
                    onEdit={(c) => {
                      setEditingCheque(c);
                      setShowChequeForm(true);
                    }}
                    onCustomerClick={setSearchQuery}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'entry' && (
              <motion.div 
                key="entry-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden"
              >
                <ChequeTable 
                  cheques={filteredCheques} 
                  onDelete={handleDeleteCheque}
                  onEdit={(c) => {
                    setEditingCheque(c);
                    setShowChequeForm(true);
                  }}
                  onCustomerClick={setSearchQuery}
                />
              </motion.div>
            )}

            {activeTab === 'banks' && (
              <motion.div
                key="banks-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col p-6 overflow-auto h-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold">Registered Banks</h3>
                  <button onClick={() => setShowBankForm(true)} className="text-xs font-bold text-blue-600 hover:underline">+ Add New</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {banks.map(bank => (
                    <div key={`bank-${bank.id}`} className="p-4 border border-slate-100 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 size={16} className="text-slate-400" />
                        <span className="font-bold text-sm">{bank.bankName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">ACC: {bank.accountNumber || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500">Branch: {bank.branch || 'General'}</div>
                    </div>
                  ))}
                  {banks.length === 0 && <p className="text-slate-400 text-sm italic">No banks registered yet.</p>}
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 overflow-hidden"
              >
                <ReportsOverview cheques={cheques} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {showChequeForm && (
          <ChequeForm 
            key="cheque-form-overlay"
            initialData={editingCheque}
            banks={banks}
            customers={customers}
            onSave={handleSaveCheque}
            onCancel={() => {
              setShowChequeForm(false);
              setEditingCheque(null);
            }}
            onAddBank={() => setShowBankForm(true)}
            onAddCustomer={() => setShowCustomerForm(true)}
          />
        )}
        {showBankForm && (
          <BankForm 
            key="bank-form-overlay"
            onSave={handleSaveBank}
            onCancel={() => setShowBankForm(false)}
          />
        )}
        {showCustomerForm && (
          <CustomerForm
            key="customer-form-overlay"
            onSave={handleSaveCustomer}
            onCancel={() => setShowCustomerForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
