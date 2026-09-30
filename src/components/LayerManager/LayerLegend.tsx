import React from 'react';
import { ColorStop } from '@/types/gis.types';

interface LayerLegendProps {
  colorScale: ColorStop[];
  unit: string;
}

export const LayerLegend: React.FC<LayerLegendProps> = ({ colorScale, unit }) => {
  if (!colorScale || colorScale.length === 0) return null;

  const gradientStops = colorScale
    .map((stop, index) => {
      const pct = (index / (colorScale.length - 1)) * 100;
      return `${stop.color} ${pct}%`;
    })
    .join(', ');

  const minStop = colorScale[0];
  const maxStop = colorScale[colorScale.length - 1];

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: `linear-gradient(to right, ${gradientStops})`,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          fontSize: 10,
          color: '#94a3b8',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <span>{minStop.label || `${minStop.value} ${unit}`}</span>
        <span>{maxStop.label || `${maxStop.value} ${unit}`}</span>
      </div>
    </div>
  );
};
