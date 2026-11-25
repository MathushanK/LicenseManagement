'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, CalendarDays, Users, Clock3 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appName = decodeURIComponent(params.name as string);

  const [licenses, setLicenses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/licenses', { params: { application: appName } }),
      api.get('/assignments'),
    ])
      .then(([licensesRes, assignmentsRes]) => {
        setLicenses(licensesRes.data.data);
        setAssignments(assignmentsRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appName]);

  return (
    <AppShell>
      <button
        onClick={() => router.push('/applications')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to applications
      </button>

      <div className="page-heading">
        <div>
          <div className="eyebrow">Application detail</div>
          <h1>{appName}</h1>
          <p>License types, capacity, and who currently holds each one.</p>
        </div>
      </div>

      {loading && <div className="panel panel-pad text-slate-400 text-sm">Loading...</div>}

      {!loading && licenses.length === 0 && (
        <div className="panel panel-pad text-slate-400 text-sm">
          No license types have been added for {appName} yet.
        </div>
      )}

      <div className="flex flex-col gap-5">
        {licenses.map((license: any) => {
          const licenseAssignments = assignments.filter(
            (a: any) => a.license_id === license.id && a.status === 'ASSIGNED'
          );

          return (
            <div key={license.id} className="panel overflow-hidden">
              <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600">
                    <KeyRound size={18} />
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-800">{license.license_name}</h2>
                    <p className="text-xs text-slate-400">
                      {license.type.replace('_', ' ')} {license.description ? `· ${license.description}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-center">
                  <div>
                    <div className="flex justify-center text-indigo-500 mb-1"><CalendarDays size={14} /></div>
                    <div className="font-bold text-slate-800">{license.available}</div>
                    <div className="text-[10px] text-slate-400">Available</div>
                  </div>
                  <div>
                    <div className="flex justify-center text-indigo-500 mb-1"><Users size={14} /></div>
                    <div className="font-bold text-slate-800">{license.assigned}</div>
                    <div className="text-[10px] text-slate-400">Assigned</div>
                  </div>
                  <div>
                    <div className="flex justify-center text-indigo-500 mb-1"><Clock3 size={14} /></div>
                    <div className="font-bold text-slate-800">{license.pending}</div>
                    <div className="text-[10px] text-slate-400">Pending</div>
                  </div>
                  <div>
                    <div className="text-slate-300 mb-1 text-xs">Σ</div>
                    <div className="font-bold text-slate-800">{license.total_quantity}</div>
                    <div className="text-[10px] text-slate-400">Total</div>
                  </div>
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Assigned to</th>
                    <th>From date</th>
                    <th>To date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {licenseAssignments.length ? (
                    licenseAssignments.map((a: any) => (
                      <tr key={a.id}>
                        <td className="font-semibold text-slate-700">{a.assigned_to_name}</td>
                        <td>{a.from_date?.slice(0, 10)}</td>
                        <td>{a.to_date?.slice(0, 10)}</td>
                        <td>
                          <span className="status status-assigned">{a.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-slate-400">
                        No users currently assigned
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}