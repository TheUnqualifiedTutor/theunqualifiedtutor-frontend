document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const videoInput = document.getElementById('videoInput');
    const statusDiv = document.getElementById('status');
    const videoSection = document.getElementById('videoSection');
    const uploadedVideo = document.getElementById('uploadedVideo');
  
    let uploadedFileUrl = '';
  
    // Handle Upload Button Click
    uploadBtn.addEventListener('click', () => {
      const file = videoInput.files[0];
      if (!file) {
        alert('Please select a video file to upload.');
        return;
      }
  
      const formData = new FormData();
      formData.append('video', file); // 'video' matches multer's upload.single('video')
  
      statusDiv.innerHTML = 'Uploading...';
  
      fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      })      
        .then((response) => {
          if (!response.ok) {
            throw new Error('Upload failed.');
          }
          return response.json();
        })
        .then((data) => {
          statusDiv.innerHTML = 'Upload successful!';
          uploadedFileUrl = data.downloadUrl;
          // Display the processed video
          uploadedVideo.src = uploadedFileUrl;
          videoSection.style.display = 'block';
        })
        .catch((error) => {
          console.error(error);
          statusDiv.innerHTML = 'Error uploading video.';
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
  