import React, { useState } from 'react';
import './AWSDeployment.css';

const AWSDeployment = ({ setView, sharedState, updateState }) => {
  const [config, setConfig] = useState(sharedState.awsConfig || {});
  const [indexFilePath, setIndexFilePath] = useState('');
  const [errorFilePath, setErrorFilePath] = useState('');

  const handleChooseIndexFile = async () => {
    const filePath = await window.api.chooseFile();
    if (filePath) {
      setIndexFilePath(filePath);
    }
  };

  const handleChooseErrorFile = async () => {
    const filePath = await window.api.chooseFile();
    if (filePath) {
      setErrorFilePath(filePath);
    }
  };

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
    <div className="awsContainer">
      <h1 className="serviceName">AWS Deployment</h1>
      <p style={{ marginBottom: '16px' }}>
        Please note, to procced deployment, aws CLI must be installed and setted
        up in your system
      </p>
      <div className="inputForm">
        <div className="inputElement">
          <label className="inputLabel">AWS Region *:</label>
          <input
            className="inputField"
            name="region"
            value={config.region || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="inputElement">
          <label className="inputLabel">Bucket name *:</label>
          <input
            className="inputField"
            name="bucketName"
            value={config.bucketName || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="inputFileElement">
          <button onClick={handleChooseIndexFile}>Choose Index File *:</button>
          {indexFilePath && <p>{indexFilePath}</p>}
        </div>
        <div className="inputFileElement">
          <button onClick={handleChooseErrorFile}>Choose Error File:</button>
          {errorFilePath && <p>{errorFilePath}</p>}
        </div>
      </div>
      <div className="buttonContainer">
        <button onClick={() => setView('serviceSelection')}>Back</button>
        <button onClick={handleDeploy}>Deploy</button>
      </div>
    </div>
  );
};

export default AWSDeployment;
