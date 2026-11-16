import React from 'react';

export default function SvgIcon({ name, size = 18, color = 'currentColor', className = '' }) {
  const getIcon = () => {
    switch (name) {
      case 'search':
        return (
          <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'bell':
        return (
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'chart':
        return (
          <>
            <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 9l-5 5-4-4-3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'trending':
        return (
          <path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'heart':
        return (
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'heart-filled':
        return (
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={color} strokeWidth="1" />
        );
      case 'tag':
        return (
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'check':
        return (
          <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'close':
        return (
          <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'store':
        return (
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'user':
        return (
          <>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'lock':
        return (
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'shield':
        return (
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'filter':
        return (
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'refresh':
        return (
          <>
            <path d="M23 4v6h-6M1 20v-6h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'trash':
        return (
          <>
            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'external':
        return (
          <>
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="15 3 21 3 21 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="14" x2="21" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'sun':
        return (
          <>
            <circle cx="12" cy="12" r="5" strokeWidth="2" />
            <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'moon':
        return (
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'chevron-down':
        return (
          <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'chevron-right':
        return (
          <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'arrow-down':
        return (
          <>
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="19 12 12 19 5 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'arrow-up':
        return (
          <>
            <line x1="12" y1="19" x2="12" y2="5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="5 12 12 5 19 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'arrow-right':
        return (
          <>
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="12 5 19 12 12 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'info':
        return (
          <>
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'alert':
        return (
          <>
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      default:
        return <circle cx="12" cy="12" r="10" strokeWidth="2" />;
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      className={`pt-icon ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {getIcon()}
    </svg>
  );
}
