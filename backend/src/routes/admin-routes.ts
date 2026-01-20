/**
 * Admin routes - Handle admin operations and statistics
 */

import { Router, Request, Response } from 'express';
import { adminService } from '../services/admin-service';

const router = Router();

/**
 * GET /admin/stats
 * Get comprehensive admin statistics
 */
router.get('/stats', (req: Request, res: Response) => {
    try {
        const stats = adminService.getStats();
        res.json(stats);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
});

export default router;
