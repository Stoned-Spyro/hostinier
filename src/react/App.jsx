import React, { useState } from 'react';
import ServiceSelection from './components/ServiceSelection';
import AWSDeployment from './components/AWSDeployment';
import CloudflareDeployment from './components/CloudflareDeployment';

const App = () => {
  const [currentView, setCurrentView] = useState('serviceSelection');

  const renderView = () => {
    switch (currentView) {
      case 'serviceSelection':
        return <ServiceSelection setView={setCurrentView} />;
      case 'awsDeployment':
        return <AWSDeployment setView={setCurrentView} />;
      case 'cloudflareDeployment':
        return <CloudflareDeployment setView={setCurrentView} />;
      default:
        return <div>Unknown View</div>;
    }
  };

  return <div>{renderView()}</div>;
};

export default App;