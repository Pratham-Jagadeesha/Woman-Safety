import React from 'react';
import { History, Trash2 } from 'lucide-react';

const TYPE_MAP = {
  success: { dot: '#22c55e', badge: 'lb-success', label: 'Verified safe' },
  danger:  { dot: '#ef4444', badge: 'lb-danger',  label: 'Emergency' },
  warning: { dot: '#d97706', badge: 'lb-warning', label: 'Action' },
  info:    { dot: '#3b6fd4', badge: 'lb-info',    label: 'System' },
};

export default function HistoryTab({ historyLogs, onClearLogs }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon ci-slate"><History size={16} /></div>
          Activity log
        </div>
        {historyLogs.length > 0 && (
          <button className="clear-btn" onClick={onClearLogs}>
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {historyLogs.length === 0
        ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0' }}>No activity yet.</p>
        : historyLogs.map((log, i) => {
          const t = TYPE_MAP[log.type] || TYPE_MAP.info;
          const isLast = i === historyLogs.length - 1;
          return (
            <div className="log-item" key={log.id}>
              <div className="log-dot-col">
                <div className="log-dot" style={{ background: t.dot }} />
                {!isLast && <div className="log-line" />}
              </div>
              <div style={{ flex: 1 }}>
                <span className={`log-badge ${t.badge}`}>{t.label}</span>
                <div className="log-event">{log.event}</div>
                <div className="log-time">{log.time} • {log.date}</div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}