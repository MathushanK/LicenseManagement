'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Users, KeyRound, Clock3, ArrowUpRight, ClipboardCheck, CalendarDays } from 'lucide-react';
import api from '@/lib/axios';

export default function Dashboard() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>('All');

  useEffect(() => {
    const load = async () => {
      try {
        const [licensesRes, requestsRes, assignmentsRes, applicationsRes] = await Promise.all([
          api.get('/licenses'),
          api.get('/requests'),
          api.get('/assignments'),
          api.get('/application-types'),
        ]);
        setLicenses(licensesRes.data.data);
        setRequests(requestsRes.data.data);
        setAssignments(assignmentsRes.data.data.slice(0, 5));
        setApplications(applicationsRes.data.data);
      } catch {
        /* handled by api */
      }
    };
    load();
  }, []);

  const filteredLicenses = useMemo(
    () => (selectedApp === 'All' ? licenses : licenses.filter((l: any) => l.application_type === selectedApp)),
    [licenses, selectedApp]
  );
  const filteredRequests = useMemo(
    () => (selectedApp === 'All' ? requests : requests.filter((r: any) => r.application_type === selectedApp)),
    [requests, selectedApp]
  );

  const stats = useMemo(() => {
    const totalLicenses = filteredLicenses.reduce((sum: number, l: any) => sum + Number(l.total_quantity || 0), 0);
    const assigned = filteredLicenses.reduce((sum: number, l: any) => sum + Number(l.assigned || 0), 0);
    const available = filteredLicenses.reduce((sum: number, l: any) => sum + Number(l.available || 0), 0);
    const openRequests = filteredRequests.filter((r: any) => r.status === 'OPEN').length;
    return { totalLicenses, assigned, available, requests: openRequests };
  }, [filteredLicenses, filteredRequests]);

  const overview = [
    { name: 'Available', value: stats.available, color: '#17785b' },
    { name: 'Assigned', value: stats.assigned, color: '#171812' },
  ];
  const workload = [
    { name: 'Licenses', value: stats.totalLicenses },
    { name: 'Assigned', value: stats.assigned },
    { name: 'Open requests', value: stats.requests },
  ];

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Workspace overview</div>
          <h1>Good morning, <em>license team</em></h1>
          <p>Everything you need to keep the LECO license estate moving.</p>
        </div>
        <button className="primary-button">
          <ClipboardCheck size={16} /> Review requests <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="mb-6">
        <label className="field-label">Filter by application</label>
        <select className="field" style={{ maxWidth: 260 }} value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}>
          <option value="All">All applications</option>
          {applications.map((app) => (
            <option key={app.id} value={app.name}>{app.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card stat-card--total">
          <div className="stat-card-head">
            <span className="stat-card-label">Total licenses</span>
            <span className="stat-card-icon"><KeyRound size={16} /></span>
          </div>
          <div className="stat-number">{stats.totalLicenses}</div>
          <div className="stat-card-note">{selectedApp === 'All' ? 'Across all products' : `${selectedApp} seats`}</div>
        </div>

        <div className="stat-card stat-card--assigned">
          <div className="stat-card-head">
            <span className="stat-card-label">Assigned</span>
            <span className="stat-card-icon"><Users size={16} /></span>
          </div>
          <div className="stat-number">{stats.assigned}</div>
          <div className="stat-card-note">Currently in use</div>
        </div>

        <div className="stat-card stat-card--available">
          <div className="stat-card-head">
            <span className="stat-card-label">Available</span>
            <span className="stat-card-icon"><CalendarDays size={16} /></span>
          </div>
          <div className="stat-number">{stats.available}</div>
          <div className="stat-card-note">Ready to allocate</div>
        </div>

        <div className="stat-card stat-card--pending">
          <div className="stat-card-head">
            <span className="stat-card-label">Open requests</span>
            <span className="stat-card-icon"><Clock3 size={16} /></span>
          </div>
          <div className="stat-number">{stats.requests}</div>
          <div className="stat-card-note">Awaiting action</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="panel panel-pad lg:col-span-3">
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800">License activity</h2>
              <p className="text-xs text-slate-400 mt-1">
                {selectedApp === 'All' ? 'Current allocation snapshot' : `${selectedApp} allocation snapshot`}
              </p>
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--leco-yellow-ink, #8a7f00)' }}>This month</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--leco-muted)' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--leco-muted)' }} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--leco-yellow)" radius={[6, 6, 0, 0]} barSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel panel-pad lg:col-span-2">
          <h2 className="font-bold text-slate-800">Allocation health</h2>
          <p className="text-xs text-slate-400 mt-1">Availability at a glance</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={overview} dataKey="value" innerRadius={45} outerRadius={67} paddingAngle={4}>
                  {overview.map((x) => (
                    <Cell key={x.name} fill={x.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {overview.map((x) => (
              <span key={x.name}>
                <i className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: x.color }} />
                {x.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="panel mt-5 overflow-hidden">
        <div className="flex justify-between items-center p-5">
          <div>
            <h2 className="font-bold text-slate-800">Recent assignments</h2>
            <p className="text-xs text-slate-400 mt-1">Latest licenses allocated to the workforce</p>
          </div>
          <a className="text-sm font-semibold" style={{ color: 'var(--leco-ink)' }} href="/assigned-list">
            View all
          </a>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>License</th>
              <th>Assigned to</th>
              <th>From date</th>
              <th>End date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length ? (
              assignments.map((a) => (
                <tr key={a.id}>
                  <td className="font-semibold text-slate-700">{a.license_name}</td>
                  <td>{a.assigned_to_name}</td>
                  <td className="numeric">{a.from_date?.slice(0, 10)}</td>
                  <td className="numeric">{a.to_date?.slice(0, 10)}</td>
                  <td>
                    <span className={`status status-${a.status.toLowerCase()}`}>{a.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-slate-400">
                  No assignments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}