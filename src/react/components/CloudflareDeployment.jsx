import React, { useState } from 'react';

const CloudflareDeployment = ({ setView }) => {
  const [config, setConfig] = useState({});

  const handleDeploy = () => {
    // Use Electron APIs to deploy
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
      <button onClick={handleDeploy}>Deploy</button>
    </div>
  );
};

export default CloudflareDeployment;