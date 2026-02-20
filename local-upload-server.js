/**
 * Local Upload Server for Self-Hosted Deployments
 * 
 * This server allows saving PDF files directly to the public/game-cards folder
 * as an alternative to Supabase storage.
 * 
 * Setup:
 * 1. npm install express multer cors
 * 2. node local-upload-server.js
 * 3. Add to .env: VITE_STORAGE_TYPE=local
 * 4. Add to .env: VITE_LOCAL_API_URL=http://localhost:3001/api
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure upload directory exists with automatic folder creation
const uploadDir = path.join(__dirname, 'public', 'game-cards');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// File naming convention: {gameId}-{cardType}-{timestamp}.pdf
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const gameId = req.body.gameId || 'unknown';
    const cardType = req.body.cardType || 'cards';
    const timestamp = Date.now();
    const sanitizedGameId = gameId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedCardType = cardType.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${sanitizedGameId}-${sanitizedCardType}-${timestamp}.pdf`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  console.log(`Uploaded: ${req.file.filename} (${req.file.size} bytes)`);
  
  res.json({
    success: true,
    fileName: req.file.filename,
    publicUrl: `/game-cards/${req.file.filename}`,
    size: req.file.size,
    uploadedAt: new Date().toISOString()
  });
});

// Delete endpoint
app.delete('/api/delete', (req, res) => {
  const { fileName } = req.body;
  if (!fileName) {
    return res.status(400).json({ error: 'fileName required' });
  }
  
  const filePath = path.join(uploadDir, path.basename(fileName));
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${fileName}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// List files endpoint
app.get('/api/files', (req, res) => {
  const files = fs.readdirSync(uploadDir)
    .filter(f => f.endsWith('.pdf'))
    .map(f => {
      const stats = fs.statSync(path.join(uploadDir, f));
      const parts = f.replace('.pdf', '').split('-');
      return {
        name: f,
        gameId: parts[0] || 'unknown',
        publicUrl: `/game-cards/${f}`,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString()
      };
    });
  res.json(files);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uploadDir, storageType: 'local' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Local Upload Server running on http://localhost:${PORT}`);
  console.log(`📁 Files saved to: ${uploadDir}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST   /api/upload  - Upload PDF file`);
  console.log(`  DELETE /api/delete  - Delete file`);
  console.log(`  GET    /api/files   - List all files`);
  console.log(`  GET    /api/health  - Health check\n`);
});
