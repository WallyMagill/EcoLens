// AWS Amplify configuration for EconLens Frontend
// This file configures AWS Amplify for authentication and other AWS services

import { Amplify } from 'aws-amplify';
import { config } from './environment';

// Amplify configuration
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: config.cognitoUserPoolId,
      userPoolClientId: config.cognitoUserPoolClientId,
      region: config.awsRegion,
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
      signUpVerificationMethod: 'code' as const, // or 'link'
      userAttributes: {
        email: {
          required: true,
        },
        given_name: {
          required: true,
        },
        family_name: {
          required: true,
        },
      },
    },
  },
  API: {
    REST: {
      EconLensAPI: {
        endpoint: config.apiBaseUrl,
        region: config.awsRegion,
        custom_header: async () => {
          // Add authentication headers
          try {
            const { getCurrentUser } = await import('aws-amplify/auth');
            const user = await getCurrentUser();
            if (user) {
              const { fetchAuthSession } = await import('aws-amplify/auth');
              const session = await fetchAuthSession();
              const token = session.tokens?.idToken?.toString();
              if (token) {
                return {
                  Authorization: `Bearer ${token}`,
                };
              }
            }
          } catch (error) {
            console.warn('Failed to get auth token for API headers:', error);
          }
          return {};
        },
      },
    },
  },
  Storage: {
    S3: {
      bucket: 'econlens-assets-704444257588', // Your S3 bucket name
      region: config.awsRegion,
    },
  },
};

// Configure Amplify
export const configureAmplify = (): void => {
  try {
    Amplify.configure(amplifyConfig);
    
    if (config.environment === 'development') {
      console.log('AWS Amplify configured successfully');
      console.log('Configuration:', {
        userPoolId: config.cognitoUserPoolId,
        userPoolClientId: config.cognitoUserPoolClientId ? '***' : undefined,
        region: config.awsRegion,
        apiEndpoint: config.apiBaseUrl,
      });
    }
  } catch (error) {
    console.error('Failed to configure AWS Amplify:', error);
    throw error;
  }
};

// Export configuration for use in other parts of the app
export { amplifyConfig };
export default configureAmplify;
