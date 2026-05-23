const enrollmentService = require('../services/enrollmentService');

const enrollmentController = {
    // Handle enrollment submission
    // Notice the added `next` parameter
    async enroll(req, res, next) {
        const { email, plan_type } = req.body;

        // Input validation (Controller's job)
        if (!email || !plan_type) {
            return res.status(400).json({ error: 'Email and plan_type are required' });
        }

        try {
            // Pass to Service layer
            const enrollment = await enrollmentService.createEnrollment(email, plan_type);
            res.status(201).json({ message: 'Enrollment submitted successfully', enrollment });
        } catch (error) {
            // Pass the error to the global error handler
            next(error);
        }
    },

    // Handle fetching all enrollments
    async getEnrollments(req, res, next) {
        try {
            const enrollments = await enrollmentService.getAllEnrollments();
            res.status(200).json(enrollments);
        } catch (error) {
            next(error);
        }
    },

    // Handle status updates
    async updateStatus(req, res, next) {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['APPROVED', 'REJECTED', 'PENDING'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        try {
            const enrollment = await enrollmentService.updateStatus(id, status);
            if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
            res.status(200).json({ message: 'Status updated successfully', enrollment });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = enrollmentController;
