import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import artisansRoutes from './modules/artisans/artisans.routes.js';
import serviceRequestsRoutes from './modules/serviceRequests/serviceRequests.routes.js';
import assignmentsRoutes from './modules/assignments/assignments.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import recommendationsRoutes from './modules/recommendations/recommendations.routes.js';
import favoritesRoutes from './modules/favorites/favorites.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import docsRoutes from './modules/docs/docs.routes.js';
import AppError from './common/appError.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'FasoConnect backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/artisans', artisansRoutes);
app.use('/api/service-requests', serviceRequestsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/docs', docsRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
