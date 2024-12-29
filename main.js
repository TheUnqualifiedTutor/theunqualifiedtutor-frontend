document.addEventListener('DOMContentLoaded', () => {
  const videoInput = document.getElementById('videoInput');
  const uploadButton = document.getElementById('uploadBtn');
  const progressBar = document.getElementById('progressBar');
  const statusDiv = document.getElementById('status');
  const videoSection = document.getElementById('videoSection');
  const uploadedVideo = document.getElementById('uploadedVideo');
  const downloadBtn = document.getElementById('downloadBtn');

  let downloadToken = '';

  uploadButton.addEventListener('click', () => {
    const file = videoInput.files[0];
    if (!file) {
      alert('Please select a video file to upload.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB in bytes
      alert('File size exceeds 100MB.');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    statusDiv.innerHTML = 'Uploading... 0%';
    progressBar.value = 0;

    // Create an XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/upload', true);

    // Update progress bar 
    xhr.upload.onprogress = function(event) {
      if (event.lengthComputable) {
        const percentComplete = Math.floor((event.loaded / event.total) * 100);
        statusDiv.innerHTML = `Uploading... ${percentComplete}%`;
        progressBar.value = percentComplete;
      }
    };

    xhr.onload = function() {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.downloadToken) {
          downloadToken = response.downloadToken;
          statusDiv.innerHTML = 'Upload successful!';
          progressBar.value = 100;
          // Display the processed video
          uploadedVideo.src = `https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/download/${downloadToken}`;
          videoSection.style.display = 'block';
        } else {
          statusDiv.innerHTML = 'Upload failed.';
        }
      } else {
        // Attempt to parse error message from server
        let errorMsg = 'Error uploading video.';
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          if (errorResponse.message) {
            errorMsg = `Error uploading video: ${errorResponse.message}`;
          }
        } catch (e) {
          // Unable to parse JSON, keep default message
        }
        statusDiv.innerHTML = errorMsg;
      }
    };

    xhr.onerror = function() {
      statusDiv.innerHTML = 'Error uploading video.';
    };

    xhr.send(formData);
  });

  // Handle download button click
  document.getElementById('uploadBtn').addEventListener('click', () => {
    const videoInput = document.getElementById('videoInput');
    const file = videoInput.files[0];
  
    if (!file) {
      alert('Please select a video file to upload.');
      return;
    }
  
    // Determine the selected orientation
    let orientation;
    const orientationElement = document.getElementById('orientation');
    
    if (orientationElement) {
      orientation = orientationElement.value;
    } else {
      console.error('Orientation selection element not found.');
      orientation = 'horizontal'; // Fallback to horizontal
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
});