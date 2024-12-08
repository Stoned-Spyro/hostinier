import React, { useState } from 'react';

const AWSDeployment = ({ setView, sharedState, updateState }) => {
  const [config, setConfig] = useState(sharedState.awsConfig || {});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
    updateState('awsConfig', { ...config, [name]: value });
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
      <h1>AWS Deployment</h1>
      <button onClick={() => setView('serviceSelection')}>Back</button>
      <div>
        <label>
          AWS Region:
          <input
            name="region"
            value={config.region || ''}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <button onClick={handleDeploy}>Deploy</button>
    </div>
  );
};

export default AWSDeployment;