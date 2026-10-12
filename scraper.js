// convertio-scraper.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const CONVERTIO_API = 'https://api.convertio.co/v1';

class ConvertioScraper {
  constructor(apiKey = null) {
    // convertio doesn't require auth for basic ops, but you can add if needed
    this.client = axios.create({
      baseURL: CONVERTIO_API,
      timeout: 30000,
    });
  }

  // Get available formats (static, cached)
  async getFormats() {
    try {
      const response = await this.client.get('/formats');
      return response.data;
    } catch (error) {
      console.error('Format fetch failed:', error.message);
      throw new Error(`Cannot fetch formats: ${error.message}`);
    }
  }

  // Convert file from source to target format
  async convert(inputFile, fromFormat, toFormat) {
    try {
      const form = new FormData();
      form.append('input', 'upload');
      form.append('file', fs.createReadStream(inputFile));
      form.append('outputformat', toFormat);

      // Step 1: Upload
      const uploadResponse = await this.client.post('/convert', form, {
        headers: form.getHeaders(),
      });

      if (!uploadResponse.data.data || !uploadResponse.data.data.id) {
        throw new Error('No conversion ID returned');
      }

      const conversionId = uploadResponse.data.data.id;

      // Step 2: Poll for completion (exponential backoff)
      return await this.pollConversion(conversionId);
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  // Poll conversion status until complete
  async pollConversion(conversionId, maxAttempts = 60) {
    let attempts = 0;
    let delay = 1000;

    while (attempts < maxAttempts) {
      try {
        const response = await this.client.get(`/convert/${conversionId}`);
        const status = response.data.data.status;

        if (status === 'completed') {
          return {
            id: conversionId,
            status: 'success',
            downloadUrl: response.data.data.output.url,
            filename: response.data.data.output.filename,
          };
        }

        if (status === 'failed') {
          throw new Error(
            response.data.data.error || 'Conversion failed on server'
          );
        }

        // Still processing
        await new Promise((res) => setTimeout(res, delay));
        delay = Math.min(delay * 1.5, 5000); // Max 5s between polls
        attempts++;
      } catch (error) {
        if (attempts >= maxAttempts) {
          throw new Error(`Conversion timeout after ${maxAttempts} attempts`);
        }
        throw error;
      }
    }

    throw new Error('Conversion polling exhausted');
  }
}

module.exports = ConvertioScraper;