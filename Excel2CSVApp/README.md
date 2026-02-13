# 📊 Excel to CSV Converter API

A complete Node.js application to convert Excel files (.xlsx, .xls, .xlsm, .xlsb) to CSV format with a REST API and modern web interface.

## 🚀 Features

- **REST API** for programmatic file conversion
- **File Reference System** - Secure file handling with unique references
- **Modern Web Interface** - Beautiful, responsive UI with drag-and-drop
- **Multiple Excel Formats** - Supports .xlsx, .xls, .xlsm, .xlsb
- **Automatic Cleanup** - Files expire after 24 hours
- **CORS Enabled** - Ready for cross-origin requests

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## 🛠️ Installation

1. **Navigate to the project directory:**
   ```bash
   cd Excel2CSVApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

The server will start at `http://localhost:3000`

## 📡 API Endpoint

### Convert Excel to CSV

**Endpoint:** `POST /api/convert`

**Description:** Send an Excel file as binary data and receive the CSV file as binary data.

**Request:**
- Method: `POST`
- Content-Type: `application/octet-stream`
- Body: Raw binary data of the Excel file (.xlsx, .xls, .xlsm, .xlsb)

**Response:**
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="converted.csv"`
- Body: CSV file as binary data

**How it works:**
1. Send your Excel file as raw binary data in the request body
2. The API converts it to CSV format
3. Returns the CSV file immediately as binary data in the response
4. You can save the response body as a .csv file

## 🧪 Testing with Postman

### Send Excel File and Receive CSV File

1. **Create a new POST request**
   - URL: `http://localhost:3000/api/convert`
   - Method: `POST`

2. **Configure Headers**
   - Add header: `Content-Type` = `application/octet-stream`

3. **Configure Body**
   - Go to **Body** tab
   - Select **binary**
   - Click **Select File** and choose your Excel file (.xlsx, .xls, .xlsm, or .xlsb)

4. **Send the Request**
   - Click **Send**
   - The response will be the CSV file in binary format
   - Click **Save Response** → **Save to a file** to download the CSV

**Alternative: Using cURL**
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/octet-stream" \
  --data-binary @yourfile.xlsx \
  -o output.csv
```

## 📁 Project Structure

```
Excel2CSVApp/
├── public/
│   ├── index.html      # Web interface
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
├── server.js           # Main server file
├── package.json        # Project dependencies
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## ⚙️ Configuration

- **Port:** Default is 3000, can be changed via environment variable `PORT`
- **File Size Limit:** 10MB (configurable in server.js)
- **File Expiration:** 24 hours (configurable in server.js)
- **Cleanup Interval:** Every 1 hour (configurable in server.js)

## 🔒 Security Features

- File type validation (only Excel files allowed)
- File size limits (10MB max)
- Automatic file cleanup after 24 hours
- Unique file references prevent unauthorized access
- Uploaded Excel files are deleted immediately after conversion

## ⚠️ Error Handling

The API returns appropriate error messages:
- `400` - No file uploaded or invalid file type
- `404` - File reference not found
- `410` - File reference expired
- `500` - Server error during conversion

## 🎯 Examples

### cURL Example

```bash
# Convert Excel to CSV
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/octet-stream" \
  --data-binary @yourfile.xlsx \
  -o output.csv
```

### JavaScript Fetch Example

```javascript
// Read file as binary
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const arrayBuffer = await file.arrayBuffer();

// Send to API
const response = await fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream'
  },
  body: arrayBuffer
});

// Get CSV as binary
const csvBlob = await response.blob();

// Download CSV file
const url = window.URL.createObjectURL(csvBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'converted.csv';
a.click();
```

## 📝 Notes

- Files are stored temporarily and automatically deleted after 24 hours
- In production, consider using a database to store file references
- Add authentication/authorization for production use
- Consider using cloud storage (AWS S3, Azure Blob) for scalability

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port
set PORT=3001 && npm start
```

**Dependencies not installed:**
```bash
npm install
```

## 📄 License

MIT License - Feel free to use this project for any purpose.

## 🤝 Support

For issues or questions, please check the application logs or review the API documentation above.
