const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadSection = document.getElementById('uploadSection');
const resultSection = document.getElementById('resultSection');
const loadingSection = document.getElementById('loadingSection');
const downloadBtn = document.getElementById('downloadBtn');
const convertAnotherBtn = document.getElementById('convertAnotherBtn');

let currentFileReference = null;

// Browse button click
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

// Upload box click
uploadBox.addEventListener('click', (e) => {
    if (e.target !== browseBtn) {
        fileInput.click();
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadFile(file);
    }
});

// Drag and drop functionality
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file) {
        const allowedExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
        const fileName = file.name.toLowerCase();
        const isValidFile = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (isValidFile) {
            uploadFile(file);
        } else {
            alert('Please upload a valid Excel file (.xlsx, .xls, .xlsm, .xlsb)');
        }
    }
});

// Upload file function
async function uploadFile(file) {
    // Show loading state
    uploadSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Store file reference
            currentFileReference = data.fileReference;

            // Display results
            document.getElementById('originalFileName').textContent = data.originalFileName;
            document.getElementById('fileReference').textContent = data.fileReference;
            document.getElementById('fileRefInUrl').textContent = data.fileReference;

            // Hide loading, show results
            loadingSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
        } else {
            throw new Error(data.message || 'Conversion failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);

        // Reset to upload screen
        loadingSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        fileInput.value = '';
    }
}

// Download button click
downloadBtn.addEventListener('click', () => {
    if (currentFileReference) {
        window.location.href = `/api/download/${currentFileReference}`;
    }
});

// Convert another file button
convertAnotherBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    fileInput.value = '';
    currentFileReference = null;
});
