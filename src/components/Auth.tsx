import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LogIn, UserPlus, Mail, Lock, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firmName, setFirmName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;
        
        await updateProfile(user, { displayName: firmName });
        
        // Create user document
        await setDoc(doc(db, 'users', user.uid), {
          firmName,
          email,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user doc exists, if not create one
      await setDoc(doc(db, 'users', user.uid), {
        firmName: user.displayName || 'Unnamed Firm',
        email: user.email,
        createdAt: serverTimestamp(),
      }, { merge: true });
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f1f5f9] font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0f172a] p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border border-blue-400/30">
              <Building2 size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CHEQUEFLOW BS</h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Professional Ledger System</p>
        </div>
        
        <div className="p-8">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 pb-2 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2",
                isLogin ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 pb-2 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2",
                !isLogin ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
              )}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Firm / Person Name</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                    placeholder="e.g. Global Trading Pvt Ltd"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-2 italic font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded font-bold uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-blue-600/10"
            >
              {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
              {loading ? 'Processing...' : isLogin ? 'Proceed to Ledger' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Enterprise Auth</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mt-6 py-2 border border-slate-200 rounded text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-slate-600"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};
