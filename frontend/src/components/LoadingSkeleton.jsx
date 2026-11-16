import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
      <div className="skeleton" style={{ height: '14px', width: '40%' }}></div>
      <div className="skeleton" style={{ height: '20px', width: '85%' }}></div>
      <div className="skeleton" style={{ height: '24px', width: '50%' }}></div>
      <div className="flex justify-between items-center" style={{ marginTop: '8px' }}>
        <div className="skeleton" style={{ height: '16px', width: '30%' }}></div>
        <div className="skeleton" style={{ height: '30px', width: '80px' }}></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div className="skeleton" style={{ height: '28px', width: '30%', marginBottom: '16px' }}></div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '10px' }}></div>
      ))}
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
}
