import React, { useState } from 'react';
import ServiceSelection from './components/ServiceSelection';
import AWSDeployment from './components/AWSDeployment';
import CloudflareDeployment from './components/CloudflareDeployment';

const App = () => {
  //const [currentView, setCurrentView] = useState('serviceSelection');
  const [currentView, setCurrentView] = useState('awsDeployment');
  const [sharedState, setSharedState] = useState({});

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleStateUpdate = (key, value) => {
    setSharedState((prevState) => ({ ...prevState, [key]: value }));
  };

  return (
    <div className='mainContainer'>
      {currentView === 'serviceSelection' && (
        <ServiceSelection setView={handleViewChange} />
      )}
      {currentView === 'awsDeployment' && (
        <AWSDeployment
          setView={handleViewChange}
          sharedState={sharedState}
          updateState={handleStateUpdate}
        />
      )}
      {currentView === 'cloudflareDeployment' && (
        <CloudflareDeployment
          setView={handleViewChange}
          sharedState={sharedState}
          updateState={handleStateUpdate}
        />
      )}
    </div>
  );
};

export default App;