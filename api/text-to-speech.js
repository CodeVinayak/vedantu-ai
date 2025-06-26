const axios = require('axios');
require('dotenv').config(); // Load environment variables

module.exports = async (req, res) => {
    // Allow all origins for broader access. For production, you might want to restrict this.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }

    if (req.method !== 'POST') {
        return res.status(501).json({ error: 'Unsupported method. Only POST is allowed.' });
    }

    const { text } = req.body;
    const API_KEY = process.env.GOOGLE_API_KEY; // Securely get key from .env
    const TTS_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;
    const payload = {
        "input": { "text": text },
        "voice": { "languageCode": "en-IN", "name": "en-IN-Chirp3-HD-Zubenelgenubi" },
        "audioConfig": { "audioEncoding": "MP3" }
    };

    try {
        const response = await axios.post(TTS_URL, payload);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error proxying to TTS API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate speech.' });
    }
}; 