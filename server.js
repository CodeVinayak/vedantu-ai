const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const ANALYTICS_FILE = path.join(__dirname, 'vedantu_analytics.json');

app.use(cors());
app.use(express.json());

// Ensure the analytics file exists
if (!fs.existsSync(ANALYTICS_FILE)) {
    fs.writeFileSync(ANALYTICS_FILE, '[]', 'utf8');
}

// Endpoint to append a new analytics entry
app.post('/api/analytics', (req, res) => {
    const entry = req.body;
    fs.readFile(ANALYTICS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Read error' });
        let arr = [];
        try { arr = JSON.parse(data); } catch (e) {}
        arr.push(entry);
        fs.writeFile(ANALYTICS_FILE, JSON.stringify(arr, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Write error' });
            res.json({ success: true });
        });
    });
});

// Endpoint to get all analytics
app.get('/api/analytics', (req, res) => {
    fs.readFile(ANALYTICS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Read error' });
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
        if (err) return res.status(500).json({ error: 'Read error' });
        let arr = [];
        try { arr = JSON.parse(data); } catch (e) {}
        const idx = arr.findIndex(entry => entry.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Entry not found' });
        arr[idx].rating = rating;
        fs.writeFile(ANALYTICS_FILE, JSON.stringify(arr, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Write error' });
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Analytics server running on http://localhost:${PORT}`);
}); 