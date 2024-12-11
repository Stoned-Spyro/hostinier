import React, { useState, useEffect } from 'react';
import './AWSDeployment.css';
import { useGlobalContext } from '../../context/GlobalContext';

const AWSDeployment = ({ setView }) => {
  const { projectPath } = useGlobalContext();
  
  const [bucketName, setBucketName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [indexFilePath, setIndexFilePath] = useState('');
  const [errorFilePath, setErrorFilePath] = useState('');
  const [status, setStatus] = useState('');
  const [awsCLIError, setAwsCLIError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [allowPublicAccess, setAllowPublicAccess] = useState(false);
  const [bucketNameError, setBucketNameError] = useState('');
  const [customPolicy, setCustomPolicy] = useState(null);
  const [appUrl, setAppUrl] = useState('');
  const [deploying, setDeploying] = useState(false);

  const checkAWSCLI = async () => {
    const result = await window.api.checkAWSCLI();
    if (!result.success) {
      setAwsCLIError(result.message);
      setShowModal(true);
    }
  };

  const validateBucketName = (name) => {
    const regex = /^(?!.*\.\.)(?!.*\.$)[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
    return regex.test(name) && name.length >= 3 && name.length <= 63;
  };

  useEffect(() => {
    checkAWSCLI();
  }, []);

  const handleDeploy = async () => {
    if (!validateBucketName(bucketName)) {
      setBucketNameError(
        'Invalid bucket name. Ensure it meets AWS naming requirements.'
      );
      return;
    }

    if (!bucketName || !region || !indexFilePath || !projectPath) {
      setStatus('Please fill all required fields.');
      return;
    }

    setDeploying(true);
    setStatus('Checking all requirements and configurations...');
    await checkAWSCLI();

    setStatus('Deploying...');
    try {
      const result = await window.api.deployToS3({
        bucketName,
        region,
        indexFilePath,
        errorFilePath,
        projectPath,
        allowPublicAccess,
        customPolicy,
      });

      if (result.success) {
        const appUrl = `http://${bucketName}.s3-website-${region}.amazonaws.com`;
        setAppUrl(appUrl);
        setStatus('Deployment successful!');
      } else {
        setStatus(`Deployment failed: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Deployment failed: ${error}`);
    } finally {
      setDeploying(false);
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

  const handleChooseCustomPolicyFile = async () => {
    const filePath = await window.api.chooseCustomPolicy();
    if (filePath) {
      if (allowPublicAccess) {
        setAllowPublicAccess(false);
      }
      setCustomPolicy(filePath);
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
          <select
            name="region"
            id="region"
            className="inputSelect"
            onChange={(e) => {
              setRegion(e.target.value);
            }}
            select={region}
          >
            <option value="us-east-1">us-east-1</option>
            <option value="us-east-2">us-east-2</option>
            <option value="us-west-1">us-west-1</option>
            <option value="us-west-2">us-west-2</option>
            <option value="ap-south-1">ap-south-1</option>
            <option value="ca-central-1">ca-central-1</option>
            <option value="eu-central-1">eu-central-1</option>
            <option value="eu-west-1">eu-west-1</option>
            <option value="eu-west-2">eu-west-2</option>
          </select>
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
        {bucketNameError && <p style={{ color: 'red' }}>{bucketNameError}</p>}
        <div className="inputElement">
          <label className="inputLabel">Allow public access?</label>
          <input
            type="checkbox"
            name="allowPublicAcces"
            checked={allowPublicAccess}
            disabled={customPolicy}
            onChange={(e) => {
              setAllowPublicAccess(!allowPublicAccess);
            }}
          />
        </div>
        <div className="inputFileElement">
          <button onClick={handleChooseCustomPolicyFile}>
            {indexFilePath ? 'Change' : 'Choose'} Custom Policy:
          </button>
          {customPolicy && (
            <button
              onClick={() => {
                setCustomPolicy(null);
              }}
              style={{ backgroundColor: 'red' }}
            >
              Delete
            </button>
          )}
          {customPolicy && <p>{customPolicy}</p>}
        </div>
        <div className="inputFileElement">
          <button onClick={handleChooseIndexFile}>
            {indexFilePath ? 'Change' : 'Choose'} Index File *:
          </button>
          {indexFilePath && <p>{indexFilePath}</p>}
        </div>
        <div className="inputFileElement">
          <button onClick={handleChooseErrorFile}>
            {errorFilePath ? 'Change' : 'Choose'} Error File:
          </button>
          {errorFilePath && <p>{errorFilePath}</p>}
        </div>
      </div>
      {status && <p style={{ color: '#d42626' }}>{status}</p>}
      {appUrl && (
        <p>
          Your app is live at:{' '}
          <a
            className="appUrl"
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {appUrl}
          </a>
        </p>
      )}
      <div className="buttonContainer">
        <button onClick={() => setView('serviceSelection')}>Back</button>
        <button disabled={deploying} onClick={handleDeploy}>
          Deploy
        </button>
      </div>
    </div>
  );
};

export default AWSDeployment;
