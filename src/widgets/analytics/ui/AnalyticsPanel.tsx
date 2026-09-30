import React, { useState } from 'react';
import { TrendingUp, MapPin, X, Compass, Activity } from 'lucide-react';
import { useAppDispatch, useAppSelector, useAppStoreInstance, AppStoreActions } from '@/app/store';
import { TimeSeriesChart } from './TimeSeriesChart';
import { MetricCards } from './MetricCards';
import { WindRoseChart } from './WindRoseChart';
import './Analytics.scss';

export const AnalyticsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useAppStoreInstance();
  const [activeTab, setActiveTab] = useState<'timeseries' | 'windrose'>('timeseries');

  const { selectedStationId, stations, activeChartMetric, isAnalyticsOpen } = useAppSelector(
    (state) => ({
      selectedStationId: state.selectedStationId,
      stations: state.stations,
      activeChartMetric: state.activeChartMetric,
      isAnalyticsOpen: state.isAnalyticsOpen,
    })
  );

  if (!isAnalyticsOpen) return null;

  const metrics: Array<{ id: 'all' | 'temperature' | 'wind' | 'solar'; label: string }> = [
    { id: 'all', label: 'All Series' },
    { id: 'temperature', label: 'Temp (°C)' },
    { id: 'wind', label: 'Wind (m/s)' },
    { id: 'solar', label: 'Solar (W/m²)' },
  ];

  return (
    <section aria-label="Spatio-Temporal Analytics Panel" className="analytics-panel glass-panel">
      <div className="analytics-panel__header">
        <div className="analytics-panel__title-group">
          <TrendingUp size={18} color="#06b6d4" />
          <h2 className="analytics-panel__title">Spatio-Temporal Analytics</h2>
        </div>

        <button
          onClick={() => dispatch({ isAnalyticsOpen: false })}
          className="analytics-panel__close-btn"
          title="Close Panel"
        >
          <X size={16} />
        </button>
      </div>

      <div className="analytics-panel__body">
        <div className="analytics-panel__station-bar">
          <MapPin size={14} color="#38bdf8" />
          <select
            value={selectedStationId || ''}
            onChange={(e) =>
              AppStoreActions.selectStation(dispatch, e.target.value ? e.target.value : null, store)
            }
            className="analytics-panel__station-select"
          >
            <option value="">📍 Entire Alpine Region (Mean Aggregation)</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                📍 {s.name} ({s.elevation}m)
              </option>
            ))}
          </select>

          {selectedStationId && (
            <button
              onClick={() => AppStoreActions.selectStation(dispatch, null)}
              className="glass-button analytics-panel__reset-btn"
            >
              Reset
            </button>
          )}
        </div>

        <MetricCards />

        <div className="analytics-panel__tabs">
          <button
            onClick={() => setActiveTab('timeseries')}
            className={`analytics-panel__tab-btn ${activeTab === 'timeseries' ? 'active' : ''}`}
          >
            <Activity size={13} />
            <span>Time Series (Recharts)</span>
          </button>
          <button
            onClick={() => setActiveTab('windrose')}
            className={`analytics-panel__tab-btn ${activeTab === 'windrose' ? 'active' : ''}`}
          >
            <Compass size={13} />
            <span>Wind Rose (Polar)</span>
          </button>
        </div>

        {activeTab === 'timeseries' ? (
          <>
            <div className="analytics-panel__metric-filters">
              {metrics.map((m) => (
                <button
                  key={m.id}
                  onClick={() => dispatch({ activeChartMetric: m.id })}
                  className={`analytics-panel__metric-pill ${activeChartMetric === m.id ? 'active' : ''}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <TimeSeriesChart />
          </>
        ) : (
          <WindRoseChart />
        )}
      </div>
    </section>
  );
};
