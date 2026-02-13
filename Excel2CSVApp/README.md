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

## 🌐 Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

You can:
- Upload Excel files via drag-and-drop or file browser
- Download converted CSV files
- Copy file references for API usage

## 📡 API Endpoints

### 1. Convert Excel to CSV

**Endpoint:** `POST /api/convert`

**Description:** Upload an Excel file and receive a file reference for the converted CSV.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with key `excelFile` containing the Excel file

**Response:**
```json
{
  "success": true,
  "fileReference": "abc123def456789",
  "message": "Excel file converted to CSV successfully",
  "originalFileName": "data.xlsx",
  "downloadUrl": "/api/download/abc123def456789"
}
```

### 2. Download CSV File

**Endpoint:** `GET /api/download/:fileReference`

**Description:** Download the converted CSV file using the file reference.

**Request:**
- Method: `GET`
- URL Parameter: `fileReference` (received from convert endpoint)

**Response:**
- Content-Type: `text/csv`
- File download

### 3. Check File Status

**Endpoint:** `GET /api/status/:fileReference`

**Description:** Check if a file reference is valid and not expired.

**Request:**
- Method: `GET`
- URL Parameter: `fileReference`

**Response:**
```json
{
  "success": true,
  "exists": true,
  "expired": false,
  "createdAt": "2026-02-13T07:25:00.000Z",
  "expiresAt": "2026-02-14T07:25:00.000Z",
  "originalFileName": "data.csv"
}
```

## 🧪 Testing with Postman

### Step 1: Convert Excel File

1. Create a new POST request: `http://localhost:3000/api/convert`
2. Go to **Body** tab
3. Select **form-data**
4. Add a key named `excelFile` with type **File**
5. Choose your Excel file
6. Click **Send**
7. Copy the `fileReference` from the response

### Step 2: Download CSV File

1. Create a new GET request: `http://localhost:3000/api/download/{fileReference}`
2. Replace `{fileReference}` with the reference from Step 1
3. Click **Send**
4. The CSV file will be downloaded

### Step 3: Check File Status (Optional)

1. Create a new GET request: `http://localhost:3000/api/status/{fileReference}`
2. Replace `{fileReference}` with your file reference
3. Click **Send**
4. View file status information

## 📁 Project Structure

```
Excel2CSVApp/
├── public/
│   ├── index.html      # Web interface
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
├── uploads/            # Temporary Excel uploads (auto-created)
├── outputs/            # Generated CSV files (auto-created)
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
# Upload and convert
curl -X POST -F "excelFile=@data.xlsx" http://localhost:3000/api/convert

# Download CSV
curl -O http://localhost:3000/api/download/abc123def456789
```

### JavaScript Fetch Example

```javascript
// Upload Excel file
const formData = new FormData();
formData.append('excelFile', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('File Reference:', data.fileReference);

// Download CSV
window.location.href = `http://localhost:3000/api/download/${data.fileReference}`;
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
