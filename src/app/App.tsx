import React from 'react';
import { AppStoreProvider } from './store';
import { DashboardPage } from '@/pages';
import '@/app/styles/index.scss';
import './App.scss';

export const App: React.FC = () => {
  return (
    <AppStoreProvider>
      <div className="app-root">
        <DashboardPage />
      </div>
    </AppStoreProvider>
  );
};
