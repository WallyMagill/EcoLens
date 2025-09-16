# EconLens VS Code/Cursor Workspace Configuration

This document explains the comprehensive VS Code/Cursor workspace configuration for the EconLens monorepo project.

## Overview

The workspace is configured to support the complete EconLens development stack:
- **Frontend**: React 18+ with TypeScript
- **Backend**: AWS Lambda functions with Node.js 20
- **Infrastructure**: AWS CDK with TypeScript
- **AI Integration**: AWS Bedrock support
- **Monorepo**: Multi-package workspace management

## Workspace Structure

```
EcoLens/
├── .vscode/                    # VS Code/Cursor configuration
│   ├── extensions.json         # Recommended extensions
│   ├── settings.json          # Workspace settings
│   ├── launch.json            # Debug configurations
│   ├── tasks.json             # Build and deployment tasks
│   ├── keybindings.json       # Custom keybindings
│   └── snippets/              # Code snippets
│       ├── typescript.json    # TypeScript snippets
│       └── json.json          # JSON snippets
├── .vscode/workspace.code-workspace  # Multi-root workspace
├── .prettierrc                # Code formatting
├── .eslintrc.js               # Linting rules
├── tsconfig.json              # TypeScript configuration
└── README-Workspace-Setup.md  # This file
```

## Essential Extensions

### AWS Development & CDK
- **AWS Toolkit**: Complete AWS development experience
- **CloudFormation**: Infrastructure as code support
- **JSON**: Enhanced JSON editing

### TypeScript & React Development
- **TypeScript**: Latest TypeScript support
- **Prettier**: Code formatting
- **ESLint**: Code linting and quality
- **Tailwind CSS**: CSS framework support
- **Path Intellisense**: Import path autocomplete

### Monorepo & Workspace Management
- **Multi-root Workspaces**: Support for complex project structures
- **NPM Scripts**: Package.json script integration
- **Workspace Trust**: Security for multi-root workspaces

### AI & Development Tools
- **GitHub Copilot**: AI code completion
- **GitHub Copilot Chat**: AI coding assistant
- **Docker**: Container development support
- **Thunder Client**: API testing

## Key Features

### 1. TypeScript Path Mapping
The workspace includes comprehensive path mapping for the monorepo structure:

```typescript
// Frontend imports
import { Component } from '@/components/Component';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';

// Backend imports  
import { handler } from '@/functions/auth/login';
import { database } from '@/shared/database';

// Infrastructure imports
import { ApiStack } from '@/stacks/ApiStack';
import { DatabaseConstruct } from '@/constructs/Database';
```

### 2. AWS Integration
- **Profile**: Automatically uses `econlens-admin` profile
- **Region**: Defaults to `us-east-1`
- **Toolkit**: Full AWS service integration
- **CDK**: Complete CDK development support

### 3. Development Workflow
- **Tasks**: Pre-configured build, test, and deployment tasks
- **Debugging**: Lambda function and React app debugging
- **Keybindings**: Quick access to common operations
- **Snippets**: EconLens-specific code templates

### 4. Code Quality
- **ESLint**: Comprehensive linting rules for all project types
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **File Nesting**: Organized file explorer

## Usage Instructions

### 1. Opening the Workspace
```bash
# Open the multi-root workspace
code .vscode/workspace.code-workspace

# Or open the project root (will use .vscode settings)
code .
```

### 2. Installing Extensions
The workspace will prompt you to install recommended extensions when opened. Click "Install All" to set up the complete development environment.

### 3. AWS Configuration
Ensure your AWS CLI is configured with the `econlens-admin` profile:
```bash
aws configure --profile econlens-admin
```

### 4. Development Tasks
Use the Command Palette (`Cmd+Shift+P`) and search for "Tasks: Run Task" to access:
- Install All Dependencies
- Start Frontend Dev Server
- Deploy to Dev Environment
- Run All Tests
- Lint All Code

### 5. Debugging
- **Frontend**: Use "Debug Frontend (React)" configuration
- **Lambda**: Use "Debug Lambda Function (Local)" configuration
- **CDK**: Use "Debug CDK Deploy" configuration

## Code Snippets

### TypeScript Snippets
- `portfolio-interface`: Complete Portfolio interface
- `portfolio-asset-interface`: PortfolioAsset interface
- `asset-type-enum`: AssetType enum
- `lambda-handler`: Lambda function template
- `react-component`: React component template
- `custom-hook`: Custom hook template
- `cdk-construct`: CDK construct template

### JSON Snippets
- `package-scripts`: Monorepo package.json scripts
- `cdk-config`: CDK configuration

## Custom Keybindings

- `Cmd+Shift+D`: Deploy to Dev Environment
- `Cmd+Shift+P`: Deploy to Production
- `Cmd+Shift+T`: Run All Tests
- `Cmd+Shift+L`: Lint All Code
- `Cmd+Shift+B`: Build Frontend
- `Cmd+Shift+S`: Start Frontend Dev Server
- `Cmd+Shift+R`: List AWS Stacks
- `Cmd+Shift+U`: Start Local Database
- `Cmd+Shift+O`: Stop Local Database

## AI Tools Integration

The workspace is optimized for the AI tools workflow described in the AI Tools Optimization Guide:

### Claude Integration
- Use for architecture decisions and complex problem solving
- Upload files for comprehensive code review
- Reference EconLens documentation in prompts

### Cursor Integration
- Leverage AI code generation for new features
- Use context-aware development with the monorepo structure
- Implement complex integrations with AI assistance

### GitHub Copilot
- Auto-completion for TypeScript interfaces
- Pattern recognition across the codebase
- Test generation and utility functions

### Warp Integration
- AWS CLI operations with AI assistance
- Environment setup and troubleshooting
- Deployment automation

## Troubleshooting

### Common Issues

1. **TypeScript Path Resolution**
   - Ensure all tsconfig.json files are properly configured
   - Check that path mappings match your actual folder structure

2. **AWS Profile Issues**
   - Verify `econlens-admin` profile is configured
   - Check AWS credentials and permissions

3. **Extension Conflicts**
   - Disable conflicting extensions
   - Use the recommended extension list

4. **Debugging Issues**
   - Ensure all dependencies are installed
   - Check environment variables and configuration

### Getting Help

1. Check the EconLens documentation in the `docs/` folder
2. Review the AI Tools Optimization Guide
3. Use Claude for complex architectural questions
4. Use Cursor for implementation assistance

## Best Practices

1. **Keep Extensions Updated**: Regularly update recommended extensions
2. **Use Workspace Settings**: Leverage workspace-specific configurations
3. **Follow AI Workflow**: Use the right AI tool for each task
4. **Maintain Code Quality**: Use ESLint and Prettier consistently
5. **Test Regularly**: Use the integrated testing configurations

## Next Steps

1. Open the workspace in VS Code/Cursor
2. Install recommended extensions
3. Configure AWS credentials
4. Run the "Install All Dependencies" task
5. Start developing with the "Start Frontend Dev Server" task

This workspace configuration provides a complete development environment for building EconLens with maximum efficiency and AI tool integration.
