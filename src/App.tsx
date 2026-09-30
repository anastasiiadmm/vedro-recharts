import React from 'react';
import { AppStoreProvider } from '@/store/appStore';
import { useGisDataLoader } from '@/hooks/useGisDataLoader';
import { Header } from '@/components/Header/Header';
import { MapContainer } from '@/components/Map/MapContainer';
import { LayerManager } from '@/components/LayerManager/LayerManager';
import { AnalyticsPanel } from '@/components/Analytics/AnalyticsPanel';
import { Timeline } from '@/components/Timeline/Timeline';
import '@/App.scss';

const DashboardContent: React.FC = () => {
  useGisDataLoader();

  return (
    <main className="app-layout">
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
