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

    // IMPORTANT: For Vercel, `fs` (file system) operations are not persistent.
    // You MUST replace this with a database integration (e.g., MongoDB, Supabase, Firebase) for persistent analytics.

    const { id, rating } = req.body;
    if (!id || !['up', 'down'].includes(rating)) {
        return res.status(400).json({ error: 'Invalid id or rating' });
    }

    console.log(`Analytics rating POST (Vercel - needs database): ID=${id}, Rating=${rating}`);
    // Placeholder: Add code here to update rating in your database
    res.status(200).json({ success: true, message: "Rating received (needs database integration)" });
}; 