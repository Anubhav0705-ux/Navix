'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { getCurrentUser } from '@/services/auth';
import {
  fetchAdminNodes, fetchAdminSchedules, fetchAdminUsers, fetchAdminTrips,
  fetchAdminPasswordResets, approvePasswordReset, rejectPasswordReset,
  AdminNode, AdminSchedule, AdminUser, AdminTrip
} from '@/services/admin';
import { UserResponse, PasswordResetAdminItem, ApproveResetResponse } from '@/types';
import {
  Shield, Database, Calendar, Users, MapPin, Loader2,
  KeyRound, CheckCircle2, XCircle, Copy, AlertTriangle, X
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState<'nodes' | 'schedules' | 'users' | 'trips' | 'resets'>('nodes');
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes] = useState<AdminNode[]>([]);
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [resets, setResets] = useState<PasswordResetAdminItem[]>([]);

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [approvedResult, setApprovedResult] = useState<ApproveResetResponse | null>(null);
  const [copiedPw, setCopiedPw] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetchAdminNodes(),
      fetchAdminSchedules(),
      fetchAdminUsers(),
      fetchAdminTrips(),
      fetchAdminPasswordResets()
    ])
      .then(([n, s, u, t, r]) => {
        setNodes(n);
        setSchedules(s);
        setUsers(u);
        setTrips(t);
        setResets(r);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setIsMounted(true);
    const user = getCurrentUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [router]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleApprove = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      const res = await approvePasswordReset(requestId);
      setApprovedResult(res);
      setCopiedPw(false);
      loadData();
    } catch {
      showToast('Failed to approve password reset request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      await rejectPasswordReset(requestId);
      showToast('Password reset request rejected.');
      loadData();
    } catch {
      showToast('Failed to reject reset request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyPassword = () => {
    if (approvedResult?.temporary_password) {
      navigator.clipboard.writeText(approvedResult.temporary_password);
      setCopiedPw(true);
      setTimeout(() => setCopiedPw(false), 3000);
    }
  };

  const pendingResetsCount = resets.filter((r) => r.status === 'PENDING').length;

  if (!isMounted || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#0E9F7A] animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Verifying Administrative Session...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 space-y-8">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Admin Header */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E9F7A]/10 text-[#0E9F7A] text-xs font-bold uppercase">
              <Shield className="w-3.5 h-3.5" /> Administrative Control Panel
            </div>
            <h1 className="text-2xl font-extrabold text-[#0B1320]">NAVIX System Operations</h1>
            <p className="text-xs text-[#667085]">
              Logged in as {currentUser?.name} ({currentUser?.email})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#667085] bg-[#F7F5F0] px-3 py-1.5 rounded-lg border border-[#E7E5E0]">
              Role: ADMIN
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-2 shadow-sm flex gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('nodes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'nodes' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Transit Nodes ({nodes.length})
          </button>

          <button
            onClick={() => setTab('schedules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'schedules' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Transit Schedules ({schedules.length})
          </button>

          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'users' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Registered Users ({users.length})
          </button>

          <button
            onClick={() => setTab('trips')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'trips' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Saved Trips ({trips.length})
          </button>

          <button
            onClick={() => setTab('resets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'resets' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Password Resets
            {pendingResetsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
                {pendingResetsCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#667085] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0E9F7A]" />
            Fetching System State...
          </div>
        ) : (
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm overflow-x-auto">
            {tab === 'nodes' && (
              <table className="w-full text-left text-xs text-[#0B1320]">
                <thead>
                  <tr className="border-b border-[#E7E5E0] text-[#667085] uppercase text-[10px]">
                    <th className="pb-3">Node ID</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Coordinates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {nodes.map((n) => (
                    <tr key={n.node_id} className="hover:bg-[#F7F5F0]">
                      <td className="py-2.5 font-mono text-[#0E9F7A] font-bold">{n.node_id}</td>
                      <td className="py-2.5 font-semibold">{n.name}</td>
                      <td className="py-2.5 text-[#667085]">{n.city}</td>
                      <td className="py-2.5 font-mono text-[11px] text-[#667085]">
                        {n.latitude && n.longitude ? `${n.latitude.toFixed(4)}, ${n.longitude.toFixed(4)}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'schedules' && (
              <table className="w-full text-left text-xs text-[#0B1320]">
                <thead>
                  <tr className="border-b border-[#E7E5E0] text-[#667085] uppercase text-[10px]">
                    <th className="pb-3">Schedule ID</th>
                    <th className="pb-3">Provider</th>
                    <th className="pb-3">Route (Source &rarr; Dest)</th>
                    <th className="pb-3">Timing</th>
                    <th className="pb-3">Base Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {schedules.map((s) => (
                    <tr key={s.schedule_id} className="hover:bg-[#F7F5F0]">
                      <td className="py-2.5 font-mono text-[#0E9F7A] font-bold">{s.schedule_id}</td>
                      <td className="py-2.5 font-semibold">{s.provider}</td>
                      <td className="py-2.5 font-mono text-[11px] text-[#667085]">{s.source_node_id} &rarr; {s.dest_node_id}</td>
                      <td className="py-2.5 text-[#667085]">{s.departure_time} - {s.arrival_time}</td>
                      <td className="py-2.5 font-bold text-[#0E9F7A]">₹{s.base_cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'users' && (
              <table className="w-full text-left text-xs text-[#0B1320]">
                <thead>
                  <tr className="border-b border-[#E7E5E0] text-[#667085] uppercase text-[10px]">
                    <th className="pb-3">User ID</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-[#F7F5F0]">
                      <td className="py-2.5 font-mono text-[#0E9F7A] font-bold">{u.user_id}</td>
                      <td className="py-2.5 font-semibold">{u.name}</td>
                      <td className="py-2.5 text-[#667085]">{u.email}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role.toLowerCase() === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'trips' && (
              <table className="w-full text-left text-xs text-[#0B1320]">
                <thead>
                  <tr className="border-b border-[#E7E5E0] text-[#667085] uppercase text-[10px]">
                    <th className="pb-3">Trip ID</th>
                    <th className="pb-3">Traveler ID</th>
                    <th className="pb-3">Route</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Budget Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {trips.map((t) => (
                    <tr key={t.trip_id} className="hover:bg-[#F7F5F0]">
                      <td className="py-2.5 font-mono text-[#0E9F7A] font-bold">{t.trip_id}</td>
                      <td className="py-2.5 font-mono text-[#667085]">{t.traveler_id}</td>
                      <td className="py-2.5 font-semibold">{t.origin} &rarr; {t.destination}</td>
                      <td className="py-2.5 text-[#667085]">{t.travel_date}</td>
                      <td className="py-2.5 font-bold text-[#0E9F7A]">₹{t.budget_cap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'resets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0B1320]">Password Reset Requests</h3>
                    <p className="text-xs text-[#667085]">
                      Review manual recovery requests. When approved, a cryptographically secure temporary password is generated for one-time delivery to the traveler.
                    </p>
                  </div>
                </div>

                {resets.length === 0 ? (
                  <div className="p-12 text-center space-y-2 border border-dashed border-[#E7E5E0] rounded-xl">
                    <KeyRound className="w-8 h-8 text-[#667085] mx-auto" />
                    <p className="text-xs font-bold text-[#667085]">No pending reset requests</p>
                    <p className="text-[11px] text-[#8E9BA4]">All traveler accounts are verified and secure.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-[#0B1320]">
                    <thead>
                      <tr className="border-b border-[#E7E5E0] text-[#667085] uppercase text-[10px]">
                        <th className="pb-3">Request ID</th>
                        <th className="pb-3">Traveler Account</th>
                        <th className="pb-3">Requested At</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E5E0]">
                      {resets.map((r) => (
                        <tr key={r.request_id} className="hover:bg-[#F7F5F0]">
                          <td className="py-3 font-mono text-[#0E9F7A] font-bold">{r.request_id}</td>
                          <td className="py-3">
                            <span className="font-semibold block">{r.user_name || 'Traveler'}</span>
                            <span className="text-[11px] text-[#667085] font-mono">{r.user_email}</span>
                          </td>
                          <td className="py-3 text-[#667085] text-[11px]">
                            {new Date(r.requested_at).toLocaleString()}
                          </td>
                          <td className="py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              r.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : r.status === 'APPROVED'
                                ? 'bg-teal-100 text-teal-800'
                                : r.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {r.status === 'PENDING' ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(r.request_id)}
                                  disabled={actionLoadingId === r.request_id}
                                  className="px-3 py-1.5 bg-[#0E9F7A] hover:bg-[#0C8567] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                  {actionLoadingId === r.request_id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleReject(r.request_id)}
                                  disabled={actionLoadingId === r.request_id}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#8E9BA4] font-medium">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* Temporary Password One-Time Reveal Modal */}
        {approvedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div role="dialog" aria-modal="true" className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#0E9F7A]/30 p-6 sm:p-8 space-y-5 text-[#0B1320]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E0]">
                <div className="flex items-center gap-2 text-[#0E9F7A]">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="font-bold text-base font-editorial text-[#0B1320]">Temporary Credential Generated</h3>
                </div>
                <button
                  onClick={() => setApprovedResult(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#667085] hover:text-[#0B1320] hover:bg-[#F7F5F0] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#667085] leading-relaxed">
                  Provide this single-use temporary password to the verified traveler. Upon sign in, they will be required to set a permanent password immediately.
                </p>

                {/* Password Box */}
                <div className="p-4 bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl flex items-center justify-between gap-3">
                  <span className="font-mono text-base font-bold text-[#0B1320] tracking-wider select-all">
                    {approvedResult.temporary_password}
                  </span>
                  <button
                    onClick={handleCopyPassword}
                    className="p-2 bg-white hover:bg-[#0E9F7A] text-[#0B1320] hover:text-white rounded-xl border border-[#E7E5E0] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedPw ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>One-Time Display Notice:</strong> This password is not stored in plaintext and will not be displayed again. It expires in 24 hours.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setApprovedResult(null)}
                  className="px-5 py-2.5 bg-[#0E9F7A] hover:bg-[#0C8567] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
