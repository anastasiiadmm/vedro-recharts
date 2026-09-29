import React from 'react';
import { AppStoreProvider } from './store/appStore';
import { useGisDataLoader } from './hooks/useGisDataLoader';
import { Header } from './components/Header/Header';
import { MapContainer } from './components/Map/MapContainer';
import { LayerManager } from './components/LayerManager/LayerManager';
import { AnalyticsPanel } from './components/Analytics/AnalyticsPanel';
import { Timeline } from './components/Timeline/Timeline';

const DashboardContent: React.FC = () => {
  // Sync GIS layer data automatically with Vedro store
  useGisDataLoader();

  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0a0f1d',
      }}
    >
      {/* 1. Full-screen Interactive GIS Map */}
      <MapContainer />

      {/* 2. Top Navigation & Status Bar */}
      <Header />

      {/* 3. Left Layer Manager Panel */}
      <LayerManager />

      {/* 4. Right Spatio-Temporal Analytics Panel (Recharts) */}
      <AnalyticsPanel />

      {/* 5. Bottom Timeline Controls */}
      <Timeline />
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppStoreProvider>
      <DashboardContent />
    </AppStoreProvider>
  );
};

export default App;
