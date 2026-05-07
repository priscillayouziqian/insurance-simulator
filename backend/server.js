// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

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

// Enrollment API
// Receives user data and creates a pending enrollment record
app.post('/api/enroll', async (req, res) => {
    const { email, plan_type } = req.body;

    if (!email || !plan_type) {
        return res.status(400).json({ error: 'Email and plan_type are required' });
    }

    try {
        // 1. Check if user exists in company_users (Basic whitelist check)
        const userResult = await db.query('SELECT * FROM company_users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found in company records.' });
        }

        const user = userResult.rows[0];

        // --- eligibility rules ---
        
        // rule 1: age must be 18 or older
        const birthDate = new Date(user.date_of_birth);
        // Calculate age by comparing birth date with current date
        const ageDiffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiffMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        
        if (age < 18) {
            return res.status(403).json({ error: 'Eligibility failed: User must be 18 or older to enroll.' });
        }

        // rule 2: user cannot have an existing enrollment record (no duplicates allowed)
        const existingEnrollment = await db.query('SELECT * FROM enrollments WHERE user_id = $1', [user.id]);
        if (existingEnrollment.rows.length > 0) {
            return res.status(409).json({ error: 'Eligibility failed: User already has an enrollment record.' });
        }
        // ----------------------------------------------

        // 2. Create an enrollment record (Status defaults to PENDING for now)
        const enrollResult = await db.query(
            'INSERT INTO enrollments (user_id, plan_type, status) VALUES ($1, $2, $3) RETURNING *',
            [user.id, plan_type, 'PENDING']
        );

        res.status(201).json({ message: 'Enrollment submitted successfully', enrollment: enrollResult.rows[0] });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
