// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Real-world APIs always need CORS configured to communicate with the frontend
app.use(cors()); 
// Parses incoming JSON payloads from our future enrollment form
app.use(express.json()); 

// Health Check Endpoint
// Crucial for real-world deployments to verify the service is up
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Insurance Enrollment API is running.' 
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
