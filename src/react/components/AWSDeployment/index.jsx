import React, { useState, useEffect } from 'react';
import './AWSDeployment.css';
import { useGlobalContext } from '../../context/GlobalContext';

const AWSDeployment = ({ setView }) => {
  const { projectPath } = useGlobalContext();
  const [bucketName, setBucketName] = useState('');
  const [region, setRegion] = useState('');
  const [indexFilePath, setIndexFilePath] = useState('');
  const [errorFilePath, setErrorFilePath] = useState('');
  const [status, setStatus] = useState('');
  const [awsCLIError, setAwsCLIError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const checkAWSCLI = async () => {
    const result = await window.api.checkAWSCLI();
    if (!result.success) {
      setAwsCLIError(result.message);
      setShowModal(true);
    }
  };

  useEffect(() => {
    checkAWSCLI();
  }, []);

  const handleDeploy = async () => {
    if (!bucketName || !region || !indexFilePath || !projectPath) {
      setStatus('Please fill all required fields.');
      return;
    }

    await checkAWSCLI();

    setStatus('Deploying...');
    const result = await window.api.deployToS3({
      bucketName,
      region,
      indexFilePath,
      errorFilePath,
      projectPath,
    });

    if (result.success) {
      setStatus('Deployment successful!');
    } else {
      setStatus(`Deployment failed: ${result.error}`);
    }
  };

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

  return (
    <div className="awsContainer">
      {awsCLIError && showModal && (
        <div className="modal">
          <button className="closeButton" onClick={() => setShowModal(false)}>
            X
          </button>
          <h1>AWS CLI Not Ready</h1>
          <p>{awsCLIError}</p>
          <p>
            Please ensure that the AWS CLI is installed and configured on your
            system. For installation instructions, visit{' '}
            <a
              href="https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              AWS CLI Installation Guide
            </a>
            .
          </p>
        </div>
      )}
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
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
            }}
          />
        </div>
        <div className="inputElement">
          <label className="inputLabel">Bucket name *:</label>
          <input
            className="inputField"
            name="bucketName"
            value={bucketName}
            onChange={(e) => {
              setBucketName(e.target.value);
            }}
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
      {status && <p style={{ color: '#d42626' }}>{status}</p>}
      <div className="buttonContainer">
        <button onClick={() => setView('serviceSelection')}>Back</button>
        <button onClick={handleDeploy}>Deploy</button>
      </div>
    </div>
  );
};

export default AWSDeployment;
