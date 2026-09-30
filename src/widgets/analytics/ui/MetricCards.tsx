import React from 'react';
import { Thermometer, Wind, Sun, Gauge } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import './Analytics.scss';

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
      variantClass: 'kpi-card--temp',
    },
    {
      title: 'Wind Speed',
      value: `${currentWind.toFixed(1)} m/s`,
      subtext: `Peak ${currentMetrics.maxWindSpeed} m/s`,
      icon: Wind,
      iconColor: '#38bdf8',
      variantClass: 'kpi-card--wind',
    },
    {
      title: 'Solar Insolation',
      value: `${currentSolar} W/m²`,
      subtext: `Peak ${currentMetrics.peakSolarRadiation} W/m²`,
      icon: Sun,
      iconColor: '#fbbf24',
      variantClass: 'kpi-card--solar',
    },
    {
      title: 'Atmosphere',
      value: `${pressure} hPa`,
      subtext: `Humidity ${humidity}%`,
      icon: Gauge,
      iconColor: '#a855f7',
      variantClass: 'kpi-card--atmosphere',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className={`kpi-card ${card.variantClass}`}>
            <div className="kpi-card__header">
              <span className="kpi-card__label">{card.title}</span>
              <Icon size={14} color={card.iconColor} />
            </div>

            <div className="kpi-card__value">{card.value}</div>
            <div className="kpi-card__range">{card.subtext}</div>
          </div>
        );
      })}
    </div>
  );
};
