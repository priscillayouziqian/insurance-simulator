// backend/server.js
const express = require('express');
const cors = require('cors');

// Import our new routes
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const claimRoutes = require('./routes/claimRoutes');
const errorHandler = require('./middleware/errorHandler');

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

// Mount the routes!
// Any request starting with '/api' will be handled by enrollmentRoutes
app.use('/api', enrollmentRoutes);
app.use('/api/claims', claimRoutes);

// Global Error Handling Middleware
// Must be mounted AFTER all routes to catch their errors
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
