document.addEventListener('DOMContentLoaded', () => {
  const videoInput = document.getElementById('videoInput');
  const uploadButton = document.getElementById('uploadBtn');
  const progressBar = document.getElementById('progressBar');
  const statusDiv = document.getElementById('status');
  const videoSection = document.getElementById('videoSection');
  const uploadedVideo = document.getElementById('uploadedVideo');
  const downloadBtn = document.getElementById('downloadBtn');

  let downloadToken = '';

  document.getElementById('uploadBtn').addEventListener('click', () => {
  const videoInput = document.getElementById('videoInput');
  const file = videoInput.files[0];

  if (!file) {
    alert('Please select a video file to upload.');
    return;
  }

  // Determine the selected orientation from radio buttons
  const orientationElement = document.querySelector('input[name="orientation"]:checked');
    let orientation = 'horizontal'; // Default orientation
    if (orientationElement) {
      orientation = orientationElement.value;
    } else {
      console.error('No orientation selected. Defaulting to horizontal.');
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('orientation', orientation); // Append orientation

    fetch('https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.downloadToken) {
        const downloadUrl = `https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/download/${data.downloadToken}`;
        // Update the frontend to use this downloadUrl
        const uploadedVideo = document.getElementById('uploadedVideo');
        const downloadBtn = document.getElementById('downloadBtn');
        const videoSection = document.getElementById('videoSection');

        if (uploadedVideo && downloadBtn && videoSection) {
          uploadedVideo.src = downloadUrl;
          downloadBtn.href = downloadUrl;
          videoSection.style.display = 'block';
        } else {
          console.error('Video elements not found in the DOM.');
        }
      } else {
        alert('Upload failed. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred during the upload.');
    });
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