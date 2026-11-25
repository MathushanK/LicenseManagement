'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { UserRoundCog } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';

export default function AssignedList() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => api.get('/assignments').then(r => setRows(r.data.data)).catch(() => {});
  useEffect(() => { void load(); }, []);

  const action = async (a: any, type: 'extend' | 'status' | 'assignee') => {
    if (type === 'assignee') {
      // Reassigning closes out the current record (UNASSIGNED, end-dated
      // today) and creates a brand new one for the new assignee, so the
      // previous holder stays visible in history instead of being
      // overwritten.
      const assignedTo = window.prompt('New employee user ID', '');
      if (!assignedTo) return;
      try {
        await api.post(`/assignments/${a.id}/reassign`, { assignedTo });
        toast.success('License reassigned');
        load();
      } catch {
        toast.error('Could not reassign license');
      }
      return;
    }

    let body: any = {};
    if (type === 'extend') { const toDate = window.prompt('New end date (YYYY-MM-DD)', a.to_date?.slice(0, 10)); if (!toDate) return; body = { toDate }; }
    if (type === 'status') { const status = window.prompt('New status: ASSIGNED, UNASSIGNED, or EXPIRED', a.status); if (!status) return; body = { status: status.toUpperCase() }; }
    try { await api.patch(`/assignments/${a.id}`, body); toast.success('Assignment updated'); load(); } catch { toast.error('Could not update assignment'); }
  };

  return <AppShell><div className="page-heading"><div><div className="eyebrow">Allocation register</div><h1>Assigned list</h1><p>Review active allocations, change assignees and manage end dates.</p></div></div><div className="panel overflow-hidden"><div className="p-5 flex items-center gap-3"><span className="grid place-items-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600"><UserRoundCog size={18}/></span><div><h2 className="font-bold">All assignments</h2><p className="text-xs text-slate-400">{rows.length} licenses have been allocated</p></div></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>License</th><th>Assignee</th><th>From</th><th>To</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(a=><tr key={a.id}><td className="font-semibold text-slate-700">{a.license_name}</td><td>{a.assigned_to_name}</td><td>{a.from_date?.slice(0,10)}</td><td>{a.to_date?.slice(0,10)}</td><td><span className={`status status-${a.status.toLowerCase()}`}>{a.status}</span></td><td><div className="flex gap-2">{a.status === 'ASSIGNED' && <button className="secondary-button py-1.5" onClick={()=>action(a,'assignee')}>Change assignee</button>}<button className="secondary-button py-1.5" onClick={()=>action(a,'status')}>Change status</button><button className="secondary-button py-1.5" onClick={()=>action(a,'extend')}>Extend</button></div></td></tr>)}{!rows.length&&<tr><td className="text-center text-slate-400" colSpan={6}>No assignments found</td></tr>}</tbody></table></div></div></AppShell>;
}