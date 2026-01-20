/**
 * Express application setup
 * 
 * Main entry point for the backend server
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Express = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/', routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
// Always start in production, or when run directly (not imported for testing)
const shouldStartServer = process.env.NODE_ENV === 'production' || require.main === module;

if (shouldStartServer) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
    });
}

export default app;
