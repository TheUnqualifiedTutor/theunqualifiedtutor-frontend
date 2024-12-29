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

  // Validate timestamps
  const timeRegex = /^(\d{2}:)?(\d{2}:)?\d{2}$/; // Matches HH:MM:SS or MM:SS or SS
  let valid = true;

  if (fromTimeInput && !(timeRegex.test(fromTimeInput) || !isNaN(fromTimeInput))) {
    document.getElementById('fromTimeError').textContent = 'Invalid format. Use HH:MM:SS or seconds.';
    valid = false;
  } else {
    document.getElementById('fromTimeError').textContent = '';
  }

  if (toTimeInput && !(timeRegex.test(toTimeInput) || !isNaN(toTimeInput))) {
    document.getElementById('toTimeError').textContent = 'Invalid format. Use HH:MM:SS or seconds.';
    valid = false;
  } else {
    document.getElementById('toTimeError').textContent = '';
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

  if (!valid) {
    // If validation failed, do not proceed
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

  // Initialize XMLHttpRequest
  const xhr = new XMLHttpRequest();

  // Update UI: Show progress bar and reset progress
  const uploadProgressContainer = document.getElementById('uploadProgressContainer');
  const uploadProgressBar = document.getElementById('uploadProgressBar');
  uploadProgressBar.style.width = '0%';
  uploadProgressBar.textContent = '0%';
  uploadProgressContainer.style.display = 'block';

  // Show processing indicator once upload is complete
  const processingIndicator = document.getElementById('processingIndicator');
  processingIndicator.style.display = 'none'; // Hide initially

  // Define the endpoint
  const url = 'https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/upload';

  xhr.open('POST', url, true);

  // Set up a handler for the progress event
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      const percentComplete = Math.round((event.loaded / event.total) * 100);
      uploadProgressBar.style.width = percentComplete + '%';
      uploadProgressBar.textContent = percentComplete + '%';
    }
  });

  // Set up a handler for when the request finishes
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      uploadProgressContainer.style.display = 'none'; // Hide progress bar

      if (xhr.status === 200) {
        // Parse JSON response
        let response;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
          console.error('Invalid JSON response:', xhr.responseText);
          alert('An error occurred while processing the response.');
          return;
        }

        if (response.downloadToken) {
          const downloadUrl = `https://theunqualifiedtutor-backend-512d5bea31f3.herokuapp.com/download/${response.downloadToken}`;
          
          // Show processing indicator
          processingIndicator.style.display = 'block';

          // Wait for a short duration before displaying the video
          setTimeout(() => {
            processingIndicator.style.display = 'none';

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
          }, 1000); // 1 second delay
        } else {
          alert('Upload failed. Please try again.');
        }
      } else {
        console.error('Upload failed:', xhr.statusText);
        alert('An error occurred during the upload.');
      }
    }
  };

  // Handle network errors
  xhr.onerror = function () {
    uploadProgressContainer.style.display = 'none'; // Hide progress bar
    console.error('Network error.');
    alert('A network error occurred. Please try again.');
  };

  // Send the request
  xhr.send(formData);
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