const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');

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

// Upload file function - sends Excel as binary, receives CSV as binary
async function uploadFile(file) {
    // Show loading state
    uploadSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    try {
        // Read file as array buffer
        const arrayBuffer = await file.arrayBuffer();

        // Send as binary data
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            body: arrayBuffer
        });

        if (response.ok) {
            // Get CSV as blob
            const csvBlob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(csvBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace(/\.[^/.]+$/, '.csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // Show success message
            alert('✅ Excel file converted to CSV successfully! File downloaded.');

            // Reset to upload screen
            loadingSection.classList.add('hidden');
            uploadSection.classList.remove('hidden');
            fileInput.value = '';
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Conversion failed');
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
