async function loadState() {
    const state = await window.api.getSharedState();
    if (state.awsConfig) {
      document.getElementById('accessKey').value = state.awsConfig.accessKey || '';
      document.getElementById('secretKey').value = state.awsConfig.secretKey || '';
      document.getElementById('region').value = state.awsConfig.region || '';
      document.getElementById('bucketName').value = state.awsConfig.bucketName || '';
    }
  }

  document.getElementById('backButton').addEventListener('click', () => {
    console.log(window.api)
    window.api.goBack();
  });

  document.getElementById('awsForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const config = {
      accessKey: document.getElementById('accessKey').value,
      secretKey: document.getElementById('secretKey').value,
      region: document.getElementById('region').value,
      bucketName: document.getElementById('bucketName').value,
    };
    const result = await window.api.deployApp({ config });
    console.log(result);
  });

  loadState();