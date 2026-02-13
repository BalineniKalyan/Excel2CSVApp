const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from public directory
app.use(express.static('public'));

// Create directories for file storage
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'outputs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls, .xlsm, .xlsb) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Store file references in memory (in production, use a database)
const fileReferences = new Map();

// Generate unique file reference
function generateFileReference() {
  return crypto.randomBytes(16).toString('hex');
}

// POST /api/convert - Upload Excel file and convert to CSV
app.post('/api/convert', upload.single('excelFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload an Excel file.'
      });
    }

    const excelFilePath = req.file.path;
    const originalFileName = req.file.originalname;

    // Read Excel file
    const workbook = XLSX.readFile(excelFilePath);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to CSV
    const csvData = XLSX.utils.sheet_to_csv(worksheet);

    // Generate unique file reference
    const fileReference = generateFileReference();
    
    // Create CSV file path
    const csvFileName = `${fileReference}.csv`;
    const csvFilePath = path.join(outputDir, csvFileName);

    // Write CSV to file
    fs.writeFileSync(csvFilePath, csvData, 'utf8');

    // Store file reference with metadata
    fileReferences.set(fileReference, {
      csvFilePath: csvFilePath,
      originalFileName: originalFileName.replace(/\.[^/.]+$/, '.csv'),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Clean up uploaded Excel file
    fs.unlinkSync(excelFilePath);

    // Return response with file reference
    res.json({
      success: true,
      fileReference: fileReference,
      message: 'Excel file converted to CSV successfully',
      originalFileName: originalFileName,
      downloadUrl: `/api/download/${fileReference}`
    });

  } catch (error) {
    console.error('Error converting Excel to CSV:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error converting Excel file',
      error: error.message
    });
  }
});

// GET /api/download/:fileReference - Download CSV file using file reference
app.get('/api/download/:fileReference', (req, res) => {
  try {
    const fileReference = req.params.fileReference;

    // Check if file reference exists
    if (!fileReferences.has(fileReference)) {
      return res.status(404).json({
        success: false,
        message: 'File reference not found or expired'
      });
    }

    const fileData = fileReferences.get(fileReference);

    // Check if file has expired
    if (new Date() > fileData.expiresAt) {
      // Clean up expired file
      if (fs.existsSync(fileData.csvFilePath)) {
        fs.unlinkSync(fileData.csvFilePath);
      }
      fileReferences.delete(fileReference);

      return res.status(410).json({
        success: false,
        message: 'File reference has expired'
      });
    }

    // Check if file exists
    if (!fs.existsSync(fileData.csvFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'CSV file not found'
      });
    }

    // Send file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.originalFileName}"`);
    res.sendFile(fileData.csvFilePath);

  } catch (error) {
    console.error('Error downloading CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading CSV file',
      error: error.message
    });
  }
});

// GET /api/status/:fileReference - Check if file reference is valid
app.get('/api/status/:fileReference', (req, res) => {
  const fileReference = req.params.fileReference;

  if (!fileReferences.has(fileReference)) {
    return res.json({
      success: false,
      exists: false,
      message: 'File reference not found'
    });
  }

  const fileData = fileReferences.get(fileReference);
  const isExpired = new Date() > fileData.expiresAt;

  res.json({
    success: true,
    exists: true,
    expired: isExpired,
    createdAt: fileData.createdAt,
    expiresAt: fileData.expiresAt,
    originalFileName: fileData.originalFileName
  });
});

// Cleanup expired files periodically (every hour)
setInterval(() => {
  const now = new Date();
  for (const [reference, data] of fileReferences.entries()) {
    if (now > data.expiresAt) {
      if (fs.existsSync(data.csvFilePath)) {
        fs.unlinkSync(data.csvFilePath);
      }
      fileReferences.delete(reference);
      console.log(`Cleaned up expired file reference: ${reference}`);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Start server
app.listen(PORT, () => {
  console.log(`Excel to CSV Converter API is running on http://localhost:${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`  POST /api/convert - Upload Excel file to convert to CSV`);
  console.log(`  GET  /api/download/:fileReference - Download CSV file`);
  console.log(`  GET  /api/status/:fileReference - Check file reference status`);
});
