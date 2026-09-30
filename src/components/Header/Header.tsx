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
import { useAppDispatch, useAppSelector, AppStoreActions } from '@/store/appStore';
import '@/components/Header/Header.scss';

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
      <header className="app-header glass-panel">
        <div className="app-header__brand">
          <div className="app-header__logo">
            <Radio size={18} color="#ffffff" className="animate-radar-sweep" />
          </div>

          <div className="app-header__title-group">
            <div className="app-header__title-row">
              <span className="app-header__title">Alps MeteoGIS Studio</span>
              <span className="app-header__tag">Vedro • MapLibre • Recharts</span>
            </div>

            <div className="app-header__station-row">
              <MapPin size={12} color={selectedStation ? '#38bdf8' : '#64748b'} />
              {selectedStation ? (
                <span className="app-header__station-active">
                  {selectedStation.name} ({selectedStation.elevation}m)
                  <button
                    onClick={() => AppStoreActions.selectStation(dispatch, null)}
                    title="Reset to Regional Overview"
                    className="app-header__station-reset-btn"
                  >
                    <X size={9} />
                  </button>
                </span>
              ) : (
                <span className="app-header__station-all">All Alpine Regions (Aggregated)</span>
              )}
            </div>
          </div>
        </div>

        <div className="app-header__center-pill">
          <div className="app-header__clock-group">
            <Clock size={14} color="#06b6d4" />
            <span className="app-header__clock-time">{currentPoint.label}</span>
            <span className={`app-header__phase-badge ${isNight ? 'night' : 'day'}`}>
              {isNight ? '🌙 Night' : '☀️ Day'}
            </span>
          </div>

          <div className="app-header__divider" />

          <div className="app-header__sync-group">
            <div
              className={`app-header__sync-dot ${isLoadingData ? 'loading animate-pulse-glow' : ''}`}
            />
            <span className="app-header__sync-text">{isLoadingData ? 'Syncing...' : 'Synced'}</span>
          </div>

          <div className="app-header__divider" />

          <div
            className="app-header__lag-group"
            title="Simulate network latency to test race condition handling"
          >
            <Zap size={12} color="#f59e0b" />
            <span className="app-header__lag-label">Lag:</span>
            <select
              value={networkDelayMs}
              onChange={(e) => AppStoreActions.setNetworkDelay(dispatch, Number(e.target.value))}
              className="app-header__lag-select"
            >
              <option value="0">0ms (Instant)</option>
              <option value="150">150ms (Normal)</option>
              <option value="400">400ms (High Lag)</option>
            </select>
          </div>
        </div>

        <div className="app-header__actions">
          <button
            onClick={() => AppStoreActions.toggle3DMode(dispatch, !mapViewState.is3D)}
            className={`glass-button btn-standard ${mapViewState.is3D ? 'active' : ''}`}
            title="Toggle 3D Perspective & Radar Tower View"
          >
            <Box size={14} />
            <span>3D View</span>
          </button>

          <button
            onClick={() =>
              AppStoreActions.updateMapViewState(dispatch, {
                center: [11.0, 47.4],
                zoom: 7.6,
                pitch: mapViewState.is3D ? 45 : 0,
                bearing: mapViewState.is3D ? -15 : 0,
              })
            }
            className="glass-button btn-compact"
            title="Reset Map View"
          >
            <Compass size={14} />
          </button>

          <button
            onClick={() => dispatch({ isSidebarOpen: !isSidebarOpen })}
            className={`glass-button btn-standard ${isSidebarOpen ? 'active' : ''}`}
            title="Toggle GIS Layer Panel"
          >
            <Layers size={14} />
            <span>Layers</span>
          </button>

          <button
            onClick={() => dispatch({ isAnalyticsOpen: !isAnalyticsOpen })}
            className={`glass-button btn-standard ${isAnalyticsOpen ? 'active' : ''}`}
            title="Toggle Recharts Analytics Panel"
          >
            <BarChart2 size={14} />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setShowInfoModal(true)}
            className="glass-button btn-compact"
            title="Architecture & Specs"
          >
            <Info size={14} />
          </button>
        </div>
      </header>

      {showInfoModal && (
        <div className="info-modal__overlay" onClick={() => setShowInfoModal(false)}>
          <div
            className="info-modal__container glass-panel-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="info-modal__header">
              <div className="info-modal__title-wrap">
                <Activity size={22} color="#06b6d4" />
                <h2>Alps MeteoGIS Architecture</h2>
              </div>
              <button onClick={() => setShowInfoModal(false)} className="info-modal__close-btn">
                <X size={16} />
              </button>
            </div>

            <div className="info-modal__body">
              <div>
                <h3>1. Unified State Flow with Vedro</h3>
                <p>
                  State is centrally managed with <code>Vedro</code> store. When the user interacts
                  with the Timeline, Map, or Recharts, a single action modifies the store, notifying
                  only subscribed components to prevent unnecessary re-renders.
                </p>
              </div>

              <div>
                <h3>2. Two-Way Recharts & Map Synchronization</h3>
                <p>
                  • Scrubbing the <strong>Timeline</strong> updates the Map layers and moves the
                  vertical reference cursor on the <strong>Recharts</strong> graph.
                  <br />• Clicking any time slice directly on the <strong>Recharts</strong> graph
                  updates the Timeline and Map.
                  <br />• Clicking a <strong>Weather Station</strong> marker on the map isolates
                  that station's microclimate curve on Recharts.
                </p>
              </div>

              <div>
                <h3>3. Asynchronous Data & Race Condition Protection</h3>
                <p>
                  Rapid scrubbing generates multiple asynchronous layer queries. Each request is
                  tagged with an incremental <code>requestId</code> and guarded with{' '}
                  <code>AbortController</code>. Out-of-order stale responses are automatically
                  discarded.
                </p>
              </div>

              <div>
                <h3>4. GIS Layer Modeling & 3D Objects</h3>
                <p>
                  • <strong>Temperature</strong>: Continuous 2m ambient heat surface & station
                  badges.
                  <br />• <strong>Wind</strong>: Aerodynamic velocity vector field with directional
                  azimuths and Canvas particle flow.
                  <br />• <strong>Solar Insolation</strong>: Irradiance polygons (W/m²) calculated
                  from solar elevation.
                  <br />• <strong>3D Doppler Radar Tower</strong>: Geodesic 3D structure on
                  Zugspitze with animated telemetry.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
