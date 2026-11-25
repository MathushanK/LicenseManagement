'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { KeyRound, Search, Plus, X } from 'lucide-react';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { toast } from 'sonner';

const APPLICATIONS = ['Tableau', 'Microsoft Excel', 'Power BI'];
const LICENSE_TYPES = ['CREATOR', 'EXPLORER', 'VIEWER', 'SERVER_ADMIN', 'SITE_ADMIN'];

type NewLicenseForm = {
  applicationType: string;
  licenseName: string;
  type: string;
  description: string;
  totalQuantity: string;
};

const emptyForm: NewLicenseForm = {
  applicationType: APPLICATIONS[0],
  licenseName: '',
  type: LICENSE_TYPES[0],
  description: '',
  totalQuantity: '1',
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewLicenseForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadLicenses = () => {
    api.get('/licenses').then(r => setLicenses(r.data.data)).catch(() => {});
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  const rows = licenses.filter(l =>
    `${l.license_name} ${l.type} ${l.application_type}`.toLowerCase().includes(q.toLowerCase())
  );

  const totalAvailable = licenses.reduce((sum, l) => sum + Number(l.available || 0), 0);
  const totalSeats = licenses.reduce((sum, l) => sum + Number(l.total_quantity || 0), 0);

  const updateField = (field: keyof NewLicenseForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!form.licenseName.trim() || !form.totalQuantity) {
      toast.error('License name and total quantity are required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/licenses', {
        applicationType: form.applicationType,
        licenseName: form.licenseName,
        type: form.type,
        description: form.description,
        totalQuantity: Number(form.totalQuantity),
      });
      toast.success('License added');
      setShowModal(false);
      setForm(emptyForm);
      loadLicenses();
    } catch {
      toast.error('Unable to add license');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <div className="eyebrow">License inventory</div>
          <h1>Licenses</h1>
          <p>Manage license capacity and see what is available to allocate.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="panel px-4 py-3 text-sm">
            <strong className="text-indigo-600">{totalAvailable}</strong> available of {totalSeats}
          </div>
          <button className="primary-button" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add license
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="p-5 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600">
              <KeyRound size={18} />
            </span>
            <div>
              <h2 className="font-bold">License catalogue</h2>
              <p className="text-xs text-slate-400">Current software entitlement inventory</p>
            </div>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className="field pl-9 py-2 w-52"
              placeholder="Search licenses"
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>License name</th>
              <th>Application</th>
              <th>Type</th>
              <th>Description</th>
              <th>Total</th>
              <th>Available</th>
              <th>Assigned</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(l => (
              <tr key={l.id}>
                <td className="font-semibold text-slate-700">{l.license_name}</td>
                <td>{l.application_type}</td>
                <td>{l.type.replace('_', ' ')}</td>
                <td>{l.description || '—'}</td>
                <td>{l.total_quantity}</td>
                <td>
                  <span className={`status ${Number(l.available) > 0 ? 'status-available' : 'status-assigned'}`}>
                    {l.available}
                  </span>
                </td>
                <td>{l.assigned}</td>
                <td>{l.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="panel w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              onClick={() => setShowModal(false)}
            >
              <X size={18} />
            </button>

            <h2 className="font-bold mb-4">Add license</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="field-label">Application</label>
                <select
                  className="field"
                  value={form.applicationType}
                  onChange={e => updateField('applicationType', e.target.value)}
                >
                  {APPLICATIONS.map(app => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">License name</label>
                <input
                  className="field"
                  placeholder="e.g. Creator 05"
                  value={form.licenseName}
                  onChange={e => updateField('licenseName', e.target.value)}
                />
              </div>

              <div>
                <label className="field-label">License type</label>
                <select
                  className="field"
                  value={form.type}
                  onChange={e => updateField('type', e.target.value)}
                >
                  {LICENSE_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea
                  className="field min-h-20"
                  placeholder="Optional notes about this license"
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                />
              </div>

              <div>
                <label className="field-label">Total quantity</label>
                <input
                  type="number"
                  min={1}
                  className="field"
                  value={form.totalQuantity}
                  onChange={e => updateField('totalQuantity', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button className="secondary-button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" disabled={submitting} onClick={submit}>
                {submitting ? 'Adding...' : 'Add license'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}