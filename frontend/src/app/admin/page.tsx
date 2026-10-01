'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { getCurrentUser } from '@/services/auth';
import {
  fetchAdminNodes, fetchAdminSchedules, fetchAdminUsers, fetchAdminTrips,
  AdminNode, AdminSchedule, AdminUser, AdminTrip
} from '@/services/admin';
import { UserResponse } from '@/types';
import { Shield, Database, Calendar, Users, MapPin, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser] = useState<UserResponse | null>(() => getCurrentUser());
  const [tab, setTab] = useState<'nodes' | 'schedules' | 'users' | 'trips'>('nodes');
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes] = useState<AdminNode[]>([]);
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.role.toLowerCase() !== 'admin') {
      router.push('/login');
      return;
    }

    Promise.all([
      fetchAdminNodes(),
      fetchAdminSchedules(),
      fetchAdminUsers(),
      fetchAdminTrips()
    ])
      .then(([n, s, u, t]) => {
        setNodes(n);
        setSchedules(s);
        setUsers(u);
        setTrips(t);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'nodes' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Transit Nodes ({nodes.length})
          </button>

          <button
            onClick={() => setTab('schedules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'schedules' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Transit Schedules ({schedules.length})
          </button>

          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'users' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Registered Users ({users.length})
          </button>

          <button
            onClick={() => setTab('trips')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'trips' ? 'bg-[#0E9F7A] text-white shadow-sm' : 'text-[#667085] hover:text-[#0B1320]'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Saved Trips ({trips.length})
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
                    <th className="pb-3">Node Name</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Latitude</th>
                    <th className="pb-3">Longitude</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {nodes.map((n) => (
                    <tr key={n.node_id} className="hover:bg-[#F7F5F0]">
                      <td className="py-2.5 font-mono text-[#0E9F7A] font-bold">{n.node_id}</td>
                      <td className="py-2.5 font-semibold">{n.name}</td>
                      <td className="py-2.5">{n.city}</td>
                      <td className="py-2.5 font-mono text-[#667085]">{n.latitude}</td>
                      <td className="py-2.5 font-mono text-[#667085]">{n.longitude}</td>
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
                    <th className="pb-3">Provider / Mode</th>
                    <th className="pb-3">Source Node</th>
                    <th className="pb-3">Dest Node</th>
                    <th className="pb-3">Base Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {schedules.map((s) => (
                    <tr key={s.schedule_id} className="hover:bg-[#F7F5F0]">
                      <td className="py-2.5 font-mono text-[#0E9F7A] font-bold">{s.schedule_id}</td>
                      <td className="py-2.5 font-semibold">{s.provider}</td>
                      <td className="py-2.5 font-mono text-[#667085]">{s.source_node_id}</td>
                      <td className="py-2.5 font-mono text-[#667085]">{s.dest_node_id}</td>
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
                      <td className="py-2.5 font-bold uppercase text-[10px] text-[#0E9F7A]">{u.role}</td>
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
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
