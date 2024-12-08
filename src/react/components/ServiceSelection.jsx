import React from 'react';

const ServiceSelection = ({ setView }) => {
  const handleServiceSelect = (service) => {
    if (service === 'aws') {
      setView('awsDeployment');
    } else if (service === 'cloudflare') {
      setView('cloudflareDeployment');
    }
  };

  return (
    <div>
      <h1>Select a Service</h1>
      <button onClick={() => handleServiceSelect('aws')}>AWS</button>
      <button onClick={() => handleServiceSelect('cloudflare')}>Cloudflare</button>
    </div>
  );
};

export default ServiceSelection;