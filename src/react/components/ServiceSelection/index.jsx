import React from 'react';
import './ServiceSelection.css';
import { useGlobalContext } from '../../context/GlobalContext';

const ServiceSelection = ({ setView }) => {
  const { projectPath, setProjectPath } = useGlobalContext();

  const handleChooseFolder = async () => {
    const selectedPath = await window.api.chooseFolder();
    if (selectedPath) {
      setProjectPath(selectedPath);
    }
  };

  const handleServiceSelect = (service) => {
    if (service === 'aws') {
      setView('awsDeployment');
    } else if (service === 'cloudflare') {
      setView('cloudflareDeployment');
    }
  };
  console.log(projectPath);
  return (
    <div className="container">
      <h1 className="greetings">Welcome to hostinier</h1>
      <h2 className="title">
        {' '}
        To Proceed please select your app folder and choose service
      </h2>
      <div className="fileSelectionCotainer">
        <button onClick={handleChooseFolder}>
          {projectPath ? 'Edit' : 'Choose'} project folder
        </button>
        {projectPath && (
          <p className="selectedFolderPath">Selected Folder: {projectPath}</p>
        )}
      </div>
      <div className="buttonContainer">
        <button
          disabled={!projectPath}
          onClick={() => handleServiceSelect('aws')}
        >
          AWS
        </button>
        <button
          disabled={!projectPath}
          onClick={() => handleServiceSelect('cloudflare')}
        >
          Cloudflare
        </button>
      </div>
    </div>
  );
};

export default ServiceSelection;
