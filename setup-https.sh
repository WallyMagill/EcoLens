#!/bin/bash

# Setup HTTPS on EC2 Backend with Nginx Reverse Proxy
# This script should be run on the EC2 instance

set -e

echo "Starting HTTPS setup for EcoLens backend..."

# Update system packages
echo "Updating system packages..."
sudo yum update -y

# Install Nginx
echo "Installing Nginx..."
sudo amazon-linux-extras install nginx1 -y

# Install OpenSSL for certificate generation
echo "Installing OpenSSL..."
sudo yum install openssl -y

# Create SSL directories
echo "Creating SSL directories..."
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private

# Generate self-signed SSL certificate
echo "Generating self-signed SSL certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/econlens.key \
    -out /etc/ssl/certs/econlens.crt \
    -subj "/C=US/ST=Virginia/L=Richmond/O=EconLens/OU=Development/CN=44.203.253.29"

# Set proper permissions on SSL files
sudo chmod 600 /etc/ssl/private/econlens.key
sudo chmod 644 /etc/ssl/certs/econlens.crt

# Backup default Nginx config
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Create Nginx configuration for EcoLens
echo "Creating Nginx configuration..."
sudo tee /etc/nginx/conf.d/econlens.conf << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name 44.203.253.29 _;
    return 301 https://$host$request_uri;
}

# HTTPS server with reverse proxy to Node.js backend
server {
    listen 443 ssl http2;
    server_name 44.203.253.29 _;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/econlens.crt;
    ssl_certificate_key /etc/ssl/private/econlens.key;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Reverse proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        access_log off;
    }
}
EOF

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Start and enable Nginx
echo "Starting and enabling Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Check if Node.js backend is running
echo "Checking Node.js backend status..."
if ! pgrep -f "node.*3001" > /dev/null; then
    echo "WARNING: Node.js backend doesn't appear to be running on port 3001"
    echo "Make sure to start your backend service"
fi

# Show service status
echo "Service status:"
sudo systemctl status nginx --no-pager

echo ""
echo "HTTPS setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your security group to allow HTTPS traffic (port 443)"
echo "2. Test the HTTPS endpoint: https://44.203.253.29/health"
echo "3. Update your frontend to use the HTTPS API endpoint"
echo ""
echo "Note: Self-signed certificate will show security warnings in browsers"
echo "For production, consider using a proper domain and Let's Encrypt certificate"
