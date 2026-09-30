import React from 'react';
import { AppStoreProvider } from '@/store/appStore';
import { useGisDataLoader } from '@/hooks/useGisDataLoader';
import { Header } from '@/components/Header/Header';
import { MapContainer } from '@/components/Map/MapContainer';
import { LayerManager } from '@/components/LayerManager/LayerManager';
import { AnalyticsPanel } from '@/components/Analytics/AnalyticsPanel';
import { Timeline } from '@/components/Timeline/Timeline';

const DashboardContent: React.FC = () => {
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
      <MapContainer />
      <Header />
      <LayerManager />
      <AnalyticsPanel />
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
