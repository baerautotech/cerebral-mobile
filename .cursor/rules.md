# Cerebral Mobile (React Native) - CI/CD System Rules

⚠️ **READ THIS FIRST**: `.cursor/rules.md` in cerebral-deployment repo has the DEFINITIVE CI/CD documentation.

This file is a quick reference for your repo. Full guide: `../cerebral-deployment/.cursor/rules.md`

---

## 🚀 QUICK START: Trigger a Build

```bash
# Commit and push code
git add .
git commit -m "feat: your feature"
git push origin main

# That's it! GitHub webhook triggers automatic build
```

---

## 📊 Monitor Build Status

```bash
# Check if webhook triggered build
kubectl get pipelineruns -n tekton-pipelines --sort-by=.metadata.creationTimestamp | tail -3

# Watch build logs
kubectl logs -n tekton-pipelines $(kubectl get pipelineruns -n tekton-pipelines -o jsonpath='{.items[-1].metadata.name}') -f

# Check deployment (if applicable)
kubectl rollout status deployment/cerebral-mobile -n cerebral-platform
```

---

## 🎯 Build System Overview

- **Webhook**: Custom Rust service listening on port 3000
- **Ingress**: webhook.dev.cerebral.baerautotech.com (via Traefik)
- **Pipeline**: Tekton Pipelines (git clone → kaniko build → deploy)
- **Registry**: 10.34.0.202:5000 (internal)
- **Monorepo**: apps/native (iOS/Android), apps/wearable, apps/tablet
- **Shared**: packages/core (shared code)

---

## 🔍 Troubleshooting

### "No build was triggered"
```bash
# 1. Check webhook receiver is running
kubectl get pods -n tekton-pipelines -l app=github-webhook-receiver

# 2. Check logs
kubectl logs -n tekton-pipelines -l app=github-webhook-receiver -c webhook-receiver --tail=20

# 3. Check GitHub webhook delivery (in repo Settings → Webhooks → Recent Deliveries)
```

### "Build failed"
```bash
# Check PipelineRun logs
kubectl logs -n tekton-pipelines <pipelinerun-name> -f

# Common issues:
# - Dockerfile missing (create ./Dockerfile in repo root)
# - Package dependencies (check package.json)
# - Build config (check nx.json or build config)
# - k8s manifests missing (if deploying pods)
```

---

## 📚 Full Documentation

**MUST READ** (in order):
1. `cerebral-deployment/.cursor/rules.md` (comprehensive guide)
2. `../cerebral-deployment/CI_CD_COMPLETE_GUIDE.md`
3. `../cerebral-deployment/WEBHOOK_RECEIVER_CONFIGURATION.md`

---

## 🚫 DO NOT

- ❌ Don't try to run GitHub Actions for builds
- ❌ Don't create EventListener or Broker manifests
- ❌ Don't patch ingress with kubectl patch
- ❌ Don't assume nginx is the ingress controller (it's Traefik)

---

## ✅ Key Files in This Repo

- `.github/workflows/` - Test/lint workflows (not for build)
- `Dockerfile` - Container image definition (if containerized)
- `nx.json` - Monorepo configuration
- `packages/core/` - Shared libraries
- `apps/native/` - Main mobile app
- `CI_CD_README.md` - This repo's CI/CD guide

---

## 🎯 For AI Agents

When user says "check if build completed":

```bash
#!/bin/bash
# Run these commands in order

# 1. Validate system
kubectl get pods -n tekton-pipelines -l app=github-webhook-receiver

# 2. Check recent builds
kubectl get pipelineruns -n tekton-pipelines --sort-by=.metadata.creationTimestamp | tail -1

# 3. Check if containerized deployment exists
kubectl get deployment cerebral-mobile -n cerebral-platform

# 4. Check pods (if applicable)
kubectl get pods -n cerebral-platform -l app=cerebral-mobile

# If anything looks wrong, run full troubleshooting from .cursor/rules.md
```

---

**Status**: Production Ready  
**Last Updated**: October 25, 2025
