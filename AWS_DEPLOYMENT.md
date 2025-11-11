# 🚀 TALI - AWS Production Deployment Guide

Complete guide to deploy TALI to AWS for production use.

---

## 📋 AWS Services Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                       │
│                     (Static Assets + CDN)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│   S3 Bucket    │      │   Route 53      │
│  (Frontend)    │      │   (DNS)         │
└────────────────┘      └─────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Application       │
                    │  Load Balancer     │
                    │  (ALB)             │
                    └─────────┬──────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
      ┌─────────▼────────┐      ┌─────────▼────────┐
      │  ECS Fargate     │      │  ECS Fargate     │
      │  (Backend API)   │      │  (ML Service)    │
      └─────────┬────────┘      └──────────────────┘
                │
      ┌─────────┴────────┐
      │                  │
┌─────▼──────┐    ┌─────▼────────┐
│ RDS        │    │ ElastiCache  │
│ PostgreSQL │    │ Redis        │
└────────────┘    └──────────────┘
```

---

## 💰 Estimated Monthly Costs

**Minimal Setup** (Development/Testing):
- ECS Fargate (2 tasks): ~$30-50
- RDS db.t3.micro: ~$15
- ElastiCache t3.micro: ~$12
- ALB: ~$16
- S3 + CloudFront: ~$5-10
- **Total: ~$78-103/month**

**Production Setup** (High Availability):
- ECS Fargate (4-6 tasks): ~$100-150
- RDS db.t3.small (Multi-AZ): ~$70
- ElastiCache t3.small: ~$30
- ALB: ~$16
- S3 + CloudFront: ~$20-50
- **Total: ~$236-316/month**

---

## 🔐 Prerequisites

1. **AWS Account** with billing enabled
2. **AWS CLI** installed and configured
3. **Domain name** (optional but recommended)
4. **SSL Certificate** (via AWS Certificate Manager)
5. **UAE Pass Production Credentials**
6. **Nebras API Production Key**

---

## 🛠️ Step 1: AWS CLI Setup

```bash
# Install AWS CLI
brew install awscli  # macOS
# or
pip install awscli  # Python

# Configure credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Region: me-south-1 (Bahrain) for Middle East
# - Output format: json
```

---

## 🗄️ Step 2: RDS PostgreSQL Setup

### Create RDS Instance

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name tali-db-subnet \
  --db-subnet-group-description "TALI Database Subnet Group" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier tali-production \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 15.4 \
  --master-username talimaster \
  --master-user-password "CHANGE_THIS_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp3 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --multi-az \
  --db-subnet-group-name tali-db-subnet \
  --vpc-security-group-ids sg-xxxxx \
  --publicly-accessible false \
  --tags Key=Environment,Value=production Key=Application,Value=TALI
```

### Get RDS Endpoint

```bash
aws rds describe-db-instances \
  --db-instance-identifier tali-production \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

---

## 🔴 Step 3: ElastiCache Redis Setup

```bash
# Create ElastiCache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name tali-cache-subnet \
  --cache-subnet-group-description "TALI Cache Subnet Group" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id tali-redis \
  --replication-group-description "TALI Redis Cache" \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --cache-subnet-group-name tali-cache-subnet \
  --security-group-ids sg-xxxxx \
  --tags Key=Environment,Value=production Key=Application,Value=TALI
```

---

## 🐳 Step 4: Build and Push Docker Images

### Create ECR Repositories

```bash
# Create repositories
aws ecr create-repository --repository-name tali/backend
aws ecr create-repository --repository-name tali/ml-service

# Get ECR login
aws ecr get-login-password --region me-south-1 | \
  docker login --username AWS --password-stdin \
  <AWS_ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com
```

### Build and Push Images

```bash
# Build Backend
cd backend
docker build -t tali/backend:latest .
docker tag tali/backend:latest \
  <AWS_ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/tali/backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/tali/backend:latest

# Build ML Service
cd ../ml-service
docker build -t tali/ml-service:latest .
docker tag tali/ml-service:latest \
  <AWS_ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/tali/ml-service:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/tali/ml-service:latest
```

---

## 🎯 Step 5: ECS Setup

### Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name tali-production \
  --capacity-providers FARGATE FARGATE_SPOT \
  --tags key=Environment,value=production key=Application,value=TALI
```

### Create Task Definitions

See `aws/ecs-task-definition-backend.json` and `aws/ecs-task-definition-ml.json`

```bash
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition-backend.json

aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition-ml.json
```

### Create ECS Services

```bash
# Backend service
aws ecs create-service \
  --cluster tali-production \
  --service-name tali-backend \
  --task-definition tali-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=3000

# ML service
aws ecs create-service \
  --cluster tali-production \
  --service-name tali-ml \
  --task-definition tali-ml:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=ml-service,containerPort=8000
```

---

## 🌐 Step 6: Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name tali-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --tags Key=Environment,Value=production Key=Application,Value=TALI

# Create target groups
aws elbv2 create-target-group \
  --name tali-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

## 📦 Step 7: Frontend Deployment (S3 + CloudFront)

### Build Frontend

```bash
cd frontend
npm run build
```

### Create S3 Bucket

```bash
aws s3 mb s3://tali-frontend-production

# Enable static website hosting
aws s3 website s3://tali-frontend-production \
  --index-document index.html \
  --error-document index.html

# Upload build
aws s3 sync dist/ s3://tali-frontend-production/ \
  --delete \
  --cache-control "max-age=31536000, public" \
  --exclude "index.html"

# Upload index.html with no cache
aws s3 cp dist/index.html s3://tali-frontend-production/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

### Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name tali-frontend-production.s3.amazonaws.com \
  --default-root-object index.html
```

---

## 🔐 Step 8: Secrets Manager

```bash
# Store sensitive credentials
aws secretsmanager create-secret \
  --name tali/production/database \
  --secret-string '{"username":"talimaster","password":"SECURE_PASSWORD"}'

aws secretsmanager create-secret \
  --name tali/production/jwt \
  --secret-string '{"secret":"YOUR_JWT_SECRET","refresh":"YOUR_REFRESH_SECRET"}'

aws secretsmanager create-secret \
  --name tali/production/uaepass \
  --secret-string '{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_CLIENT_SECRET"}'

aws secretsmanager create-secret \
  --name tali/production/nebras \
  --secret-string '{"apiKey":"YOUR_NEBRAS_API_KEY"}'
```

---

## 📊 Step 9: CloudWatch Monitoring

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/tali-backend
aws logs create-log-group --log-group-name /ecs/tali-ml

# Set retention
aws logs put-retention-policy \
  --log-group-name /ecs/tali-backend \
  --retention-in-days 30
```

---

## 🚀 Step 10: Deploy!

```bash
# Update ECS services to use new task definitions
aws ecs update-service \
  --cluster tali-production \
  --service tali-backend \
  --force-new-deployment

# Check deployment status
aws ecs describe-services \
  --cluster tali-production \
  --services tali-backend tali-ml
```

---

## ✅ Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify frontend loads correctly
- [ ] Check database connectivity
- [ ] Test UAE Pass authentication
- [ ] Verify subscription detection
- [ ] Test loyalty program features
- [ ] Set up CloudWatch alarms
- [ ] Configure backup schedule
- [ ] Set up auto-scaling
- [ ] Enable AWS WAF for security
- [ ] Configure CDN cache rules
- [ ] Test from multiple locations
- [ ] Load testing
- [ ] Set up monitoring dashboards
- [ ] Configure error tracking (Sentry)

---

## 📈 Monitoring & Logs

```bash
# View logs
aws logs tail /ecs/tali-backend --follow

# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name tali-production \
  --dashboard-body file://aws/cloudwatch-dashboard.json
```

---

## 💾 Backup Strategy

### Automated RDS Backups
- Daily automated backups (7-day retention)
- Weekly manual snapshots
- Cross-region replication for disaster recovery

### Database Backup Script

```bash
# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier tali-production \
  --db-snapshot-identifier tali-backup-$(date +%Y%m%d)
```

---

## 🔄 CI/CD with GitHub Actions

See `.github/workflows/deploy-production.yml` for automated deployments.

---

## 📊 Scaling Configuration

### Auto Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/tali-production/tali-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/tali-production/tali-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name tali-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## 🔒 Security Best Practices

1. **Network Security**
   - Use VPC with private subnets
   - Security groups with minimal access
   - No public IPs for backend services

2. **Data Security**
   - Encrypt at rest (RDS, S3, EBS)
   - Encrypt in transit (TLS/SSL)
   - Use AWS Secrets Manager

3. **Access Control**
   - IAM roles with least privilege
   - Multi-factor authentication
   - Regular credential rotation

4. **Monitoring**
   - CloudWatch alarms
   - VPC Flow Logs
   - AWS CloudTrail

---

## 💰 Cost Optimization

1. Use Fargate Spot for non-critical tasks
2. Enable S3 lifecycle policies
3. Use CloudFront caching effectively
4. Right-size RDS instances
5. Use Reserved Instances for predictable workloads
6. Enable auto-scaling to handle traffic spikes

---

## 🆘 Troubleshooting

### Service Won't Start
```bash
# Check ECS task logs
aws ecs describe-tasks --cluster tali-production --tasks <task-id>
aws logs tail /ecs/tali-backend --follow
```

### Database Connection Issues
```bash
# Test from ECS task
aws ecs execute-command \
  --cluster tali-production \
  --task <task-id> \
  --container backend \
  --interactive \
  --command "/bin/bash"
```

### High Latency
- Check CloudWatch metrics
- Review ALB target health
- Verify database performance
- Check Redis cache hit rate

---

**Your TALI application is now production-ready on AWS! 🎉**

For support, see the main README.md or contact the team.
