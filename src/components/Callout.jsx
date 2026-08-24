import React from 'react';

export default function Callout({ type = 'note', title, children }) {
  const icons = {
    note: '💡',
    tip: '⚡',
    warn: '⚠️',
    danger: '🛑',
    'deep-dive': '🔍'
  };

  return (
    <div className={`callout ${type}`}>
      {title && (
        <div className="callout-title">
          <span>{icons[type] || '📌'}</span> {title}
        </div>
      )}
      {children}
    </div>
  );
}
