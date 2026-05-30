import express from "express";
const app = express();
app.use(express.json());
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        creator: 'heisbroken'
    });
});
const port = 5000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Test server running on port ${port}`);
});
