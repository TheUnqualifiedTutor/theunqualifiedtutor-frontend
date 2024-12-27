document.addEventListener('DOMContentLoaded', () => {
  const browseButton = document.getElementById('browseBtn');
  const progressBar = document.getElementById('progressBar');
  const statusDiv = document.getElementById('status');
  const videoSection = document.getElementById('videoSection');
  const uploadedVideo = document.getElementById('uploadedVideo');
  const downloadBtn = document.getElementById('downloadBtn');

  let downloadToken = '';

  // Initialize Resumable.js
  const r = new Resumable({
    target: 'https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/upload',
    chunkSize: 1 * 1024 * 1024, // 1MB chunks
    simultaneousUploads: 3,
    testChunks: false,
    throttleProgressCallbacks: 1,
    query: {},
    headers: {
      'Access-Control-Allow-Origin': '*', // Adjust if necessary
    }
  });

  if (!r.support) {
    alert('Your browser does not support HTML5 file uploads.');
    return;
  }

  // Assign browse button
  r.assignBrowse(browseButton);

  // Update progress bar
  r.on('progress', () => {
    const progress = Math.floor(r.progress() * 100);
    progressBar.value = progress;
    statusDiv.innerHTML = `Uploading... ${progress}%`;
  });

  // Handle file added
  r.on('fileAdded', (file) => {
    r.upload();
  });

  // Handle successful upload
  r.on('fileSuccess', (file, message) => {
    const response = JSON.parse(message);
    downloadToken = response.downloadToken;
    statusDiv.innerHTML = 'Upload successful!';
    progressBar.value = 100;
    // Display the processed video
    uploadedVideo.src = `https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/download/${downloadToken}`;
    videoSection.style.display = 'block';
  });

  // Handle upload error
  r.on('fileError', (file, message) => {
    console.error('Error uploading video:', message);
    statusDiv.innerHTML = `Error uploading video: ${message}`;
  });

  // Handle download button click
  downloadBtn.addEventListener('click', () => {
    if (!downloadToken) {
      alert('No video to download.');
      return;
    }
    window.location.href = `https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/download/${downloadToken}`;
  });
});
  