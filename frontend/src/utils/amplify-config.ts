import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_f9G2iTorZ',
    userPoolWebClientId: '6dv1d5mtjpem1orfjfj5r4k3fg',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH'
  }
};

// Configure Amplify
Amplify.configure(amplifyConfig);

export default amplifyConfig;
