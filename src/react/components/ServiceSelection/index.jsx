import React from 'react';
import './ServiceSelection.css';

const ServiceSelection = ({ setView }) => {
  const handleServiceSelect = (service) => {
    if (service === 'aws') {
      setView('awsDeployment');
    } else if (service === 'cloudflare') {
      setView('cloudflareDeployment');
    }
  };

  return (
    <div className="container">
      <h1>Select a Service</h1>
      <button onClick={() => handleServiceSelect('aws')}>AWS</button>
      <button onClick={() => handleServiceSelect('cloudflare')}>Cloudflare</button>
    </div>
  );
};

export default ServiceSelection;