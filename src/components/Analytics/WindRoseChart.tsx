import React from 'react';
import { computeWindRoseData } from '@/services/spatialMath';
import { useAppSelector } from '@/store/appStore';
import '@/components/Analytics/Analytics.scss';

export const WindRoseChart: React.FC = () => {
  const { selectedStationId, stationTimeSeries, regionTimeSeries } = useAppSelector((state) => ({
    selectedStationId: state.selectedStationId,
    stationTimeSeries: state.stationTimeSeries,
    regionTimeSeries: state.regionTimeSeries,
  }));

  const activeSeries =
    selectedStationId && stationTimeSeries[selectedStationId]
      ? stationTimeSeries[selectedStationId]
      : regionTimeSeries;

  const roseData = computeWindRoseData(
    activeSeries.map((s) => ({ speed: s.windSpeed, direction: s.windDirection }))
  );

  const size = 180;
  const center = size / 2;
  const maxRadius = size * 0.38;

  const maxCount = Math.max(...roseData.map((d) => d.calm + d.moderate + d.strong + d.gale), 4);
  const sectors = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 10,
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '10px 8px',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#94a3b8',
          marginBottom: 4,
          paddingLeft: 4,
        }}
      >
        <span style={{ fontWeight: 600 }}>Directional Wind Rose (Polar Distribution)</span>
        <span style={{ fontSize: 10, color: '#38bdf8' }}>8-Sector WMO</span>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={maxRadius * frac}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeDasharray={idx < 3 ? '2 2' : 'none'}
          />
        ))}

        {sectors.map((_, idx) => {
          const angle = (idx * 45 - 90) * (Math.PI / 180);
          const x = center + Math.cos(angle) * maxRadius;
          const y = center + Math.sin(angle) * maxRadius;
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.08)"
            />
          );
        })}

        {roseData.map((d, idx) => {
          const total = d.calm + d.moderate + d.strong + d.gale;
          if (total === 0) return null;

          const angleCenter = idx * 45 - 90;
          const halfAngle = 18;

          const a1 = ((angleCenter - halfAngle) * Math.PI) / 180;
          const a2 = ((angleCenter + halfAngle) * Math.PI) / 180;

          const rTotal = (total / maxCount) * maxRadius;
          const rCalm = (d.calm / maxCount) * maxRadius;

          const p1 = `${center + Math.cos(a1) * rTotal},${center + Math.sin(a1) * rTotal}`;
          const p2 = `${center + Math.cos(a2) * rTotal},${center + Math.sin(a2) * rTotal}`;

          return (
            <g key={d.sector}>
              <polygon points={`${center},${center} ${p1} ${p2}`} fill="#38bdf8" opacity={0.7} />
              {rCalm > 0 && (
                <polygon
                  points={`${center},${center} ${center + Math.cos(a1) * rCalm},${
                    center + Math.sin(a1) * rCalm
                  } ${center + Math.cos(a2) * rCalm},${center + Math.sin(a2) * rCalm}`}
                  fill="#a8dadc"
                  opacity={0.9}
                />
              )}
            </g>
          );
        })}

        {sectors.map((sec, idx) => {
          const angle = (idx * 45 - 90) * (Math.PI / 180);
          const labelDist = maxRadius + 14;
          const x = center + Math.cos(angle) * labelDist;
          const y = center + Math.sin(angle) * labelDist;

          return (
            <text
              key={sec}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={idx % 2 === 0 ? '#38bdf8' : '#64748b'}
              fontSize={9}
              fontWeight={idx % 2 === 0 ? 700 : 500}
              fontFamily="JetBrains Mono, monospace"
            >
              {sec}
            </text>
          );
        })}

        <circle cx={center} cy={center} r={3} fill="#06b6d4" />
      </svg>

      <div className="wind-rose__legend">
        <div className="wind-rose__legend-item">
          <span className="wind-rose__color-box" style={{ background: '#a8dadc' }} />
          Calm (&lt;5 m/s)
        </div>
        <div className="wind-rose__legend-item">
          <span className="wind-rose__color-box" style={{ background: '#38bdf8' }} />
          Moderate (5-12 m/s)
        </div>
        <div className="wind-rose__legend-item">
          <span className="wind-rose__color-box" style={{ background: '#ef4444' }} />
          Strong (&gt;18 m/s)
        </div>
      </div>
    </div>
  );
};
