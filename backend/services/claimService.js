const db = require('../db');

const claimService = {
    // 1. Submit a new claim with items (Using Transaction)
    async createClaim(email, policy_number, items) {
        // First check if user exists (can be done with normal query)
        const userResult = await db.query('SELECT id FROM company_users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        const userId = userResult.rows[0].id;

        // Check out a dedicated client from the connection pool for our transaction
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN'); // Start Transaction

            // Insert into claims
            const claimResult = await client.query(
                'INSERT INTO claims (user_id, policy_number, status) VALUES ($1, $2, $3) RETURNING *',
                [userId, policy_number, 'PENDING']
            );
            const claim = claimResult.rows[0];

            // Insert multiple items
            for (const item of items) {
                await client.query(
                    'INSERT INTO claim_items (claim_id, description, amount) VALUES ($1, $2, $3)',
                    [claim.id, item.description, item.amount]
                );
            }

            // Insert initial history record
            await client.query(
                'INSERT INTO claim_status_history (claim_id, old_status, new_status, note) VALUES ($1, $2, $3, $4)',
                [claim.id, null, 'PENDING', 'Claim initially submitted']
            );

            await client.query('COMMIT'); // Commit Transaction
            
            // Attach items to the returned object
            claim.items = items;
            return claim;
        } catch (e) {
            await client.query('ROLLBACK'); // Abort and undo everything if error occurs
            throw e;
        } finally {
            client.release(); // Always release the client back to the pool!
        }
    },

    // 2. Get all claims for the admin dashboard
    async getAllClaims() {
        const result = await db.query(`
            SELECT c.*, u.name as user_name, u.email as user_email
            FROM claims c
            JOIN company_users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
        `);
        return result.rows;
    },

    // 3. Get claim by ID with items and history
    async getClaimById(id) {
        const claimResult = await db.query('SELECT * FROM claims WHERE id = $1', [id]);
        if (claimResult.rows.length === 0) return null;
        const claim = claimResult.rows[0];
        
        const itemsResult = await db.query('SELECT * FROM claim_items WHERE claim_id = $1', [id]);
        claim.items = itemsResult.rows;

        const historyResult = await db.query('SELECT * FROM claim_status_history WHERE claim_id = $1 ORDER BY changed_at DESC', [id]);
        claim.history = historyResult.rows;

        return claim;
    },

    // 4. Update claim status (Admin action - Status Machine Workflow)
    async updateClaimStatus(id, newStatus, note) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const currentClaim = await client.query('SELECT status FROM claims WHERE id = $1', [id]);
            if (currentClaim.rows.length === 0) {
                const error = new Error('Claim not found');
                error.statusCode = 404;
                throw error;
            }
            const oldStatus = currentClaim.rows[0].status;

            if (oldStatus === newStatus) {
                const error = new Error('Claim is already in this status');
                error.statusCode = 400;
                throw error;
            }

            const updateResult = await client.query(
                'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
                [newStatus, id]
            );

            await client.query(
                'INSERT INTO claim_status_history (claim_id, old_status, new_status, note) VALUES ($1, $2, $3, $4)',
                [id, oldStatus, newStatus, note || 'Status updated']
            );

            await client.query('COMMIT');
            return updateResult.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    // 5. Get claims by User ID
    async getClaimsByUser(userId) {
        const result = await db.query('SELECT * FROM claims WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    }
};

module.exports = claimService;