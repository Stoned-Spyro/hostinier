import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';
import './CloudflareDeploymen.css';

const CloudflareDeployment = ({ setView }) => {
  const { projectPath } = useGlobalContext();

  const [projectName, setProjectName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [status, setStatus] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [requirementsMet, setRequirementsMet] = useState(false);
  const [requirementsError, setRequirementsError] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkRequirements = async () => {
      const result = await window.api.checkCloudflareRequirements();
      if (result.success) {
        setRequirementsMet(true);
      } else {
        setRequirementsError(result.error);
      }
    };
    checkRequirements();
  }, []);

  const handleDeploy = async () => {
    try {
      if (!projectName || !accountId || !apiToken || !projectPath) {
        setStatus('Please fill all required fields.');
        return;
      }

      setStatus('Deploying...');
      setAppUrl(''); // Clear previous URL if any
      const result = await window.api.deployToCloudflare({
        projectName,
        accountId,
        apiToken,
        projectPath,
      });

      if (result.success) {
        setAppUrl(result.appUrl);
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

  return (
    <div className="cloudflareContainer">
      {requirementsError && showModal && (
        <div className="modal">
          <button className="closeButton" onClick={() => setShowModal(false)}>
            X
          </button>
          <p style={{ color: 'red' }}>
            {requirementsError || 'Checking requirements...'}
          </p>
          <p>Please ensure the following:</p>
          <ul>
            <li>
              Wrangler CLI is installed. Install via{' '}
              <code>npm install -g wrangler</code>.
            </li>
            <li>
              API Token with Pages permissions is configured in Cloudflare.
            </li>
            <li>Your Account ID is accessible from Cloudflare dashboard.</li>
          </ul>
        </div>
      )}
      <h1 className="serviceName">Deploy to Cloudflare</h1>
      <div className="inputForm">
        <div className="cloudlfareInputLabel">
          <label className="inputLabel">Project Name*:</label>
          <input
            type="text"
            className="inputField"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className="cloudlfareInputLabel">
          <label className="inputLabel">Account ID*:</label>
          <input
            type="text"
            className="inputField"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
        </div>
        <div className="cloudlfareInputLabel">
          <label className="inputLabel">API Token*:</label>
          <input
            type="text"
            className="inputField"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
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
          Deploy to Cloudflare
        </button>
      </div>
    </div>
  );
};

export default CloudflareDeployment;
