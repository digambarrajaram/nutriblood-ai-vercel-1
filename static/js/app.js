let analysisResult = null;

// ===================== INPUT MODE SWITCHING =====================

function switchInputMode(mode) {
    const textForm = document.getElementById('analyzeForm');
    const imageForm = document.getElementById('imageForm');
    const textBtn = document.getElementById('textModeBtn');
    const imageBtn = document.getElementById('imageModeBtn');

    if (mode === 'text') {
        textForm.style.display = 'block';
        imageForm.style.display = 'none';
        textBtn.classList.add('active');
        imageBtn.classList.remove('active');
    } else {
        textForm.style.display = 'none';
        imageForm.style.display = 'block';
        imageBtn.classList.add('active');
        textBtn.classList.remove('active');
    }
}

// ===================== IMAGE UPLOAD HANDLING =====================

const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const uploadPreview = document.getElementById('uploadPreview');
const previewImage = document.getElementById('previewImage');
const uploadActions = document.getElementById('uploadActions');
const uploadError = document.getElementById('uploadError');
const uploadErrorText = document.getElementById('uploadErrorText');
const uploadLoadingOverlay = document.getElementById('uploadLoadingOverlay');
const fileNameEl = document.getElementById('fileName');
const fileSizeEl = document.getElementById('fileSize');

let errorTimeout = null;

// Click to upload (delegate: don't fire if clicking action buttons)
uploadArea.addEventListener('click', (e) => {
    // Only trigger if the click was directly on the upload area or placeholder
    if (e.target.closest('.upload-actions') || e.target.closest('.upload-preview')) {
        return;
    }
    imageInput.click();
});

// File selected via browse
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (!isValidImageFile(file)) {
            showUploadError('Please select a valid image file (PNG, JPG, JPEG)');
            return;
        }
        clearUploadError();
        showImagePreview(file);
    }
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!isValidImageFile(file)) {
        showUploadError('Please drop a valid image file (PNG, JPG, JPEG)');
        return;
    }
    clearUploadError();
    showImagePreview(file);
    // Sync the file input
    const dt = new DataTransfer();
    dt.items.add(file);
    imageInput.files = dt.files;
});

// Clipboard paste support
uploadArea.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
        if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file) {
                clearUploadError();
                showImagePreview(file);
                // Sync the file input
                const dt = new DataTransfer();
                dt.items.add(file);
                imageInput.files = dt.files;
            }
            return;
        }
    }
});

// Also listen for paste on the document when image mode is active
document.addEventListener('paste', (e) => {
    // Only handle paste if image form is visible
    if (document.getElementById('imageForm').style.display === 'none') return;
    // Don't handle if the target is an input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    // Don't double-handle if already handled by uploadArea listener
    if (e.target.closest('#uploadArea')) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
        if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file) {
                clearUploadError();
                showImagePreview(file);
                const dt = new DataTransfer();
                dt.items.add(file);
                imageInput.files = dt.files;
            }
            return;
        }
    }
});

// --- Helper Functions ---

function isValidImageFile(file) {
    if (file.type && file.type.startsWith('image/')) return true;
    // Fallback: check extension if MIME type is missing (some OS drag ops)
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg'].includes(ext);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function showUploadError(message) {
    uploadErrorText.textContent = message;
    uploadError.classList.add('visible');
    // Auto-dismiss after 4 seconds
    if (errorTimeout) clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
        uploadError.classList.remove('visible');
    }, 4000);
}

function clearUploadError() {
    uploadError.classList.remove('visible');
    if (errorTimeout) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
    }
}

function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        // Transition: hide placeholder, show preview
        uploadPlaceholder.classList.add('hidden');
        uploadPreview.classList.add('visible');
        uploadActions.classList.add('visible');
        uploadArea.classList.add('has-image');
        // File info
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatFileSize(file.size);
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    imageInput.value = '';
    previewImage.src = '';
    // Transition: show placeholder, hide preview
    uploadPlaceholder.classList.remove('hidden');
    uploadPreview.classList.remove('visible');
    uploadActions.classList.remove('visible');
    uploadArea.classList.remove('has-image');
    // Clear file info
    fileNameEl.textContent = '';
    fileSizeEl.textContent = '';
    // Clear any error
    clearUploadError();
    // Hide loading overlay
    uploadLoadingOverlay.style.display = 'none';
}

// --- Action Buttons ---

// Change button: open file dialog without removing current image
document.getElementById('changeImageBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    imageInput.click();
});

// Remove button: clear everything
document.getElementById('removeImageBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    removeImage();
});

// Reset on image form: also clear the image preview
document.getElementById('imageForm').addEventListener('reset', () => {
    removeImage();
});

// ===================== TEXT ANALYSIS FORM =====================

document.getElementById('analyzeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bloodReport = document.getElementById('bloodReport').value.trim();
    const dietPref = document.querySelector('#analyzeForm select[name="diet_preference"]').value;

    if (!bloodReport || !dietPref) {
        alert('Please fill in all fields');
        return;
    }

    const formData = new FormData();
    formData.append('blood_report', bloodReport);
    formData.append('diet_preference', dietPref);

    await submitAnalysis('/analyze', formData);
});

// ===================== IMAGE ANALYSIS FORM =====================

document.getElementById('imageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = imageInput.files[0];
    const dietPref = document.querySelector('#imageForm select[name="diet_preference_img"]').value;

    if (!file || !dietPref) {
        alert('Please upload an image and select a diet preference');
        return;
    }

    if (!isValidImageFile(file)) {
        showUploadError('Please upload a valid image file (PNG, JPG, JPEG)');
        return;
    }

    // Show loading overlay on the preview image
    uploadLoadingOverlay.style.display = 'flex';

    const formData = new FormData();
    formData.append('blood_report_image', file);
    formData.append('diet_preference', dietPref);

    await submitAnalysis('/analyze-image', formData);
});

// ===================== SHARED SUBMIT LOGIC =====================

async function submitAnalysis(endpoint, formData) {
    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // Hide loading spinner and image overlay
        document.getElementById('loadingSpinner').style.display = 'none';
        uploadLoadingOverlay.style.display = 'none';

        if (data.status === 'success') {
            analysisResult = data;
            displayResults(data);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        uploadLoadingOverlay.style.display = 'none';
        alert('Error: ' + error.message);
    }
}

// ===================== DISPLAY RESULTS =====================

function displayResults(data) {
    document.getElementById('resultsSection').style.display = 'block';
    
    // Count values by status
    const high = data.extracted_values.filter(v => v.status.toUpperCase() === 'HIGH').length;
    const low = data.extracted_values.filter(v => v.status.toUpperCase() === 'LOW').length;
    const normal = data.extracted_values.filter(v => v.status.toUpperCase() === 'NORMAL').length;

    document.getElementById('highCount').textContent = high;
    document.getElementById('lowCount').textContent = low;
    document.getElementById('normalCount').textContent = normal;

    // Blood values list
    const bloodList = document.getElementById('bloodValuesList');
    bloodList.innerHTML = data.extracted_values.map(item => {
        const status = item.status.toUpperCase();
        const badgeClass = `badge-${status.toLowerCase()}`;
        const cardClass = `blood-card ${status.toLowerCase()}`;
        
        return `
            <div class="${cardClass}">
                <div>
                    <strong>${item.test}</strong><br>
                    <small style="color: #aaa;">Value: ${item.value}</small>
                </div>
                <span class="blood-card-badge ${badgeClass}">${status}</span>
            </div>
        `;
    }).join('');

    // Summary
    document.getElementById('summaryBox').textContent = data.summary;

    // Food cards
    const avoidList = data.foods_to_avoid.map(f => `<li>${f}</li>`).join('');
    const eatList = data.foods_to_eat.map(f => `<li>${f}</li>`).join('');

    document.getElementById('foodCardAvoid').innerHTML = `
        <h4>🚫 Foods to Avoid</h4>
        <ul>${avoidList}</ul>
    `;

    document.getElementById('foodCardEat').innerHTML = `
        <h4>✅ Foods to Eat More Of</h4>
        <ul>${eatList}</ul>
    `;

    // Report
    const report = `SUMMARY:
${data.summary}

FOODS TO AVOID:
${data.foods_to_avoid.join(', ')}

FOODS TO EAT:
${data.foods_to_eat.join(', ')}`;

    document.getElementById('reportPreview').value = report;

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function downloadReport() {
    const text = document.getElementById('reportPreview').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nutriblood_report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}
