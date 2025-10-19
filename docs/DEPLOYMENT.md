# Deployment Guide

## Automated Deployment (GitHub Actions)

### How It Works
1. Push code to `main` branch
2. GitHub Actions workflow triggers automatically
3. Workflow runs:
   - **Linting**: ESLint/Prettier checks (via `run-linting` action)
   - **Testing**: Jest tests with coverage (via `run-tests` action)
   - **Build**: Docker image build with Kaniko (via `build-image` action)
   - **Push**: Image pushed to container registry with SHA256 digest
4. Kubernetes deployment auto-updates with new image
5. Service available within seconds

### View Deployment Status
```bash
# List recent workflow runs
gh run list --repo baerautotech/[repo]

# Watch a specific run
gh run watch [run-id] --repo baerautotech/[repo]

# Check deployment status
kubectl get deployment [app-name] -n cerebral-platform
kubectl rollout status deployment/[app-name] -n cerebral-platform
```

## Manual Deployment (If Needed)

### Local Build & Test
```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm run test

# Build locally
npm run build
```

### Versioning (Semantic Release)

Commits automatically trigger version bumps:
- `feat: ...` → Minor version (e.g., 1.0.0 → 1.1.0)
- `fix: ...` → Patch version (e.g., 1.0.0 → 1.0.1)
- `BREAKING CHANGE: ...` → Major version (e.g., 1.0.0 → 2.0.0)

### Docker Build (Manual)
```bash
# Build Docker image locally
docker build -t [repo]:[version] .

# Tag for registry
docker tag [repo]:[version] registry.dev.cerebral.baerautotech.com/[repo]:[version]

# Push to registry
docker push registry.dev.cerebral.baerautotech.com/[repo]:[version]
```

### Deploy to Kubernetes
```bash
# Update deployment image
kubectl set image deployment/[app-name] \
  [app-name]=registry.dev.cerebral.baerautotech.com/[repo]:[version] \
  -n cerebral-platform

# Verify rollout
kubectl rollout status deployment/[app-name] -n cerebral-platform
```

## Rollback Procedures

### If Deployment Fails
```bash
# Check pod status
kubectl get pods -n cerebral-platform -l app=[app-name]

# View logs
kubectl logs -n cerebral-platform -l app=[app-name] -c [container]

# Rollback to previous version
kubectl rollout undo deployment/[app-name] -n cerebral-platform

# Verify rollback
kubectl rollout status deployment/[app-name] -n cerebral-platform
```

### Manual Rollback
```bash
# Get deployment history
kubectl rollout history deployment/[app-name] -n cerebral-platform

# Rollback to specific revision
kubectl rollout undo deployment/[app-name] --to-revision=2 -n cerebral-platform
```

## Troubleshooting

### Build Fails
1. Check GitHub Actions logs: `gh run view [run-id]`
2. Run linting locally: `npm run lint`
3. Run tests locally: `npm run test`
4. Check for secrets: Ensure all required environment variables are set

### Tests Fail
1. Run tests locally: `npm run test`
2. Check coverage: `npm run test:coverage`
3. Review test output for specific failures
4. Fix issues and push to trigger workflow again

### Deployment Fails
1. Check Kubernetes events: `kubectl describe pod [pod-name] -n cerebral-platform`
2. View pod logs: `kubectl logs [pod-name] -n cerebral-platform`
3. Verify image exists: `docker pull registry.dev.cerebral.baerautotech.com/[repo]:[version]`
4. Check resource availability: `kubectl top nodes`

## Environment Variables

### Required for Deployment
- `REGISTRY_URL` - Container registry URL
- `KUBE_CONFIG` - Kubernetes cluster config
- `GITHUB_TOKEN` - GitHub access token

### Optional
- `LOG_LEVEL` - Logging verbosity
- `DEBUG` - Debug mode flag

See `.env.example` for complete list.
