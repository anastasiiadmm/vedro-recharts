import React, { useState } from 'react';
import {
  Activity,
  Layers,
  BarChart2,
  Box,
  Zap,
  Info,
  Clock,
  Radio,
  MapPin,
  X,
  Compass,
} from 'lucide-react';
import {
  useAppDispatch,
  useAppSelector,
  AppStoreActions,
} from '../../store/appStore';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const {
    timePoints,
    currentTimeIndex,
    selectedStationId,
    stations,
    isLoadingData,
    networkDelayMs,
    mapViewState,
    isSidebarOpen,
    isAnalyticsOpen,
  } = useAppSelector((state) => ({
    timePoints: state.timePoints,
    currentTimeIndex: state.currentTimeIndex,
    selectedStationId: state.selectedStationId,
    stations: state.stations,
    isLoadingData: state.isLoadingData,
    networkDelayMs: state.networkDelayMs,
    mapViewState: state.mapViewState,
    isSidebarOpen: state.isSidebarOpen,
    isAnalyticsOpen: state.isAnalyticsOpen,
  }));

  const currentPoint = timePoints[currentTimeIndex] || timePoints[0];
  const selectedStation = stations.find((s) => s.id === selectedStationId);
  const isNight = currentPoint.index < 6 || currentPoint.index > 19;

  return (
    <>
      <header
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          right: 14,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderRadius: 12,
          gap: 12,
          minHeight: 52,
        }}
        className="glass-panel"
      >
        {/* Left: Brand & Station Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
              flexShrink: 0,
            }}
          >
            <Radio size={18} color="#ffffff" className="animate-radar-sweep" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  color: '#f8fafc',
                }}
              >
                Alps MeteoGIS Studio
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                Vedro • MapLibre • Recharts
              </span>
            </div>

            {/* Target Location / Station Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <MapPin size={12} color={selectedStation ? '#38bdf8' : '#64748b'} />
              {selectedStation ? (
                <span
                  style={{
                    color: '#38bdf8',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedStation.name} ({selectedStation.elevation}m)
                  <button
                    onClick={() => AppStoreActions.selectStation(dispatch, null)}
                    title="Reset to Regional Overview"
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '50%',
                      width: 14,
                      height: 14,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#cbd5e1',
                    }}
                  >
                    <X size={9} />
                  </button>
                </span>
              ) : (
                <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  All Alpine Regions (Aggregated)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Timepoint, Day/Night, Sync Status & Lag Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 10px',
            borderRadius: 8,
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
          }}
        >
          {/* Time & Day/Night */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} color="#06b6d4" />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#f8fafc',
              }}
            >
              {currentPoint.label}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 4,
                background: isNight ? 'rgba(99, 102, 241, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                color: isNight ? '#a5b4fc' : '#fbbf24',
                whiteSpace: 'nowrap',
              }}
            >
              {isNight ? '🌙 Night' : '☀️ Day'}
            </span>
          </div>

          <div style={{ width: 1, height: 14, background: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Sync Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isLoadingData ? '#f59e0b' : '#10b981',
                boxShadow: isLoadingData
                  ? '0 0 8px rgba(245, 158, 11, 0.8)'
                  : '0 0 8px rgba(16, 185, 129, 0.8)',
              }}
              className={isLoadingData ? 'animate-pulse-glow' : ''}
            />
            <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {isLoadingData ? 'Syncing...' : 'Synced'}
            </span>
          </div>

          <div style={{ width: 1, height: 14, background: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Latency Simulator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
            }}
            title="Simulate network latency to test race condition handling"
          >
            <Zap size={12} color="#f59e0b" />
            <span style={{ color: '#64748b' }}>Lag:</span>
            <select
              value={networkDelayMs}
              onChange={(e) => AppStoreActions.setNetworkDelay(dispatch, Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: 11,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              <option value="0" style={{ background: '#0f172a' }}>0ms (Instant)</option>
              <option value="150" style={{ background: '#0f172a' }}>150ms (Normal)</option>
              <option value="400" style={{ background: '#0f172a' }}>400ms (High Lag)</option>
            </select>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* 3D Perspective Toggle */}
          <button
            onClick={() => AppStoreActions.toggle3DMode(dispatch, !mapViewState.is3D)}
            className={`glass-button ${mapViewState.is3D ? 'active' : ''}`}
            style={{ padding: '5px 9px', fontSize: 12 }}
            title="Toggle 3D Perspective & Radar Tower View"
          >
            <Box size={14} />
            <span>3D View</span>
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={() =>
              AppStoreActions.updateMapViewState(dispatch, {
                center: [11.0, 47.4],
                zoom: 7.6,
                pitch: mapViewState.is3D ? 45 : 0,
                bearing: mapViewState.is3D ? -15 : 0,
              })
            }
            className="glass-button"
            style={{ padding: '5px 8px' }}
            title="Reset Map View"
          >
            <Compass size={14} />
          </button>

          {/* Layer Panel Toggle */}
          <button
            onClick={() => dispatch({ isSidebarOpen: !isSidebarOpen })}
            className={`glass-button ${isSidebarOpen ? 'active' : ''}`}
            style={{ padding: '5px 9px', fontSize: 12 }}
            title="Toggle GIS Layer Panel"
          >
            <Layers size={14} />
            <span>Layers</span>
          </button>

          {/* Analytics Panel Toggle */}
          <button
            onClick={() => dispatch({ isAnalyticsOpen: !isAnalyticsOpen })}
            className={`glass-button ${isAnalyticsOpen ? 'active' : ''}`}
            style={{ padding: '5px 9px', fontSize: 12 }}
            title="Toggle Recharts Analytics Panel"
          >
            <BarChart2 size={14} />
            <span>Analytics</span>
          </button>

          {/* Info Modal Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="glass-button"
            style={{ padding: '5px 8px' }}
            title="Architecture & Specs"
          >
            <Info size={14} />
          </button>
        </div>
      </header>

      {/* Architecture Info Modal */}
      {showInfoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="glass-panel-elevated"
            style={{
              maxWidth: 680,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              borderRadius: 16,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Activity size={22} color="#06b6d4" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Alps MeteoGIS Architecture</h2>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  padding: 5,
                  color: '#cbd5e1',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <h3 style={{ color: '#38bdf8', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                  1. Unified State Flow with Vedro
                </h3>
                <p>
                  State is centrally managed with <code>Vedro</code> store. When the user interacts with the Timeline, Map, or Recharts, a single action modifies the store, notifying only subscribed components to prevent unnecessary re-renders.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#38bdf8', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                  2. Two-Way Recharts & Map Synchronization
                </h3>
                <p>
                  • Scrubbing the <strong>Timeline</strong> updates the Map layers and moves the vertical reference cursor on the <strong>Recharts</strong> graph.<br />
                  • Clicking any time slice directly on the <strong>Recharts</strong> graph updates the Timeline and Map.<br />
                  • Clicking a <strong>Weather Station</strong> marker on the map isolates that station's microclimate curve on Recharts.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#38bdf8', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                  3. Asynchronous Data & Race Condition Protection
                </h3>
                <p>
                  Rapid scrubbing generates multiple asynchronous layer queries. Each request is tagged with an incremental <code>requestId</code> and guarded with <code>AbortController</code>. Out-of-order stale responses are automatically discarded.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#38bdf8', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                  4. GIS Layer Modeling & 3D Objects
                </h3>
                <p>
                  • <strong>Temperature</strong>: Continuous 2m ambient heat surface & station badges.<br />
                  • <strong>Wind</strong>: Aerodynamic velocity vector field with directional azimuths and Canvas particle flow.<br />
                  • <strong>Solar Insolation</strong>: Irradiance polygons (W/m²) calculated from solar elevation.<br />
                  • <strong>3D Doppler Radar Tower</strong>: Geodesic 3D structure on Zugspitze with animated telemetry.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
