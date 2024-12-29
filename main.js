document.addEventListener('DOMContentLoaded', () => {
  const videoInput = document.getElementById('videoInput');
  const uploadButton = document.getElementById('uploadBtn');
  const progressBar = document.getElementById('progressBar');
  const statusDiv = document.getElementById('status');
  const videoSection = document.getElementById('videoSection');
  const uploadedVideo = document.getElementById('uploadedVideo');
  const downloadBtn = document.getElementById('downloadBtn');

  let downloadToken = '';

  // main.js

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

    // Capture 'from' and 'to' timestamps
    const fromTimeInput = document.getElementById('fromTime').value.trim();
    const toTimeInput = document.getElementById('toTime').value.trim();

    // Validate timestamps (optional but recommended)
    const timeRegex = /^(\d{2}:)?(\d{2}:)?\d{2}$/; // Matches HH:MM:SS or MM:SS or SS
    if (fromTimeInput && !timeRegex.test(fromTimeInput) && isNaN(fromTimeInput)) {
      alert('Please enter a valid "From" time in HH:MM:SS or seconds.');
      return;
    }
    if (toTimeInput && !timeRegex.test(toTimeInput) && isNaN(toTimeInput)) {
      alert('Please enter a valid "To" time in HH:MM:SS or seconds.');
      return;
    }

    // Optional: Ensure 'from' is less than 'to'
    let fromSeconds = 0;
    let toSeconds = 0;

    if (fromTimeInput) {
      fromSeconds = convertToSeconds(fromTimeInput);
    }
    if (toTimeInput) {
      toSeconds = convertToSeconds(toTimeInput);
    }

    if (fromSeconds && toSeconds && fromSeconds >= toSeconds) {
      alert('"From" time must be less than "To" time.');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('orientation', orientation); // Append orientation

    if (fromTimeInput) {
      formData.append('fromTime', fromTimeInput);
    }
    if (toTimeInput) {
      formData.append('toTime', toTimeInput);
    }

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

  /**
   * Converts a time string in HH:MM:SS or MM:SS or SS format to seconds.
   * @param {string} timeStr - Time string.
   * @returns {number} - Total seconds.
   */
  function convertToSeconds(timeStr) {
    const parts = timeStr.split(':').map(part => parseInt(part, 10));
    let seconds = 0;

    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      seconds = parts[0];
    }

    return seconds;
  }
  // Handle download button click
  downloadBtn.addEventListener('click', () => {
    if (!downloadToken) {
      alert('No video to download.');
      return;
    }
    window.location.href = `https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/download/${downloadToken}`;
  });
});