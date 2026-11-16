import React, { useState, useMemo } from 'react';
import SvgIcon from './SvgIcon';

export default function PriceHistoryChart({ history = [], summary = null, onRangeChange, currentRange = '30' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeRange, setActiveRange] = useState(currentRange);

  const handleRangeClick = (range) => {
    setActiveRange(range);
    if (onRangeChange) onRangeChange(range);
  };

  // Dimensions for SVG coordinate system
  const width = 760;
  const height = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 70 };

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    // Sort chronologically
    return [...history].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  }, [history]);

  // Compute Scales
  const { points, minPrice, maxPrice, yLabels, xLabels, pathD, areaD } = useMemo(() => {
    if (chartData.length === 0) {
      return { points: [], minPrice: 0, maxPrice: 0, yLabels: [], xLabels: [], pathD: '', areaD: '' };
    }

    const prices = chartData.map(d => d.price);
    let minP = Math.min(...prices);
    let maxP = Math.max(...prices);

    // Give 5% breathing room
    if (minP === maxP) {
      minP = Math.round(minP * 0.95);
      maxP = Math.round(maxP * 1.05);
    } else {
      const spread = maxP - minP;
      minP = Math.max(0, Math.floor((minP - spread * 0.1) / 100) * 100);
      maxP = Math.ceil((maxP + spread * 0.1) / 100) * 100;
    }

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const mappedPoints = chartData.map((d, index) => {
      const x = chartData.length > 1
        ? padding.left + (index / (chartData.length - 1)) * plotWidth
        : padding.left + plotWidth / 2;
      
      const normalizedY = (d.price - minP) / (maxP - minP);
      const y = height - padding.bottom - normalizedY * plotHeight;

      return {
        ...d,
        x,
        y,
        formattedDate: new Date(d.recordedAt).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric'
        }),
        formattedPrice: `₹${d.price.toLocaleString('en-IN')}`,
        storeName: d.store?.storeName || 'Store'
      };
    });

    // Create SVG Path string
    let pD = '';
    let aD = '';
    if (mappedPoints.length > 0) {
      pD = `M ${mappedPoints[0].x} ${mappedPoints[0].y}`;
      for (let i = 1; i < mappedPoints.length; i++) {
        pD += ` L ${mappedPoints[i].x} ${mappedPoints[i].y}`;
      }
      const baselineY = height - padding.bottom;
      aD = `${pD} L ${mappedPoints[mappedPoints.length - 1].x} ${baselineY} L ${mappedPoints[0].x} ${baselineY} Z`;
    }

    // Y Axis Labels (4 horizontal ticks)
    const ySteps = 4;
    const yTicks = [];
    for (let i = 0; i <= ySteps; i++) {
      const priceVal = Math.round(minP + (i / ySteps) * (maxP - minP));
      const yPos = height - padding.bottom - (i / ySteps) * plotHeight;
      yTicks.push({
        price: priceVal,
        label: `₹${priceVal.toLocaleString('en-IN')}`,
        y: yPos
      });
    }

    // X Axis Labels (sample 4-5 dates)
    const xTicks = [];
    const step = Math.max(1, Math.floor(mappedPoints.length / 4));
    for (let i = 0; i < mappedPoints.length; i += step) {
      xTicks.push(mappedPoints[i]);
    }
    // Ensure last point is included
    if (mappedPoints.length > 1 && !xTicks.includes(mappedPoints[mappedPoints.length - 1])) {
      xTicks.push(mappedPoints[mappedPoints.length - 1]);
    }

    return {
      points: mappedPoints,
      minPrice: minP,
      maxPrice: maxP,
      yLabels: yTicks,
      xLabels: xTicks,
      pathD: pD,
      areaD: aD
    };
  }, [chartData]);

  const stats = summary || {
    minPrice: chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0,
    maxPrice: chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 0,
    avgPrice: chartData.length > 0 ? Math.round(chartData.reduce((a, b) => a + b.price, 0) / chartData.length) : 0,
    trend: 'stable'
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-area">
          <h3>
            <SvgIcon name="chart" size={18} color="var(--color-primary)" />
            Historical Price Tracking
          </h3>
          <p className="chart-subtitle">
            Track real historical price fluctuations across stores over time.
          </p>
        </div>

        {/* Range Selector */}
        <div className="chart-filters">
          <button
            className={`chart-filter-btn ${activeRange === '7' ? 'active' : ''}`}
            onClick={() => handleRangeClick('7')}
          >
            7 Days
          </button>
          <button
            className={`chart-filter-btn ${activeRange === '30' ? 'active' : ''}`}
            onClick={() => handleRangeClick('30')}
          >
            30 Days
          </button>
          <button
            className={`chart-filter-btn ${activeRange === '90' ? 'active' : ''}`}
            onClick={() => handleRangeClick('90')}
          >
            90 Days
          </button>
          <button
            className={`chart-filter-btn ${activeRange === 'all' ? 'active' : ''}`}
            onClick={() => handleRangeClick('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="chart-stats-grid">
        <div className="chart-stat-item">
          <div className="chart-stat-label">Lowest Recorded</div>
          <div className="chart-stat-value" style={{ color: 'var(--color-success)' }}>
            ₹{stats.minPrice ? stats.minPrice.toLocaleString('en-IN') : '0'}
          </div>
        </div>

        <div className="chart-stat-item">
          <div className="chart-stat-label">Highest Recorded</div>
          <div className="chart-stat-value">
            ₹{stats.maxPrice ? stats.maxPrice.toLocaleString('en-IN') : '0'}
          </div>
        </div>

        <div className="chart-stat-item">
          <div className="chart-stat-label">Average Price</div>
          <div className="chart-stat-value">
            ₹{stats.avgPrice ? stats.avgPrice.toLocaleString('en-IN') : '0'}
          </div>
        </div>

        <div className="chart-stat-item">
          <div className="chart-stat-label">Price Trend</div>
          <div className="chart-stat-value" style={{ fontSize: '15px' }}>
            <span className={`chart-stat-trend ${stats.trend}`}>
              {stats.trend === 'falling' && <SvgIcon name="arrow-down" size={14} color="var(--color-success)" />}
              {stats.trend === 'rising' && <SvgIcon name="arrow-up" size={14} color="var(--color-danger)" />}
              {stats.trend === 'stable' && <SvgIcon name="check" size={14} color="var(--color-text-muted)" />}
              {stats.trend === 'falling' ? 'Falling (Good Time to Buy)' : stats.trend === 'rising' ? 'Rising' : 'Stable'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      {points.length === 0 ? (
        <div className="empty-state" style={{ height: '260px', justifyContent: 'center' }}>
          <SvgIcon name="chart" size={32} color="var(--color-text-muted)" />
          <div className="empty-state-title">No price history recorded yet</div>
          <div className="empty-state-desc">History points are collected during scheduled price monitoring runs.</div>
        </div>
      ) : (
        <div className="chart-svg-container">
          <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Price Ticks */}
            {yLabels.map((tick, idx) => (
              <g key={`y-${idx}`}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={width - padding.right}
                  y2={tick.y}
                  className="chart-grid-line"
                />
                <text
                  x={padding.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="chart-axis-text"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Date Labels */}
            {xLabels.map((pt, idx) => (
              <text
                key={`x-${idx}`}
                x={pt.x}
                y={height - 12}
                textAnchor="middle"
                className="chart-axis-text"
              >
                {pt.formattedDate}
              </text>
            ))}

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

            {/* Main Price Line */}
            {pathD && <path d={pathD} className="chart-line" />}

            {/* Interactive Data Nodes */}
            {points.map((pt, idx) => (
              <circle
                key={`pt-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === idx ? 5.5 : 3.5}
                className={`chart-point ${hoveredPoint === idx ? 'active' : ''}`}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(points[hoveredPoint].x / width) * 100}%`,
                top: `${(points[hoveredPoint].y / height) * 100}%`
              }}
            >
              <div className="chart-tooltip-price">{points[hoveredPoint].formattedPrice}</div>
              <div className="chart-tooltip-store">{points[hoveredPoint].storeName}</div>
              <div className="chart-tooltip-date">{points[hoveredPoint].formattedDate}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
