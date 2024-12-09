import React, { useState } from 'react';
import ServiceSelection from './components/ServiceSelection';
import AWSDeployment from './components/AWSDeployment';
import CloudflareDeployment from './components/CloudflareDeployment';

const App = () => {
  const [currentView, setCurrentView] = useState('serviceSelection');
  //const [currentView, setCurrentView] = useState('awsDeployment');

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className='mainContainer'>
      {currentView === 'serviceSelection' && (
        <ServiceSelection setView={handleViewChange} />
      )}
      {currentView === 'awsDeployment' && (
        <AWSDeployment
          setView={handleViewChange}
        />
      )}
      {currentView === 'cloudflareDeployment' && (
        <CloudflareDeployment
          setView={handleViewChange}
        />
      )}
    </div>
  );
};

export default App;