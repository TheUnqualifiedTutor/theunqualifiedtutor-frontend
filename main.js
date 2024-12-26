document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('uploadBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const videoInput = document.getElementById('videoInput');
  const statusDiv = document.getElementById('status');
  const videoSection = document.getElementById('videoSection');
  const uploadedVideo = document.getElementById('uploadedVideo');

  let uploadedFileUrl = '';

  // Determine backend URL based on environment
  const backendUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/upload'
    : 'https://api.theunqualifiedtutor.com/upload';

  // Handle Upload Button Click
  uploadBtn.addEventListener('click', () => {
    const file = videoInput.files[0];
    if (!file) {
      alert('Please select a video file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('video', file); // 'video' matches Multer's upload.single('video')

    statusDiv.innerHTML = 'Uploading...';

    fetch(backendUrl, { // Use backendUrl variable
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.message || 'Upload failed.');
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Upload successful:', data);
        statusDiv.innerHTML = 'Upload successful!';
        uploadedFileUrl = data.downloadUrl;
        // Display the processed video
        uploadedVideo.src = uploadedFileUrl;
        videoSection.style.display = 'block';
      })
      .catch((error) => {
        console.error('Error uploading video:', error);
        statusDiv.innerHTML = `Error uploading video: ${error.message}`;
      });
  });

  // Handle Download Button Click
  downloadBtn.addEventListener('click', () => {
    if (!uploadedFileUrl) {
      alert('No video to download.');
      return;
    }
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = uploadedFileUrl;
    // Extract filename from URL
    const urlParts = uploadedFileUrl.split('/');
    link.download = urlParts[urlParts.length - 1];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
  