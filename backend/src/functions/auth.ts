import express, { Request, Response } from 'express';
import { logger } from '../shared/utils/logger';
import { authenticateToken } from '../shared/middleware/auth';

const router = express.Router();

// GET /api/auth/user - Get current user info from Cognito JWT (requires authentication)
router.get('/user', authenticateToken, async (req: Request, res: Response) => {
  try {
    // User information is already extracted from Cognito JWT by the middleware
    const userInfo = {
      userId: req.user!.userId, // This is the Cognito 'sub' claim
      email: req.user!.email,
      cognitoUserId: req.user!.cognitoUserId,
      username: req.user!.username,
    };

    logger.info('User data retrieved from Cognito token:', { userId: userInfo.userId });

    res.json({
      success: true,
      data: userInfo,
      message: 'User data retrieved successfully from Cognito token',
    });
  } catch (error) {
    logger.error('Error retrieving user data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve user data',
    });
  }
});

export { router as authRouter };
