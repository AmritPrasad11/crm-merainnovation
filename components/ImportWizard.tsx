'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCSVText, autoDetectColumnMapping, CRM_IMPORT_FIELDS } from '@/lib/csv-parser';
import {
  FileText,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
} from '@/components/Icons';
import Link from 'next/link';

interface ImportWizardProps {
  users: { id: string; name: string; role: string }[];
  currentUserId: string;
}

export default function ImportWizard({ users, currentUserId }: ImportWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Raw file state
  const [fileText, setFileText] = useState('');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);

  // Mapping state: header -> CRM field key
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Config state
  const [duplicateStrategy, setDuplicateStrategy] = useState<'SKIP' | 'IMPORT_ANYWAY' | 'UPDATE_EXISTING'>('SKIP');
  const [assignedUser, setAssignedUser] = useState(currentUserId);

  // Execution state
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Handle file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setFileText(text);
        const parsed = parseCSVText(text);
        setHeaders(parsed.headers);
        setRawRows(parsed.rows);
        const autoMap = autoDetectColumnMapping(parsed.headers);
        setMapping(autoMap);
      }
    };
    reader.readAsText(file);
  };

  // Sample CSV template generator
  const handleDownloadSample = () => {
    const sampleCSV = `School Name,City,State,Address,Website,Board,School Type,Student Strength,STEM Lab,Robotics Lab,Contact Name,Designation,Email,Phone,Sales Stage,Notes
St. Xavier Public School,Jaipur,Rajasthan,C-Scheme Main Road,www.stxaviersjaipur.edu.in,CBSE,Private,2400,Yes,No,Dr. R. K. Sharma,Principal,principal@stxaviersjaipur.edu.in,+91 98290 12345,INTERESTED,Interested in robotics batch for 100 students
Delhi Public School,Indore,Madhya Pradesh,Nipania Bypass,www.dpsindore.org,CBSE,Private,3200,Yes,Yes,Anjali Gupta,Director,director@dpsindore.org,+91 731 290 9999,PROPOSAL_SENT,Sent commercial proposal v1
Modern Heritage Academy,Chandigarh,Punjab,Sector 34-A,www.mha-chandigarh.edu.in,ICSE,Trust,1800,No,No,Vikramaditya Rao,STEM Coordinator,vikram@mha.edu.in,+91 172 456 7890,CONTACTED,Initial outreach email sent`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mera_Innovation_CRM_School_Import_Sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert mapped rows
  const getMappedRecords = () => {
    return rawRows.map((row) => {
      const rec: Record<string, any> = {};
      Object.entries(mapping).forEach(([csvHeader, crmKey]) => {
        if (crmKey) {
          rec[crmKey] = row[csvHeader];
        }
      });
      return rec;
    });
  };

  // Step 4: Execute Batch Import API
  const handleExecuteImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const recordsToImport = getMappedRecords();
      const res = await fetch('/api/schools/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: recordsToImport,
          duplicateStrategy,
          defaultAssignedUserId: assignedUser,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setImportResult(data);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'An error occurred during import');
    } finally {
      setLoading(false);
    }
  };

  const mappedRecords = getMappedRecords();
  const validRecordsCount = mappedRecords.filter((r) => r.name && r.city && r.state).length;
  const invalidRecordsCount = mappedRecords.length - validRecordsCount;

  return (
    <div className="space-y-6">
      {/* Wizard Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white ${
              step >= 1 ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            1
          </span>
          <span className={`font-semibold ${step === 1 ? 'text-slate-900' : 'text-slate-500'}`}>Upload File</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white ${
              step >= 2 ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            2
          </span>
          <span className={`font-semibold ${step === 2 ? 'text-slate-900' : 'text-slate-500'}`}>Map Columns</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white ${
              step >= 3 ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            3
          </span>
          <span className={`font-semibold ${step === 3 ? 'text-slate-900' : 'text-slate-500'}`}>
            Preview & Options
          </span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white ${
              step === 4 ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            4
          </span>
          <span className={`font-semibold ${step === 4 ? 'text-emerald-700' : 'text-slate-500'}`}>
            Import Report
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD FILE */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload School CSV or Excel File</h2>
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: CSV, TSV, or exported Excel text files.
              </p>
            </div>

            <label className="block p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer transition-colors bg-slate-50/50">
              <input type="file" accept=".csv,.tsv,.txt" onChange={handleFileUpload} className="hidden" />
              <div className="text-xs text-slate-600 font-medium">
                {fileName ? (
                  <span className="font-bold text-blue-600 text-sm block">{fileName}</span>
                ) : (
                  <span>Click to select CSV file from your computer</span>
                )}
              </div>
            </label>

            <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Download Sample CSV Template</span>
              </button>

              <button
                disabled={!rawRows.length}
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Column Mapping ({rawRows.length} rows)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600">
                Map CSV Columns to CRM Fields
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure essential fields like School Name, City, and State are mapped correctly.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full">
              {headers.length} Columns Detected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {headers.map((header) => (
              <div key={header} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-900 block truncate" title={header}>
                  CSV Header: <span className="text-blue-600">{header}</span>
                </label>
                <select
                  value={mapping[header] || ''}
                  onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Ignore Column --</option>
                  {CRM_IMPORT_FIELDS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label} {f.required ? '*' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <span>Preview Records</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & DUPLICATE STRATEGY */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Options Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600">
              Import & Duplicate Handling Strategy
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">When Duplicates are Detected:</label>
                <select
                  value={duplicateStrategy}
                  onChange={(e) => setDuplicateStrategy(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold text-slate-900"
                >
                  <option value="SKIP">Skip Duplicates (Recommended)</option>
                  <option value="IMPORT_ANYWAY">Import Anyway as New Record</option>
                  <option value="UPDATE_EXISTING">Update Existing Record Attributes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Assigned Sales User:</label>
                <select
                  value={assignedUser}
                  onChange={(e) => setAssignedUser(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold text-slate-900"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Records Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
              <span className="font-bold text-slate-900">
                Parsed Records Preview ({mappedRecords.length} total)
              </span>
              <div className="flex gap-3 font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {validRecordsCount} Ready to Import
                </span>
                {invalidRecordsCount > 0 && (
                  <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    {invalidRecordsCount} Validation Error(s)
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">School Name</th>
                    <th className="p-3">City / State</th>
                    <th className="p-3">Board / Type</th>
                    <th className="p-3">Primary Contact</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mappedRecords.map((rec, idx) => {
                    const isValid = rec.name && rec.city && rec.state;
                    return (
                      <tr key={idx} className={isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40'}>
                        <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{rec.name || 'MISSING NAME'}</td>
                        <td className="p-3 text-slate-700">
                          {rec.city || '?'}, {rec.state || '?'}
                        </td>
                        <td className="p-3 text-slate-600">
                          {rec.board || 'CBSE'} &bull; {rec.schoolType || 'Private'}
                        </td>
                        <td className="p-3 text-slate-700">{rec.contactName || 'N/A'}</td>
                        <td className="p-3">
                          {isValid ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                              VALID
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[10px]">
                              MISSING ATTR
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mapping</span>
            </button>

            <button
              disabled={loading || validRecordsCount === 0}
              onClick={handleExecuteImport}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Executing Batch Import...</span>
              ) : (
                <>
                  <span>Confirm & Execute Import ({validRecordsCount} records)</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: IMPORT REPORT */}
      {step === 4 && importResult && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 text-xs text-slate-700">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Batch Import Completed</h2>
            <p className="text-slate-500">School list imported and synchronized with CRM database.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border text-center">
              <div className="text-slate-500 font-semibold uppercase text-[10px]">Total Uploaded</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{importResult.totalRecords}</div>
            </div>

            <div className="p-4 bg-emerald-50 border-emerald-200 rounded-xl border text-center">
              <div className="text-emerald-800 font-semibold uppercase text-[10px]">Imported New</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{importResult.importedCount}</div>
            </div>

            <div className="p-4 bg-amber-50 border-amber-200 rounded-xl border text-center">
              <div className="text-amber-800 font-semibold uppercase text-[10px]">Duplicates Skipped</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{importResult.skippedCount}</div>
            </div>

            <div className="p-4 bg-blue-50 border-blue-200 rounded-xl border text-center">
              <div className="text-blue-800 font-semibold uppercase text-[10px]">Records Updated</div>
              <div className="text-2xl font-black text-blue-700 mt-1">{importResult.updatedCount}</div>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <h3 className="font-bold text-rose-900">Skipped Records with Errors:</h3>
              <ul className="list-disc pl-5 text-rose-800 space-y-1">
                {importResult.errors.map((e: any, idx: number) => (
                  <li key={idx}>
                    Row #{e.rowNumber} ({e.schoolName}): {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/schools"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/30"
            >
              Go to School Directory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
