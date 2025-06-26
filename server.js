const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const { Storage } = require('@google-cloud/storage'); // Import Google Cloud Storage
require('dotenv').config(); // Loads variables from your .env file

const app = express();
const PORT = 3001;
// const ANALYTICS_FILE = path.join(__dirname, 'vedantu_analytics.json'); // No longer needed for persistent storage
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME; // Get bucket name from environment variables
const GCS_FILE_NAME = 'vedantu_analytics.json'; // The name of the file in GCS

// Initialize Google Cloud Storage client
let storage;
let bucket;

// Check if GOOGLE_APPLICATION_CREDENTIALS is set
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    storage = new Storage();
    bucket = storage.bucket(GCS_BUCKET_NAME);
} else {
    console.error("GOOGLE_APPLICATION_CREDENTIALS environment variable not set. GCS will not be used.");
    // Fallback or error handling if GCS credentials are not set
}

let analyticsData = []; // In-memory storage for localhost analytics

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

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function to load analytics data from GCS
const loadAnalyticsData = async () => {
    if (!bucket) {
        console.error("GCS bucket not initialized. Cannot load analytics data.");
        return [];
    }
    try {
        const file = bucket.file(GCS_FILE_NAME);
        const [exists] = await file.exists();
        if (exists) {
            const [contents] = await file.download();
            return JSON.parse(contents.toString());
        } else {
            // If file doesn't exist, create it with empty array
            await file.save('[]');
            return [];
        }
    } catch (error) {
        console.error('Error loading analytics data from GCS:', error);
        return []; // Fallback to empty array on error
    }
};

// Function to save analytics data to GCS
const saveAnalyticsData = async () => {
    if (!bucket) {
        console.error("GCS bucket not initialized. Cannot save analytics data.");
        return;
    }
    try {
        const file = bucket.file(GCS_FILE_NAME);
        await file.save(JSON.stringify(analyticsData, null, 2));
    } catch (error) {
        console.error('Error saving analytics data to GCS:', error);
    }
};

// Load analytics data on server startup
(async () => {
    analyticsData = await loadAnalyticsData();
    console.log('Analytics data loaded:', analyticsData.length, 'entries');
})();

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
app.post('/api/analytics', async (req, res) => {
    const entry = req.body;
    analyticsData.push(entry);
    await saveAnalyticsData(); // Save data after adding
    res.json({ success: true });
});

// Endpoint to get all analytics
app.get('/api/analytics', (req, res) => {
    res.json(analyticsData);
});

// Endpoint to update rating for an analytics entry
app.post('/api/analytics/rate', async (req, res) => {
    const { id, rating } = req.body;
    if (!id || !['up', 'down'].includes(rating)) {
        return res.status(400).json({ error: 'Invalid id or rating' });
    }
    const idx = analyticsData.findIndex(entry => entry.id === id);
    if (idx === -1) {
        return res.status(404).json({ error: 'Entry not found' });
    }
    analyticsData[idx].rating = rating;
    await saveAnalyticsData(); // Save data after updating rating
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Analytics and Proxy server running on port ${PORT} (accessible globally)`);
});