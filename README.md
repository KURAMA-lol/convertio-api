# Convertio API Wrapper

Your own Convertio file conversion API. Deploy on Render in seconds.

## Features

- ✅ Direct Convertio API access without rate-limit exposure
- ✅ Express.js server with multi-format support
- ✅ File upload handling with cleanup
- ✅ Polling-based conversion tracking
- ✅ Render-ready deployment config

## Local Development

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3000`.

## API Endpoints

### `GET /health`

Health check. Returns status and timestamp.

```json
{ "status": "ok", "timestamp": "2026-10-12T07:37:58Z" }
```

### `GET /formats`

List all available conversion formats.

```json
{ "success": true, "formats": { /* format data */ } }
```

### `POST /convert`

Convert a file. Requires multipart form data:

- `file`: binary file (form field)
- `toFormat`: target format string (e.g., `"docx"`, `"pdf"`, `"mp3"`)

**Response:**

```json
{
  "success": true,
  "result": {
    "id": "conversion_id",
    "status": "success",
    "downloadUrl": "https://...",
    "filename": "converted_file.docx"
  }
}
```

## Deploy to Render

1. Push this repo to GitHub
2. Create a Web Service on Render: https://dashboard.render.com/new/web
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` and deploys
5. Your API lives at `https://your-service-name.onrender.com`

## Usage from Your Apps

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function convertFile() {
  const form = new FormData();
  form.append('file', fs.createReadStream('document.pdf'));
  form.append('toFormat', 'docx');

  const response = await axios.post(
    'https://your-service.onrender.com/convert',
    form,
    { headers: form.getHeaders() }
  );

  console.log('Download:', response.data.result.downloadUrl);
}
```

## Notes

- **Free Render tier** sleeps after 15min inactivity; upgrade to paid for production
- **File limits**: Default 50MB (adjustable in `server.js`)
- **Timeout**: 30s default per conversion attempt
- Keep GitHub token secure when connecting Render

## License

MIT