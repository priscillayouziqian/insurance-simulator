const db = require('./db');

const createTables = async () => {
    try {
        // 1. create company_users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS company_users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                date_of_birth DATE NOT NULL
            );
        `);

        // 2. create enrollment records table
        // use REFERENCES to link enrollments to company_users, ensuring data integrity
        await db.query(`
            CREATE TABLE IF NOT EXISTS enrollments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES company_users(id),
                plan_type VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. put some test data into company_users table
        await db.query(`
            INSERT INTO company_users (name, email, date_of_birth) 
            VALUES 
            ('Alice Smith', 'alice@company.com', '1990-05-15'),
            ('Bob Jones', 'bob@company.com', '2010-08-20') -- Bob is a minor, which will be useful for testing age-related validation
            ON CONFLICT (email) DO NOTHING;
        `);

        // 4. create claims table
        await db.query(`
            CREATE TABLE IF NOT EXISTS claims (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES company_users(id),
                policy_number VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. create claim_items table
        // ON DELETE CASCADE ensures if a claim is deleted, its items are too
        await db.query(`
            CREATE TABLE IF NOT EXISTS claim_items (
                id SERIAL PRIMARY KEY,
                claim_id INTEGER REFERENCES claims(id) ON DELETE CASCADE,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL
            );
        `);

        // 6. create claim_status_history table to track status changes over time
        await db.query(`
            CREATE TABLE IF NOT EXISTS claim_status_history (
                id SERIAL PRIMARY KEY,
                claim_id INTEGER REFERENCES claims(id) ON DELETE CASCADE,
                old_status VARCHAR(50),
                new_status VARCHAR(50) NOT NULL,
                note TEXT,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ Database tables created successfully, test data inserted!");
    } catch (err) {
        console.error("❌ Database initialization failed:", err);
    } finally {
        process.exit();
    }
};

createTables();