# CI/CD Pipeline Monitoring Guide

**Status**: ✅ LIVE MONITORING ACTIVE
**Date**: October 24, 2025

---

## Quick Start

### Start Monitoring Dashboard
```bash
./scripts/monitor-ci-cd.sh
```

This shows real-time status of:
- ✅ PipelineRuns (webhook-triggered builds)
- ✅ TaskRuns (individual task execution)
- ✅ Webhook receiver pods
- ✅ Recent events

---

## What to Watch For

### ✅ Success Indicators

**PipelineRun Status**:
```
NAME                    SUCCEEDED   REASON       STARTTIME      COMPLETIONTIME
webhook-backend-...     True        Completed    5m ago         2m ago
```

**Expected Timeline**:
1. `git-clone` (30s-2m) → Clone repository ✅ NOW WORKING
2. `prepare-namespaces` (10-30s) → Create K8s namespaces
3. `build-image` (3-5m) → Kaniko builds Docker image
4. `deploy` (30-60s) → Patch deployment with new image

**Total**: 5-10 minutes from push to deployment

### ❌ Failure Indicators

**Common Failures**:

| Error | Cause | Fix |
|-------|-------|-----|
| `git clone failed` | Auth error | Check github-credentials secret |
| `Dockerfile not found` | Wrong path | Check dockerfile parameter |
| `Image push failed` | Registry auth | Check internal-registry-secret |
| `Deploy failed` | RBAC issue | Check service account permissions |

---

## Monitoring Commands

### Watch PipelineRuns in Real-Time
```bash
kubectl get pipelineruns -n tekton-pipelines \
  --sort-by=.metadata.creationTimestamp \
  -o wide \
  -w  # Watch mode
```

### Get Latest PipelineRun Logs
```bash
LATEST=$(kubectl get pipelinerun -n tekton-pipelines \
  --sort-by=.metadata.creationTimestamp -o name | tail -1)

kubectl logs $LATEST -n tekton-pipelines -f
```

### Monitor TaskRuns
```bash
kubectl get taskruns -n tekton-pipelines \
  --sort-by=.metadata.creationTimestamp \
  -o wide
```

### Check Webhook Receiver Logs
```bash
kubectl logs -n tekton-pipelines \
  -l app.kubernetes.io/name=github-webhook-receiver \
  -f \
  --tail=50
```

### See All Events
```bash
kubectl get events -n tekton-pipelines \
  --sort-by='.lastTimestamp'
```

### Describe Latest PipelineRun
```bash
LATEST=$(kubectl get pipelinerun -n tekton-pipelines \
  --sort-by=.metadata.creationTimestamp -o name | tail -1)

kubectl describe $LATEST -n tekton-pipelines
```

### Check Specific TaskRun Logs
```bash
# List taskruns
kubectl get taskruns -n tekton-pipelines

# Get logs for specific taskrun
kubectl logs <taskrun-name>-pod -n tekton-pipelines -c step-<step-name>
```

---

## Phase Breakdown

### Phase 1: Webhook Reception
```
GitHub Push → webhook.dev.cerebral.baerautotech.com →
Custom Rust Receiver → HMAC validation → PipelineRun creation
```

**Check**:
```bash
kubectl logs -n tekton-pipelines \
  -l app.kubernetes.io/name=github-webhook-receiver \
  --tail=20
```

**Expected**: HTTP 202 response, event_id logged

### Phase 2: Git Clone
```
PipelineRun starts → git-clone-task → Fetch GitHub repo with PAT
```

**Check**:
```bash
LATEST=$(kubectl get taskrun -n tekton-pipelines \
  -l tekton.dev/taskRunTemplate='' \
  --sort-by=.metadata.creationTimestamp -o name | tail -1)

kubectl logs ${LATEST}-pod -n tekton-pipelines -c step-clone
```

**Expected**: ✅ Now shows "Clone successful" with file count

### Phase 3: Build Image
```
Git workspace → Kaniko build → Docker image created →
Push to registry
```

**Check**:
```bash
LATEST=$(kubectl get taskrun -n tekton-pipelines \
  -l tekton.dev/taskName=kaniko-build-task \
  --sort-by=.metadata.creationTimestamp -o name | tail -1)

kubectl logs ${LATEST}-pod -n tekton-pipelines -c step-build
```

**Expected**: Build output showing layers being created

### Phase 4: Deploy
```
Image digest → Update deployment → Patch K8s service
```

**Check**:
```bash
kubectl get deployment <service-name> -n cerebral-platform -o wide
kubectl get pods -n cerebral-platform -l app=<service-name>
```

**Expected**: New pods running with new image SHA

---

## Prometheus Queries

If using Prometheus for long-term monitoring:

```promql
# Pipeline success rate
rate(tekton_pipelinerun_total{status="succeeded"}[5m])

# Pipeline failure rate
rate(tekton_pipelinerun_total{status="failed"}[5m])

# Average pipeline duration
avg(tekton_pipelinerun_duration_seconds_bucket)

# Task run success rate
rate(tekton_taskrun_total{status="succeeded"}[5m])

# Build task duration
histogram_quantile(0.95, rate(tekton_taskrun_duration_seconds_bucket{task="kaniko-build-task"}[5m]))
```

---

## Alerting Rules

### Critical Alerts

1. **Pipeline Failure Rate > 50%**
   - Action: Check webhook receiver logs and git credentials

2. **Build Time > 15 minutes**
   - Action: Check Kaniko logs and registry connectivity

3. **Webhook Receiver Restart Count > 3**
   - Action: Check pod logs and resource limits

4. **No PipelineRuns Created for 30 minutes**
   - Action: Verify GitHub webhooks are configured correctly

---

## Performance Baselines

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Webhook → PipelineRun | < 1s | > 5s |
| Git clone | < 2m | > 5m |
| Build image | 3-5m | > 10m |
| Deploy | 30-60s | > 2m |
| Total time | 5-10m | > 15m |
| Success rate | > 95% | < 90% |

---

## 🐳 Base Image Troubleshooting

### Symptom: Build fails with "no matching manifest for linux/amd64"

**What's happening**:
- Kaniko is trying to pull a base image from the registry
- Registry is returning ARM64-only image (built on Mac with single-arch)
- AMD64 cluster cannot run ARM64 image
- Build immediately fails

**Root Cause**:
- Base image was built with `docker build` instead of `docker buildx --platform`

**Fix**:
```bash
# Rebuild base image with multi-architecture support
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f ~/Development/cerebral/docker/Dockerfile.ai-base.cuda \
  -t 10.34.0.202:5000/cerebral/ai-base:cuda \
  --push .

# Verify both architectures in registry
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/manifests/cuda \
  -H "Accept: application/vnd.oci.image.index.v1+json" | \
  jq '.manifests[] | .platform.architecture'
# Should output: "amd64" and "arm64"

# Retry the failed PipelineRun
kubectl delete pipelinerun <failed-pipelinerun-name> -n tekton-pipelines
git push origin main  # Trigger new build
```

**Monitor**:
```bash
# Watch the retry build in real-time
kubectl get pipelineruns -n tekton-pipelines -w
```

### Symptom: Build is slow (30+ minutes)

**What's happening**:
- Build is re-downloading and compiling all dependencies
- Indicates base image might not be used or is incorrect

**Check**:
```bash
# Look at the Kaniko build log
LATEST=$(kubectl get pipelinerun -n tekton-pipelines \
  --sort-by=.metadata.creationTimestamp -o name | tail -1)

kubectl logs ${LATEST}-pod -n tekton-pipelines -c step-build | grep -i "from\|base\|cache"
```

**Expected output** (with base image):
```
FROM 10.34.0.202:5000/cerebral/ai-base:cuda
# Should use cached layers, completes in ~3 min
```

**Without base image** (wrong):
```
FROM python:3.11
# Downloads and installs all packages from scratch
# Takes 30+ minutes
```

**Fix**:
```bash
# Ensure your Dockerfile uses the base image
# Should have at line 1-3:
# ARG BASE=10.34.0.202:5000/cerebral/ai-base:cuda
# FROM ${BASE}

# If not, update Dockerfile and push
git push origin main
```

### Symptom: Services can't pull base image during development

**What's happening**:
- Running `docker pull 10.34.0.202:5000/cerebral/ai-base:cuda` on your Mac
- Getting error: "no matching manifest for linux/arm64"

**Root Cause**:
- Base image only has AMD64 (missing ARM64)
- Mac cannot use AMD64-only image

**Fix**:
```bash
# Rebuild with multi-architecture support
docker buildx build --platform linux/amd64,linux/arm64 \
  -f ~/Development/cerebral/docker/Dockerfile.ai-base.cuda \
  -t 10.34.0.202:5000/cerebral/ai-base:cuda \
  --push .

# Now try pulling on Mac
docker pull 10.34.0.202:5000/cerebral/ai-base:cuda
# Should succeed - registry returns ARM64 version for Mac
```

### Verify Base Images Are Multi-Architecture

**Quick check**:
```bash
# Check CUDA image
echo "=== CUDA Image ===" && \
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/manifests/cuda \
  -H "Accept: application/vnd.oci.image.index.v1+json" | \
  jq '.manifests[] | select(.platform.architecture != "unknown") | .platform.architecture' && \
\
# Check CPU image
echo "=== CPU Image ===" && \
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/manifests/cpu \
  -H "Accept: application/vnd.oci.image.index.v1+json" | \
  jq '.manifests[] | select(.platform.architecture != "unknown") | .platform.architecture'

# Expected output:
# === CUDA Image ===
# "amd64"
# "arm64"
# === CPU Image ===
# "amd64"
# "arm64"
```

**If you only see one architecture**:
- Base image needs to be rebuilt
- Use: `docker buildx build --platform linux/amd64,linux/arm64`
- See: `BASE_IMAGES_DOCUMENTATION.md` for full procedure

---

## Troubleshooting Checklist

- [ ] Webhook receiver pods running (2/2 replicas)
- [ ] Recent events show webhook deliveries
- [ ] PipelineRuns created with correct parameters
- [ ] Git clone task showing "Clone successful"
- [ ] Build task producing image layers
- [ ] Deploy task updating K8s resources
- [ ] New pods running with updated image

---

## Next Steps

1. **First Push**: Monitor the complete pipeline flow
2. **Multiple Services**: Test with cerebral-frontend and cerebral-mobile
3. **Failure Recovery**: Verify rollback mechanisms
4. **Performance**: Measure and optimize each stage

---

## Key Logs to Check

| Component | Log Location | Command |
|-----------|--------------|---------|
| Webhook Receiver | Pod logs | `kubectl logs -l app.kubernetes.io/name=github-webhook-receiver -f` |
| Git Clone | TaskRun pod | `kubectl logs <pr>-fetch-repository-pod -c step-clone` |
| Build | TaskRun pod | `kubectl logs <pr>-build-image-pod -c step-build` |
| Deploy | TaskRun pod | `kubectl logs <pr>-deploy-pod -c step-deploy` |
| Traefik Ingress | Pod logs | `kubectl logs -n traefik -l app.kubernetes.io/name=traefik` |

---

**Status**: ✅ MONITORING ACTIVE

All systems are ready for production builds!
