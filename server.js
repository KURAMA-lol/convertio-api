// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const ConvertioScraper = require('./scraper');

const app = express();
const upload = multer({ dest: 'uploads/' });
const scraper = new ConvertioScraper();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available formats
app.get('/formats', async (req, res) => {
  try {
    const formats = await scraper.getFormats();
    res.json({ success: true, formats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Convert file endpoint
app.post('/convert', upload.single('file'), async (req, res) => {
  const { toFormat } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  if (!toFormat) {
    return res.status(400).json({ success: false, error: 'toFormat required' });
  }

  try {
    const result = await scraper.convert(req.file.path, null, toFormat);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    // Clean up uploaded file
    const fs = require('fs');
    fs.unlink(req.file.path, () => {});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Convertio API running on port ${PORT}`);
});