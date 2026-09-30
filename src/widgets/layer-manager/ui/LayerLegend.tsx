import React from 'react';
import { ColorStop } from '@/shared/types';

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
    <div className="layer-legend">
      <div
        className="layer-legend__bar"
        style={{ background: `linear-gradient(to right, ${gradientStops})` }}
      />

      <div className="layer-legend__ticks">
        <span>{minStop.label || `${minStop.value} ${unit}`}</span>
        <span>{maxStop.label || `${maxStop.value} ${unit}`}</span>
      </div>
    </div>
  );
};
