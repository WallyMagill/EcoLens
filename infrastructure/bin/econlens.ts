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

// Create the main stack
new EconLensStack(app, 'EconLens-Learning', {
  env,
  description: 'EconLens Learning Environment - Simple AWS Infrastructure',
  tags: {
    Project: 'EconLens',
    Environment: 'learning',
    ManagedBy: 'CDK',
    Purpose: 'AWS Learning',
  },
});

app.synth();
