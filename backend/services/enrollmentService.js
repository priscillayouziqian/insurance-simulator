const db = require('../db');

const enrollmentService = {
    // 1. Submit a new enrollment
    async createEnrollment(email, plan_type) {
        // Check user existence
        const userResult = await db.query('SELECT * FROM company_users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            const error = new Error('User not found in company records.');
            error.statusCode = 404; // Attach status code to error
            throw error;
        }
        const user = userResult.rows[0];

        // Eligibility rule 1: Age check
        const birthDate = new Date(user.date_of_birth);
        const ageDiffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiffMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        
        if (age < 18) {
            const error = new Error('Eligibility failed: User must be 18 or older to enroll.');
            error.statusCode = 403;
            throw error;
        }

        // Eligibility rule 2: No duplicate enrollments
        const existingEnrollment = await db.query('SELECT * FROM enrollments WHERE user_id = $1', [user.id]);
        if (existingEnrollment.rows.length > 0) {
            const error = new Error('Eligibility failed: User already has an enrollment record.');
            error.statusCode = 409;
            throw error;
        }

        // Insert into database
        const result = await db.query(
            'INSERT INTO enrollments (user_id, plan_type, status) VALUES ($1, $2, $3) RETURNING *',
            [user.id, plan_type, 'PENDING']
        );
        return result.rows[0];
    },

    // 2. Get all enrollments
    async getAllEnrollments() {
        const query = `
            SELECT e.id, e.plan_type, e.status, e.created_at, u.name, u.email 
            FROM enrollments e
            JOIN company_users u ON e.user_id = u.id
            ORDER BY e.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    },

    // 3. Update status
    async updateStatus(id, status) {
        const result = await db.query('UPDATE enrollments SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        return result.rows[0];
    }
};

module.exports = enrollmentService;
