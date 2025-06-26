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

    const { prompt } = req.body;
    const API_KEY = process.env.GOOGLE_API_KEY;
    const TEXT_MODEL_NAME = "gemini-2.5-flash-lite-preview-06-17";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL_NAME}:generateContent?key=${API_KEY}`;

    try {
        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error proxying to Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch response from AI model.' });
    }
}; 