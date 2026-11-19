import { useEffect, useState } from 'react';
import { deleteReport, getReport, listReports } from '../../api/reports';
import type { SavedReportFull, SavedReportMeta } from '../../api/types';
import { ReportView } from '../report/ReportView';
import './SavedReports.css';

export function SavedReports() {
  const [reports, setReports] = useState<SavedReportMeta[] | null>(null);
  const [open, setOpen] = useState<SavedReportFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const r = await listReports();
      setReports(r.data.reports);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => { void refresh(); }, []);

  async function onOpen(id: number) {
    try { setOpen((await getReport(id)).data); } catch (e) { setError((e as Error).message); }
  }
  async function onDelete(id: number) {
    try { await deleteReport(id); setOpen(null); await refresh(); } catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="saved-card">
      <h3>Saved reports</h3>
      {open ? (
        <div className="saved-report">
          <button className="saved-back" type="button" onClick={() => setOpen(null)}>← Back to list</button>
          <ReportView report={open.report_content} />
          <button className="danger" type="button" onClick={() => void onDelete(open.report_id)}>Delete</button>
        </div>
      ) : error ? (
        <p className="saved-error">{error}</p>
      ) : reports == null ? (
        <p className="saved-empty">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="saved-empty">No saved reports yet. Answer a question in Ask HQE and click “💾 Save report”.</p>
      ) : (
        <ul>
          {reports.map((r) => (
            <li key={r.report_id}>
              <button type="button" onClick={() => void onOpen(r.report_id)}>{r.title}</button>
              <span className="muted">{r.created_at?.slice(0, 10)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
