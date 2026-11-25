'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2, Send } from 'lucide-react';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';

const schema = z.object({
  requestedBy: z.string().min(1, "Employee number is required"),
  requesterContact: z.string().min(1, "Contact is required"),
  purpose: z.string().min(1, "Purpose is required"),
  oasysTicket: z.string().min(1, "OASYS ticket is required"),
  requestDetails: z
    .string()
    .min(1, "Please add request details"),
  applicationType: z.string(),
  licenseId: z.string().min(1, "Please select a license"),
  uiFormSubmitted: z.boolean(),
});

type RequestForm = z.infer<typeof schema>;

// Shape returned by GET /licenses?application=...
type LicenseOption = {
  id: number;
  license_name: string;
  type: string;
};

export default function AddRequest() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      applicationType: "Tableau",
      licenseId: "",
      uiFormSubmitted: false,
    },
  });

  const applicationType = watch("applicationType");

  const [licenses, setLicenses] = useState<LicenseOption[]>([]);
  const [licensesLoading, setLicensesLoading] = useState(false);

  // Whenever the selected application changes, fetch the licenses that
  // belong to it and clear whatever license was previously selected —
  // a license valid for Tableau isn't valid for Power BI etc.
  useEffect(() => {
    if (!applicationType) {
      setLicenses([]);
      return;
    }

    let cancelled = false;
    setLicensesLoading(true);
    setValue("licenseId", "");

    api
      .get<{ success: boolean; data: LicenseOption[] }>("/licenses", {
        params: { application: applicationType, availability: "AVAILABLE" },
      })
      .then((res) => {
        if (!cancelled) setLicenses(res.data.data);
      })
      .catch(() => {
        if (!cancelled) {
          setLicenses([]);
          toast.error("Unable to load licenses for this application");
        }
      })
      .finally(() => {
        if (!cancelled) setLicensesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applicationType, setValue]);

  const submit = async (data: RequestForm) => {
    try {
      await api.post("/requests", data);
      toast.success("Request submitted successfully");
      reset();
    } catch {
      toast.error("Unable to submit the request");
    }
  };

  const error = (n: keyof RequestForm) =>
    errors[n] && (
      <p className="text-xs text-rose-500 mt-1">
        {errors[n]?.message}
      </p>
    );

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="page-heading">
          <div>
            <div className="eyebrow">New service request</div>
            <h1>Request a license</h1>
            <p>
              Provide the business context so your request can be reviewed
              quickly.
            </p>
          </div>
        </div>

        <form
          className="panel overflow-hidden"
          onSubmit={handleSubmit(submit)}
        >
          <div className="p-7 border-b border-slate-100">
            <div className="flex gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600">
                <CheckCircle2 size={19} />
              </span>

              <div>
                <h2 className="font-bold">Request details</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Fields marked required are needed to process the request.
                </p>
              </div>
            </div>
          </div>

          <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="field-label">Application</label>
              <select
                className="field"
                {...register("applicationType")}
              >
                <option>Tableau</option>
                <option>Microsoft Excel</option>
                <option>Power BI</option>
              </select>
            </div>

            <div>
              <label className="field-label">
                License <span className="text-rose-500">*</span>
              </label>
              <select
                className="field"
                disabled={licensesLoading || licenses.length === 0}
                {...register("licenseId")}
              >
                <option value="">
                  {licensesLoading
                    ? "Loading licenses..."
                    : licenses.length === 0
                    ? "No licenses available for this application"
                    : "Select a license"}
                </option>
                {licenses.map((lic) => (
                  <option key={lic.id} value={lic.id}>
                    {lic.license_name} ({lic.type})
                  </option>
                ))}
              </select>
              {error("licenseId")}
            </div>

            <div>
              <label className="field-label">
                Requested by{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                className="field"
                placeholder="Employee number e.g. E-1034"
                {...register("requestedBy")}
              />
              {error("requestedBy")}
            </div>

            <div>
              <label className="field-label">
                Requester contact{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                className="field"
                placeholder="Email address or phone"
                {...register("requesterContact")}
              />
              {error("requesterContact")}
            </div>

            <div>
              <label className="field-label">
                OASYS ticket no.{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                className="field"
                placeholder="e.g. OASYS-2026-028"
                {...register("oasysTicket")}
              />
              {error("oasysTicket")}
            </div>

            <div className="md:col-span-2">
              <label className="field-label">
                Purpose of request{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                className="field"
                placeholder="What will this license enable?"
                {...register("purpose")}
              />
              {error("purpose")}
            </div>

            <div className="md:col-span-2">
              <label className="field-label">
                Request details{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                className="field min-h-32"
                placeholder="Include department, context, timeline, and any special notes"
                {...register("requestDetails")}
              />
              {error("requestDetails")}
            </div>
          </div>

          <div className="px-7 pb-7 flex items-center justify-end gap-3">
            <button
              type="button"
              className="secondary-button"
              onClick={() => reset()}
            >
              Clear
            </button>

            <button
              className="primary-button"
              disabled={isSubmitting}
            >
              <Send size={16} />
              {isSubmitting
                ? "Submitting..."
                : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}