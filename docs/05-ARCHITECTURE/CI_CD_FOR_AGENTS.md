# CI/CD System Guide for AI Agents & Developers

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Infrastructure** | cerebral-deployment repo (`k8s/ci-cd/`) |
| **Namespace** | `tekton-pipelines` |
| **Pipeline** | `cerebral-microservice-pipeline` |
| **Trigger** | Custom Rust webhook receiver |
| **Webhook URL** | https://webhook.dev.cerebral.baerautotech.com |

## How Builds Are Triggered

```
Code Push → GitHub Webhook → Webhook Receiver → PipelineRun → Build → Deploy
```

1. You commit and push to this repo
2. GitHub sends webhook to webhook receiver
3. Receiver validates HMAC-SHA256 signature
4. Extracts service name from changed files
5. Creates Tekton PipelineRun
6. Pipeline executes: git-clone → build → deploy

## Branch Mapping & Deployment Phases

### Development Phase (Now)
```
Branch: develop or feature/*
Namespace: cerebral-development
Approval: None (auto-builds)
Deployment: Immediate
Rollback: Manual
```

Modify files → Commit → Push → **Auto-builds and deploys to development**

### Testing Phase (Future)
```
Branch: staging
Namespace: cerebral-staging
Approval: Manual review required (2 reviewers)
Deployment: After approval
Rollback: One-command auto-rollback
```

### Production Phase (Future)
```
Branch: main
Namespace: cerebral-production
Approval: Multi-stage approval + tests passing
Deployment: Canary (10% → 50% → 100%)
Rollback: Automatic on health check failure
```

## Service Detection

The webhook receiver automatically detects what to build:

**Single service build**:
```
Modified: microservices/ai-services/src/main.py
→ Builds: ai-services only
```

**Multiple service build**:
```
Modified: backend-python/shared_utils.py
→ Builds: ALL 14 microservices (shared library change)
```

**No build** (docs-only):
```
Modified: README.md, docs/architecture.md
→ Builds: Nothing (docs-only change is normal)
```

## Timeline by Phase

### Development
- 30 sec: Webhook received
- 1-2 min: PipelineRun created
- 5-10 min: Build completes
- 2-3 min: Pods pull image and start
- **Total: 8-16 minutes**

### Testing (with approval)
- Same as development + 15-30 min approval wait
- **Total: 23-46 minutes**

### Production (with canary)
- Same as development + approval + canary stages
- **Total: 15-30 minutes**

## Build Status Monitoring

### Watch PipelineRuns
```bash
kubectl get pipelinerun -n tekton-pipelines -w
```

### Check specific service build
```bash
kubectl describe pipelinerun {pipelinerun-name} -n tekton-pipelines
```

### View build logs
```bash
kubectl logs -n tekton-pipelines {pod-name} -c {container}
```

## Troubleshooting

### Build didn't trigger
- Check webhook receiver pods: `kubectl get pods -n tekton-pipelines | grep webhook-receiver`
- Verify file changes in `microservices/` directory (docs-only won't trigger)
- Check PipelineRun created: `kubectl get pipelinerun -n tekton-pipelines`

### Build failed
- Check logs: `kubectl logs -n tekton-pipelines {pod-name}`
- Common issues: Dockerfile not found, build context wrong, image push failed

### Deployment didn't update
- Check service exists: `kubectl get svc -n {namespace}`
- Check image in registry: `kubectl get deployment {service-name} -n {namespace} -o jsonpath='{.spec.template.spec.containers[0].image}'`

## Branch & Commit Guidelines

### Branch Names
- `develop` - Development branch (auto-deploy)
- `staging` - Staging branch (manual approval required)
- `main` - Production branch (multi-stage approval)
- `feature/description` - Feature branches (auto-deploy to dev)
- `bugfix/description` - Bug fix branches (auto-deploy to dev)
- `hotfix/description` - Hotfix branches (deploy to production)

### Commit Messages
Use conventional commits format:
```
feat(ai-services): add version tracking endpoint
fix(backend): resolve memory leak in cache
docs: update deployment instructions
refactor(api): split monolithic controller
test(pipeline): add integration tests
chore: update dependencies
```

Format: `type(scope): message`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## Rollback Procedures

### Development
```bash
# Manual rollback
kubectl rollout undo deployment/{service-name} -n cerebral-development
```

### Testing
```bash
# Automatic rollback on health check failure (configured)
# Manual rollback
kubectl rollout undo deployment/{service-name} -n cerebral-staging
```

### Production
```bash
# Automatic rollback triggered by:
# - Health check failures (5 consecutive failures)
# - Error rate > 5%
# - Latency > 2s (p99)

# Manual rollback (if needed)
kubectl rollout undo deployment/{service-name} -n cerebral-production
```

## Testing Before Production

```bash
# 1. Commit to develop
git commit -m "feat(service): new feature"
git push origin develop

# 2. Wait for build (8-16 min)
# 3. Test in development environment
# 4. When ready, merge to staging

# 5. Test in staging (after approval)
# 6. When ready, merge to main

# 7. Deployment begins with canary rollout
# 8. Monitor metrics for 30 minutes
# 9. If healthy, completes. If not, auto-rollback
```

## Service List

The following services are automatically built:

```
ai-services
bmad-services
data-services
knowledge-services
api-gateway
integration-services
notification-services
observability-mcp
realtime-services
storage-services
security-services
testing-services
workflow-services
monitoring-services
```

## Support & Questions

For infrastructure questions, see cerebral-deployment repo:
- `CI_CD_FOR_AGENTS.md` - This document (in all repos)
- `docs/CI_CD_COMPLETE_FRAMEWORK_DEV_TO_PRODUCTION.md` - Complete framework
- `docs/COMPREHENSIVE_VALIDATION_REPORT_OCT30.md` - System status
