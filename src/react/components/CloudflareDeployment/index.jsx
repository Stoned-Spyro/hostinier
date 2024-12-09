import React, { useState } from 'react';

const CloudflareDeployment = ({ setView }) => {


  const handleInputChange = (e) => {
    
  };

  const handleDeploy = () => {
    window.api.deployApp(config).then((response) => {
      if (response.error) {
        alert(`Error: ${response.error}`);
      } else {
        alert('Deployment Successful!');
      }
    });
  };

  return (
    <div>
      <h1>Cloudflare Deployment</h1>
      <button onClick={() => setView('serviceSelection')}>Back</button>
      <div>
        <label>
          API Key:
          <input
            name="apiKey"
            value={config.apiKey || ''}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <button onClick={handleDeploy}>Deploy</button>
    </div>
  );
};

export default CloudflareDeployment;