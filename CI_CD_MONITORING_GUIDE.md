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

