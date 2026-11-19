import type { Report } from '../../api/types';
import './ReportView.css';

function Footer({ report }: { report: Report }) {
  return (
    <>
      {report.caveats && report.caveats.length > 0 && (
        <ul className="report-caveats">{report.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
      )}
      {report.sources && report.sources.length > 0 && (
        <p className="report-sources">
          Source: {report.sources.map((s, i) => (
            <span key={i}>
              {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.dataset}</a> : s.dataset}
              {s.release_date ? ` (${s.release_date})` : ''}
              {i < report.sources.length - 1 ? '; ' : ''}
            </span>
          ))}
          {report.data_as_of ? ` · data as of ${report.data_as_of}` : ''}
        </p>
      )}
    </>
  );
}

export function ReportView({ report }: { report: Report }) {
  // count / aggregate
  if (report.metric) {
    const value = report.metric.count ?? report.metric.value;
    return (
      <div className="report">
        <div className="report-title">{report.title}</div>
        <div className="report-metric">{value ?? '—'}{report.measure?.unit ? ` ${report.measure.unit}` : ''}</div>
        <Footer report={report} />
      </div>
    );
  }
  // profile
  if (report.measures) {
    return (
      <div className="report">
        <div className="report-title">{report.hospital?.name ?? report.title}</div>
        <table className="report-table"><tbody>
          {report.measures.map((m) => (
            <tr key={m.measure}><td>{m.label}</td><td className="num">{m.value ?? '—'}</td></tr>
          ))}
        </tbody></table>
        <Footer report={report} />
      </div>
    );
  }
  // list / rank / compare / directory
  const hospitals = report.hospitals ?? [];
  const directory = report.measure == null;
  return (
    <div className="report">
      <div className="report-title">{report.title}</div>
      {hospitals.length === 0 ? (
        <p className="report-empty">No matching hospitals found.</p>
      ) : (
        <table className="report-table">
          <thead><tr>
            {!directory && <th>#</th>}
            <th>Hospital</th><th>City</th>
            <th className="num">{directory ? 'Rating' : (report.measure?.unit ?? 'Value')}</th>
          </tr></thead>
          <tbody>
            {hospitals.map((h, i) => (
              <tr key={h.facility_id}>
                {!directory && <td>{i + 1}</td>}
                <td>{h.name}</td><td>{h.city ?? ''}</td>
                <td className="num">{directory ? (h.overall_rating ?? '—') : (h.value ?? '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {report.summary && (
        <p className="report-summary">
          {report.summary.in_scope != null && `${report.summary.in_scope} in scope`}
          {` · ${report.summary.with_value} with data`}
          {report.summary.avg != null && ` · avg ${report.summary.avg.toFixed(2)}`}
        </p>
      )}
      <Footer report={report} />
    </div>
  );
}
