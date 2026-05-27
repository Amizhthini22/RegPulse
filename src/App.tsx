import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MAPBoardView } from './components/MAPBoardView';
import { RegulationFeedView } from './components/RegulationFeedView';
import { EvidenceUploadView } from './components/EvidenceUploadView';
import { OrgMappingView } from './components/OrgMappingView';
import { AuditTrailView } from './components/AuditTrailView';
import './App.css';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'kanban':
        return <MAPBoardView />;
      case 'feed':
        return <RegulationFeedView />;
      case 'upload':
        return <EvidenceUploadView />;
      case 'org':
        return <OrgMappingView />;
      case 'audit':
        return <AuditTrailView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        {renderActiveView()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
