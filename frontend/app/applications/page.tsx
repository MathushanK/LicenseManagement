'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { AppWindow, Plus, X, KeyRound, Users, Clock3, CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    Promise.all([api.get('/application-types'), api.get('/licenses')])
      .then(([appsRes, licensesRes]) => {
        setApplications(appsRes.data.data);
        setLicenses(licensesRes.data.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Application name is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/application-types', { name: name.trim() });
      toast.success('Application added');
      setShowModal(false);
      setName('');
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Unable to add application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Application registry</div>
          <h1>Applications</h1>
          <p>Browse license types and capacity by application.</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add application
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {applications.map((app) => {
          const appLicenses = licenses.filter((l: any) => l.application_type === app.name);
          const totals = appLicenses.reduce(
            (acc: any, l: any) => ({
              available: acc.available + Number(l.available || 0),
              assigned: acc.assigned + Number(l.assigned || 0),
              pending: acc.pending + Number(l.pending || 0),
            }),
            { available: 0, assigned: 0, pending: 0 }
          );

          return (
            <button
              key={app.id}
              onClick={() => router.push(`/applications/${encodeURIComponent(app.name)}`)}
              className="panel panel-pad text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600">
                  <AppWindow size={20} />
                </span>
                <div>
                  <h2 className="font-bold text-slate-800">{app.name}</h2>
                  <p className="text-xs text-slate-400">
                    {appLicenses.length} license type{appLicenses.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 py-2">
                  <div className="flex justify-center text-indigo-500 mb-1"><CalendarDays size={14} /></div>
                  <div className="font-bold text-slate-800">{totals.available}</div>
                  <div className="text-[10px] text-slate-400">Available</div>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <div className="flex justify-center text-indigo-500 mb-1"><Users size={14} /></div>
                  <div className="font-bold text-slate-800">{totals.assigned}</div>
                  <div className="text-[10px] text-slate-400">Assigned</div>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <div className="flex justify-center text-indigo-500 mb-1"><Clock3 size={14} /></div>
                  <div className="font-bold text-slate-800">{totals.pending}</div>
                  <div className="text-[10px] text-slate-400">Pending</div>
                </div>
              </div>

              {appLicenses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  {appLicenses.map((l: any) => (
                    <div key={l.id} className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <KeyRound size={12} className="text-slate-400" />
                        {l.type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">
                        {l.available} avail / {l.total_quantity} total
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="panel w-full max-w-sm p-6 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              onClick={() => setShowModal(false)}
            >
              <X size={18} />
            </button>

            <h2 className="font-bold mb-4">Add application</h2>

            <label className="field-label">Application name</label>
            <input
              className="field"
              placeholder="e.g. Jira"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button className="secondary-button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" disabled={submitting} onClick={submit}>
                {submitting ? 'Adding...' : 'Add application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}