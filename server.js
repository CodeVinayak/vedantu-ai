const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Loads variables from your .env file

const app = express();
const PORT = 3001;
const ANALYTICS_FILE = path.join(__dirname, 'vedantu_analytics.json');

// --- DYNAMIC CORS CONFIGURATION ---
// This setup allows requests from any origin, which is suitable for broader access.
const corsOptions = {
    origin: function (origin, callback) {
        // Allow all origins for broader access. For production, you might want to restrict this.
        callback(null, true);
    }
};

// Use the dynamic CORS options and enable Express to parse JSON bodies
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ensure the analytics file exists on startup
if (!fs.existsSync(ANALYTICS_FILE)) {
    fs.writeFileSync(ANALYTICS_FILE, '[]', 'utf8');
}

// --- PROXY ENDPOINT FOR GEMINI ---
app.post('/api/generate-content', async (req, res) => {
    const { prompt } = req.body;
    const API_KEY = process.env.GOOGLE_API_KEY; // Securely get key from .env
    const TEXT_MODEL_NAME = "gemini-2.5-flash-lite-preview-06-17";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL_NAME}:generateContent?key=${API_KEY}`;

    try {
        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying to Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch response from AI model.' });
    }
});

// --- PROXY ENDPOINT FOR TEXT-TO-SPEECH ---
app.post('/api/text-to-speech', async (req, res) => {
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
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying to TTS API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate speech.' });
    }
});


// --- ANALYTICS ENDPOINTS ---

// Endpoint to append a new analytics entry
app.post('/api/analytics', (req, res) => {
    const entry = req.body;
    fs.readFile(ANALYTICS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Analytics read error:', err);
            return res.status(500).json({ error: 'Read error' });
        }
        let arr = [];
        try {
            arr = JSON.parse(data);
        } catch (e) {
            console.error('Analytics JSON parse error:', e);
            // Ignore parse error and start with an empty array
        }
        arr.push(entry);
        fs.writeFile(ANALYTICS_FILE, JSON.stringify(arr, null, 2), (err) => {
            if (err) {
                console.error('Analytics write error:', err);
                return res.status(500).json({ error: 'Write error' });
            }
            res.json({ success: true });
        });
    });
});

// Endpoint to get all analytics
app.get('/api/analytics', (req, res) => {
    fs.readFile(ANALYTICS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Analytics read error:', err);
            return res.status(500).json({ error: 'Read error' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to update rating for an analytics entry
app.post('/api/analytics/rate', (req, res) => {
    const { id, rating } = req.body;
    if (!id || !['up', 'down'].includes(rating)) {
        return res.status(400).json({ error: 'Invalid id or rating' });
    }
    fs.readFile(ANALYTICS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Analytics read error:', err);
            return res.status(500).json({ error: 'Read error' });
        }
        let arr = [];
        try {
            arr = JSON.parse(data);
        } catch (e) {
            console.error('Analytics JSON parse error:', e);
            return res.status(500).json({ error: 'Could not parse analytics file.' });
        }
        const idx = arr.findIndex(entry => entry.id === id);
        if (idx === -1) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        arr[idx].rating = rating;
        fs.writeFile(ANALYTICS_FILE, JSON.stringify(arr, null, 2), (err) => {
            if (err) {
                console.error('Analytics write error:', err);
                return res.status(500).json({ error: 'Write error' });
            }
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Analytics and Proxy server running on port ${PORT} (accessible globally)`);
});