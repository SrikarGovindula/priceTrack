import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from './SvgIcon';

export default function Toast() {
  const { toast } = useNotifications();

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type}`}>
        <SvgIcon
          name={toast.type === 'success' ? 'check' : toast.type === 'error' ? 'alert' : 'info'}
          size={18}
          color={toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}
        />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
