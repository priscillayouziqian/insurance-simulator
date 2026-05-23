const enrollmentService = require('./enrollmentService');
const db = require('../db'); // Import the real DB module

// Tell Jest to MOCK the real database! 
// Now db.query won't actually hit PostgreSQL, it will do whatever we tell it to.
jest.mock('../db');

describe('Enrollment Service - createEnrollment', () => {
    // Clear mock history before each test to ensure a clean slate
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw 404 error if user does not exist', async () => {
        // Setup the fake database to return an empty array (user not found)
        db.query.mockResolvedValue({ rows: [] });

        // Expect the service to throw a specific error
        await expect(enrollmentService.createEnrollment('ghost@company.com', 'Basic Health'))
            .rejects
            .toThrow('User not found in company records.');
    });

    test('should throw 403 error if user is under 18', async () => {
        // Setup the fake database to return a minor user (Born in 2015)
        db.query.mockResolvedValue({
            rows: [{ id: 1, email: 'kid@company.com', date_of_birth: '2015-01-01' }]
        });

        await expect(enrollmentService.createEnrollment('kid@company.com', 'Basic Health'))
            .rejects
            .toThrow('Eligibility failed: User must be 18 or older to enroll.');
    });

    test('should successfully create an enrollment if rules pass', async () => {
        // For a successful enrollment, the service calls db.query 3 times.
        // We need to provide fake results for each of these 3 calls sequentially:

        // 1st Call: Check user (returns a valid adult)
        db.query.mockResolvedValueOnce({
            rows: [{ id: 2, email: 'adult@company.com', date_of_birth: '1990-01-01' }]
        });
        
        // 2nd Call: Check existing enrollment (returns empty, meaning no duplicates)
        db.query.mockResolvedValueOnce({ 
            rows: [] 
        });
        
        // 3rd Call: Insert into enrollments (returns the newly created record)
        db.query.mockResolvedValueOnce({
            rows: [{ id: 100, user_id: 2, plan_type: 'Premium Health', status: 'PENDING' }]
        });

        // Actually call our service
        const result = await enrollmentService.createEnrollment('adult@company.com', 'Premium Health');

        // Verify the results
        expect(result.id).toBe(100);
        expect(result.status).toBe('PENDING');
        
        // Enterprise-grade check: Ensure the database was called exactly 3 times
        expect(db.query).toHaveBeenCalledTimes(3); 
    });
});