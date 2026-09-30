import React from 'react';
import { useGisDataLoader } from '@/shared/lib/hooks';
import { Header } from '@/widgets/header';
import { MapContainer } from '@/widgets/gis-map';
import { LayerManager } from '@/widgets/layer-manager';
import { AnalyticsPanel } from '@/widgets/analytics';
import { Timeline } from '@/widgets/timeline';
import './DashboardPage.scss';

export const DashboardPage: React.FC = () => {
  useGisDataLoader();

  return (
    <main className="dashboard-page">
      <Header />
      <MapContainer />
      <LayerManager />
      <AnalyticsPanel />
      <Timeline />
    </main>
  );
};
