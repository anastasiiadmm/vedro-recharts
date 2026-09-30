import React from 'react';
import { Thermometer, Wind, Sun, Gauge } from 'lucide-react';
import { useAppSelector } from '@/store/appStore';

export const MetricCards: React.FC = () => {
  const { currentMetrics, selectedStationId, stationTimeSeries, currentTimeIndex } = useAppSelector(
    (state) => ({
      currentMetrics: state.currentMetrics,
      selectedStationId: state.selectedStationId,
      stationTimeSeries: state.stationTimeSeries,
      currentTimeIndex: state.currentTimeIndex,
    })
  );

  let currentTemp = currentMetrics.avgTemperature;
  let currentWind = currentMetrics.avgWindSpeed;
  let currentSolar = currentMetrics.avgSolarRadiation;
  let humidity = 62;
  let pressure = 1013;

  if (selectedStationId && stationTimeSeries[selectedStationId]) {
    const snap = stationTimeSeries[selectedStationId][currentTimeIndex];
    if (snap) {
      currentTemp = snap.temperature;
      currentWind = snap.windSpeed;
      currentSolar = snap.solarRadiation;
      humidity = snap.humidity;
      pressure = snap.pressure;
    }
  }

  const cards = [
    {
      title: 'Temperature',
      value: `${currentTemp.toFixed(1)}°C`,
      subtext: `Min ${currentMetrics.minTemperature}°C • Max ${currentMetrics.maxTemperature}°C`,
      icon: Thermometer,
      iconColor: '#f43f5e',
      bgColor: 'rgba(244, 63, 94, 0.1)',
      borderColor: 'rgba(244, 63, 94, 0.25)',
    },
    {
      title: 'Wind Speed',
      value: `${currentWind.toFixed(1)} m/s`,
      subtext: `Peak ${currentMetrics.maxWindSpeed} m/s`,
      icon: Wind,
      iconColor: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.1)',
      borderColor: 'rgba(56, 189, 248, 0.25)',
    },
    {
      title: 'Solar Insolation',
      value: `${currentSolar} W/m²`,
      subtext: `Peak ${currentMetrics.peakSolarRadiation} W/m²`,
      icon: Sun,
      iconColor: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.1)',
      borderColor: 'rgba(251, 191, 36, 0.25)',
    },
    {
      title: 'Atmosphere',
      value: `${pressure} hPa`,
      subtext: `Humidity ${humidity}%`,
      icon: Gauge,
      iconColor: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      borderColor: 'rgba(168, 85, 247, 0.25)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: card.bgColor,
              border: `1px solid ${card.borderColor}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>{card.title}</span>
              <Icon size={14} color={card.iconColor} />
            </div>

            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#f8fafc',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {card.value}
            </div>

            <div style={{ fontSize: 9, color: '#64748b' }}>{card.subtext}</div>
          </div>
        );
      })}
    </div>
  );
};
