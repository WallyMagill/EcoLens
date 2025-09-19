#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { EconLensStack } from '../lib/stacks/econlens-stack';

const app = new cdk.App();

// Simple configuration for learning environment
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

// Domain configuration (uncomment and set your domain when ready)
const domainName = process.env.ECONLENS_DOMAIN; // e.g., 'api.yourdomain.com'

// Create the main stack with optional SSL certificate
new EconLensStack(app, 'EconLens-Learning', {
  env,
  domainName, // This will be undefined if not set, so no SSL certificate will be created
  description: 'EconLens Learning Environment - AWS Infrastructure with ALB',
  tags: {
    Project: 'EcoLens',
    Environment: 'learning',
    ManagedBy: 'CDK',
    Purpose: 'AWS Learning with ALB',
  },
});

app.synth();
