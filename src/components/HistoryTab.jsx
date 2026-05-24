import React from 'react';
import { History, ShieldAlert, ShieldCheck, Clock, AlertTriangle, Trash2 } from 'lucide-react';

export default function HistoryTab({ historyLogs, onClearLogs }) {
  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <ShieldCheck size={18} color="#38a169" />;
      case 'danger':
        return <ShieldAlert size={18} color="#e53e3e" />;
      case 'warning':
        return <AlertTriangle size={18} color="#dd6b20" />;
      default:
        return <Clock size={18} color="#3182ce" />;
    }
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case 'success':
        return 'badge-success';
      case 'danger':
        return 'badge-danger';
      case 'warning':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="flex-col gap-4">
      {/* Dashboard Header */}
      <div className="card history-header-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="icon-btn" style={{ backgroundColor: '#e2e8f0', color: '#4a5568' }}>
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Activity Log</h2>
              <p className="text-xs text-secondary">Timeline of safety activities and alerts</p>
            </div>
          </div>
          {historyLogs.length > 0 && (
            <button 
              onClick={onClearLogs}
              className="clear-logs-btn flex items-center gap-1 text-xs font-semibold text-secondary hover:text-danger"
              style={{ color: '#718096' }}
              title="Clear all logs"
            >
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Logs timeline list */}
      <div className="card" style={{ padding: '0.5rem 0' }}>
        {historyLogs.length === 0 ? (
          <div className="p-8 text-center text-secondary text-sm">
            No activity logs found. Start safe check-ins or trigger actions to record safety events.
          </div>
        ) : (
          <div className="logs-timeline">
            {historyLogs.map((log) => (
              <div key={log.id} className="log-item-row border-b" style={{ borderColor: 'var(--surface-border)' }}>
                <div className="flex items-start gap-3 p-4">
                  <div className="log-icon-container mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-col w-full">
                    <div className="flex justify-between items-center w-full">
                      <span className={`log-badge ${getBadgeClass(log.type)}`}>
                        {log.type === 'success' ? 'Verified Safe' : log.type === 'danger' ? 'Emergency' : log.type === 'warning' ? 'Action' : 'System'}
                      </span>
                      <span className="log-time-stamp text-xs text-secondary font-medium">
                        {log.time} • {log.date}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                      {log.event}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
