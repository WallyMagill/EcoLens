import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class EconLensStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly database: rds.DatabaseInstance;
  public readonly userPool: cognito.UserPool;
  public readonly assetsBucket: s3.Bucket;
  public readonly ec2Instance: ec2.Instance;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Simple VPC with two public subnets (required for RDS)
    this.vpc = new ec2.Vpc(this, 'EconLensVPC', {
      cidr: '10.0.0.0/16',
      maxAzs: 2, // Two AZs required for RDS
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
      natGateways: 0, // No NAT Gateway to save costs
    });

    // Security group for EC2 instance (web server)
    const webSecurityGroup = new ec2.SecurityGroup(this, 'WebSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for EC2 web server',
      allowAllOutbound: true,
    });

    // Allow HTTP, HTTPS, SSH, and API access
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic'
    );
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access'
    );
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3001),
      'Allow API access on port 3001'
    );

    // Security group for RDS database
    const dbSecurityGroup = new ec2.SecurityGroup(
      this,
      'DatabaseSecurityGroup',
      {
        vpc: this.vpc,
        description: 'Security group for RDS database',
      }
    );

    // Allow PostgreSQL access from EC2 instance
    dbSecurityGroup.addIngressRule(
      webSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from EC2'
    );

    // IAM role for EC2 instance
    const ec2Role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSSMManagedInstanceCore'
        ),
      ],
    });

    // Grant S3 access to EC2 instance
    this.assetsBucket = new s3.Bucket(this, 'EconLensAssets', {
      bucketName: `econlens-assets-${this.account}`,
      versioned: false, // Disable versioning to save costs
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Allow deletion for learning
    });

    this.assetsBucket.grantReadWrite(ec2Role);

    // Create EC2 instance
    this.ec2Instance = new ec2.Instance(this, 'EconLensWebServer', {
      vpc: this.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: webSecurityGroup,
      role: ec2Role,
      keyName: 'econlens-keypair', // You'll need to create this key pair manually
      userData: ec2.UserData.forLinux(),
    });

    // Add user data script to install Node.js and setup the application
    // Amazon Linux 2023 uses dnf package manager and includes Node.js 18 by default
    this.ec2Instance.addUserData(
      'dnf update -y',
      'dnf install -y nodejs npm git',
      'npm install -g pm2',
      'mkdir -p /home/ec2-user/econlens',
      'chown ec2-user:ec2-user /home/ec2-user/econlens'
    );

    // RDS PostgreSQL database (db.t3.micro for free tier)
    this.database = new rds.DatabaseInstance(this, 'EconLensDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC, // Public subnet for simplicity
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'econlens',
      credentials: rds.Credentials.fromGeneratedSecret('econlens_admin'),
      backupRetention: cdk.Duration.days(1), // Minimal backup retention
      deletionProtection: false, // Allow deletion for learning
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Allow deletion for learning
      publiclyAccessible: true, // Public access for simplicity (not recommended for production)
    });

    // Cognito User Pool for authentication (simplified)
    this.userPool = new cognito.UserPool(this, 'EconLensUserPool', {
      userPoolName: 'econlens-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false, // Simplified password policy
      },
    });

    // User Pool Client
    const userPoolClient = new cognito.UserPoolClient(
      this,
      'EconLensUserPoolClient',
      {
        userPool: this.userPool,
        generateSecret: false,
        authFlows: {
          userPassword: true,
          userSrp: true,
        },
      }
    );

    // Outputs
    new cdk.CfnOutput(this, 'EC2PublicIP', {
      value: this.ec2Instance.instancePublicIp,
      description: 'EC2 Instance Public IP Address',
    });

    new cdk.CfnOutput(this, 'EC2InstanceId', {
      value: this.ec2Instance.instanceId,
      description: 'EC2 Instance ID',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'RDS Database Endpoint',
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.database.instanceEndpoint.port.toString(),
      description: 'RDS Database Port',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
      description: 'S3 Assets Bucket Name',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.database.secret?.secretArn || 'No secret generated',
      description: 'RDS Database Secret ARN',
    });
  }
}
