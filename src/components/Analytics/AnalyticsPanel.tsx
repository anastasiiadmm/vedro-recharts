import React, { useState } from 'react';
import { TrendingUp, MapPin, X, Compass, Activity } from 'lucide-react';
import {
  useAppDispatch,
  useAppSelector,
  useAppStoreInstance,
  AppStoreActions,
} from '@/store/appStore';
import { TimeSeriesChart } from '@/components/Analytics/TimeSeriesChart';
import { MetricCards } from '@/components/Analytics/MetricCards';
import { WindRoseChart } from '@/components/Analytics/WindRoseChart';

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
    <section
      aria-label="Spatio-Temporal Analytics Panel"
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 72,
        right: 14,
        width: 420,
        maxHeight: 'calc(100vh - 180px)',
        zIndex: 20,
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#06b6d4" />
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>Spatio-Temporal Analytics</h2>
        </div>

        <button
          onClick={() => dispatch({ isAnalyticsOpen: false })}
          style={{
            padding: 4,
            borderRadius: 6,
            color: '#94a3b8',
          }}
          title="Close Panel"
        >
          <X size={16} />
        </button>
      </div>

      <div
        style={{
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            padding: '6px 10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, flex: 1 }}>
            <MapPin size={14} color="#38bdf8" />
            <select
              value={selectedStationId || ''}
              onChange={(e) =>
                AppStoreActions.selectStation(
                  dispatch,
                  e.target.value ? e.target.value : null,
                  store
                )
              }
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: 12,
                cursor: 'pointer',
                outline: 'none',
                width: '100%',
              }}
            >
              <option value="" style={{ background: '#0f172a' }}>
                📍 Entire Alpine Region (Mean Aggregation)
              </option>
              {stations.map((s) => (
                <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>
                  📍 {s.name} ({s.elevation}m)
                </option>
              ))}
            </select>
          </div>

          {selectedStationId && (
            <button
              onClick={() => AppStoreActions.selectStation(dispatch, null)}
              style={{
                fontSize: 11,
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 6px',
                borderRadius: 4,
                marginLeft: 6,
              }}
            >
              Reset
            </button>
          )}
        </div>

        <MetricCards />

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setActiveTab('timeseries')}
            className={`glass-button ${activeTab === 'timeseries' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '5px 8px' }}
          >
            <Activity size={13} />
            <span>Time Series (Recharts)</span>
          </button>
          <button
            onClick={() => setActiveTab('windrose')}
            className={`glass-button ${activeTab === 'windrose' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '5px 8px' }}
          >
            <Compass size={13} />
            <span>Wind Rose (Polar)</span>
          </button>
        </div>

        {activeTab === 'timeseries' ? (
          <>
            <div style={{ display: 'flex', gap: 4 }}>
              {metrics.map((m) => (
                <button
                  key={m.id}
                  onClick={() => dispatch({ activeChartMetric: m.id })}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    textAlign: 'center',
                    background:
                      activeChartMetric === m.id
                        ? 'rgba(6, 182, 212, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                    border:
                      activeChartMetric === m.id
                        ? '1px solid var(--accent-cyan)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                    color: activeChartMetric === m.id ? '#38bdf8' : '#94a3b8',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '10px 8px 4px 8px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  marginBottom: 4,
                  paddingLeft: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>24-Hour Diurnal Progression</span>
                <span style={{ fontSize: 10, color: '#38bdf8' }}>Interactive Click Sync</span>
              </div>

              <TimeSeriesChart />
            </div>
          </>
        ) : (
          <WindRoseChart />
        )}
      </div>
    </section>
  );
};
