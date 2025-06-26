module.exports = async (req, res) => {
    // Allow all origins for broader access. For production, you might want to restrict this.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }

    // IMPORTANT: For Vercel, `fs` (file system) operations are not persistent.
    // You MUST replace this with a database integration (e.g., MongoDB, Supabase, Firebase) for persistent analytics.

    if (req.method === 'POST') {
        const entry = req.body;
        console.log('Analytics POST (Vercel - needs database):', entry);
        // Placeholder: Add code here to save entry to your database
        res.status(200).json({ success: true, message: "Analytics received (needs database integration)" });
    } else if (req.method === 'GET') {
        console.log('Analytics GET (Vercel - needs database)');
        // Placeholder: Add code here to fetch analytics from your database
        res.status(200).json([]); // Return empty array for now, or sample data
    } else {
        res.status(501).json({ error: 'Unsupported method.' });
    }
}; 