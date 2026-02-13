const express = require('express');
const XLSX = require('xlsx');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse binary data (raw body) with size limit
app.use(express.raw({
    type: 'application/octet-stream',
    limit: '10mb'
}));

// Serve static files from public directory
app.use(express.static('public'));

// POST /api/convert - Accept Excel file as binary and return CSV as binary
app.post('/api/convert', (req, res) => {
    try {
        // Check if body contains data
        if (!req.body || req.body.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No file data received. Please send Excel file as binary (application/octet-stream).'
            });
        }

        // Read Excel file from buffer
        const workbook = XLSX.read(req.body, { type: 'buffer' });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to CSV
        const csvData = XLSX.utils.sheet_to_csv(worksheet);

        // Set response headers for CSV file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename="converted.csv"');

        // Send CSV data as binary
        res.send(Buffer.from(csvData, 'utf8'));

    } catch (error) {
        console.error('Error converting Excel to CSV:', error);

        res.status(500).json({
            success: false,
            message: 'Error converting Excel file',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Excel to CSV Converter API is running on http://localhost:${PORT}`);
    console.log(`API Endpoint:`);
    console.log(`  POST /api/convert - Send Excel file as binary (application/octet-stream) and receive CSV as binary`);
});
