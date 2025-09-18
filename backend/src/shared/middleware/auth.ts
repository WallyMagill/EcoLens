import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { logger } from '../utils/logger';

// Extend Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        cognitoUserId: string;
        username?: string;
      };
    }
  }
}

// We'll use the actual types from aws-jwt-verify
import type { CognitoAccessTokenPayload, CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

// Union type for either access or ID token payload
type CognitoJWTPayload = CognitoAccessTokenPayload | CognitoIdTokenPayload;

// Create Cognito JWT verifier
const cognitoJwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID || 'us-east-1_f9G2iTorZ',
  tokenUse: 'access', // or 'id' for ID tokens
  clientId: process.env.COGNITO_USER_POOL_CLIENT_ID || '6dv1d5mtjpem1orfjfj5r4k3fg',
});

// Alternative verifier for ID tokens (contains more user info)
const cognitoIdTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID || 'us-east-1_f9G2iTorZ',
  tokenUse: 'id',
  clientId: process.env.COGNITO_USER_POOL_CLIENT_ID || '6dv1d5mtjpem1orfjfj5r4k3fg',
});

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
    }

    try {
      // Try to verify as access token first, then as ID token
      let payload: CognitoJWTPayload;
      
      try {
        payload = await cognitoJwtVerifier.verify(token);
      } catch (accessTokenError) {
        // If access token verification fails, try ID token
        payload = await cognitoIdTokenVerifier.verify(token);
      }
      
      // Extract user information from the Cognito JWT payload
      const email = ('email' in payload) ? String(payload.email || '') : '';
      const username = ('cognito:username' in payload) ? String(payload['cognito:username'] || '') : undefined;
      
      req.user = {
        userId: payload.sub, // Use Cognito 'sub' as userId for database operations
        email: email,
        cognitoUserId: payload.sub,
        username: username,
      };

      logger.info('User authenticated via Cognito:', { 
        userId: req.user.userId, 
        email: req.user.email,
        username: req.user.username 
      });
      
      next();
    } catch (jwtError) {
      logger.error('Cognito JWT verification failed:', jwtError);
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        message: 'Token verification failed',
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Authentication failed',
    });
  }
};

// Optional middleware for routes that can work with or without authentication
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    return next();
  }

  // If token is provided, validate it
  return authenticateToken(req, res, next);
};
