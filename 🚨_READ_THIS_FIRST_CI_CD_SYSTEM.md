# 🚨 **READ THIS FIRST - CI/CD SYSTEM ARCHITECTURE** 🚨

**Last Updated**: October 25, 2025  
**Status**: PRODUCTION  
**Authority**: This is THE DEFINITIVE SOURCE for CI/CD at Cerebral Platform

---

## ⚠️ **DO NOT SKIP THIS** ⚠️

Agents have been confused about the CI/CD system. This document ends that confusion FOREVER.

---

## 🎯 THE ACTUAL SYSTEM (October 2025)

```
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Push (any repository: cerebral, cerebral-frontend, etc) │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Push to main
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Webhook                                                 │
│  Sends POST to: https://webhook.dev.cerebral.baerautotech.com/ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS/443
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Firewall (Meraki n132)                                         │
│  Public IP: 67.221.99.140                                       │
│  NAT Rule: 443 → 10.34.0.246:443 (Traefik LoadBalancer)        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Internal cluster
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Traefik IngressRoute (github-webhook-traefik)                  │
│  entryPoints: [websecure] (HTTPS/443)                           │
│  Host: webhook.dev.cerebral.baerautotech.com                    │
│  Routes to: github-webhook-receiver service:3000               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Port 3000
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  RUST WEBHOOK RECEIVER (Custom Implementation)                  │
│  Pod: github-webhook-receiver (2/2 replicas running)           │
│  Namespace: tekton-pipelines                                    │
│  Port: 3000 (internal ClusterIP service)                       │
│                                                                  │
│  Function:                                                       │
│  1. Validates HMAC-SHA256 signature (GitHub secret)            │
│  2. Extracts Git payload                                        │
│  3. Identifies modified files (microservices/*/...)            │
│  4. Extracts service name from path                            │
│  5. Creates Tekton PipelineRun with correct parameters        │
│  6. Returns 200 OK to GitHub                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ kubectl create PipelineRun
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tekton Pipeline (cerebral-microservice-pipeline)              │
│  Namespace: tekton-pipelines                                    │
│                                                                  │
│  Tasks:                                                          │
│  1. git-clone-task       - Clone repo to workspace             │
│  2. kaniko-build-task    - Build image with Kaniko             │
│  3. deploy-task          - Update Kubernetes deployment        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Kaniko builds image
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Kaniko Build (build-system namespace)                          │
│  Builds Docker image from Dockerfile                            │
│  Pushes to internal registry:                                   │
│  internal-registry.registry.svc.cluster.local:5000/cerebral/... │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Image pushed
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Deployment Updated (deploy-task)                               │
│  kubectl set image deployment/<service>                         │
│  Namespace: cerebral-platform                                   │
│                                                                  │
│  Result: Pod restarts with new image                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 KEY COMPONENTS (Must Know)

### 0. **GitHub Webhook Configuration** ⚠️ CRITICAL
- **Level**: **ORGANIZATION-LEVEL** (NOT repo-level)
- **Organization**: `baerautotech`
- **Endpoint**: `https://webhook.dev.cerebral.baerautotech.com/`
- **Applies To**: ALL repositories in the organization (cerebral, cerebral-frontend, cerebral-mobile, cerebral-deployment, etc.)
- **Secret**: Stored in Kubernetes secret `github-webhook-secret` in `tekton-pipelines` namespace
- **⚠️ CRITICAL**: Do NOT create repo-level webhooks - they conflict with org-level configuration
- **Events**: `push` and `pull_request` (but only `push` to `main` triggers builds)

### 1. **GitHub Webhook Endpoint**
- **URL**: `https://webhook.dev.cerebral.baerautotech.com/`
- **Protocol**: HTTPS (TLS required)
- **Port**: 443
- **Configured In**: All 4 repos (cerebral, cerebral-deployment, cerebral-frontend, cerebral-mobile)
- **Secret**: Stored in GitHub org settings, validated by Rust receiver

### 2. **Rust Webhook Receiver** (Custom Component)
- **Image**: `10.34.0.202:5000/webhook-receiver:latest`
- **Pod**: `github-webhook-receiver` (2/2 replicas)
- **Namespace**: `tekton-pipelines`
- **Port**: 3000 (HTTP internally, HTTPS via Traefik)
- **Function**: Validate HMAC, extract service, create PipelineRun
- **Status**: ✅ RUNNING (verified Oct 25, 2025)

### 3. **Traefik IngressRoute** (github-webhook-traefik)
- **Hostname**: `webhook.dev.cerebral.baerautotech.com`
- **EntryPoint**: `websecure` (HTTPS/443)
- **Backend**: `github-webhook-receiver` service on port 3000
- **TLS**: dev-wildcard-tls certificate
- **Status**: ✅ WORKING (verified Oct 25, 2025)

### 4. **Tekton Pipeline**
- **Name**: `cerebral-microservice-pipeline`
- **Namespace**: `tekton-pipelines`
- **Tasks**: git-clone → kaniko-build → deploy
- **Parameters**: repo-url, repo-branch, image-name, service-name
- **Status**: ✅ DEPLOYED

### 5. **Kaniko Build Execution**
- **Namespace**: `build-system`
- **Registry**: `internal-registry.registry.svc.cluster.local:5000`
- **Image Tag Format**: `cerebral/<service>:<commit-hash>`
- **Status**: ✅ CONFIGURED

---

## ❌ WHAT IS NOT THE SYSTEM

### ❌ NO GitHub Actions Runners
- **NOT IN USE**: `actions-runner-system` namespace
- **Reason**: We use Rust webhook receiver + Tekton instead
- **What to do**: Delete if still exists, not needed

### ❌ NO GitHub Actions Workflows
- **NOT IN USE**: `.github/workflows/build-*.yml` patterns
- **Reason**: Tekton PipelineRuns handle builds automatically
- **What to do**: Do NOT create build workflows in application repos

### ❌ NO EventListener (Tekton)
- **NOT IN USE**: Tekton EventListener component
- **Reason**: Rust receiver replaces it (better for custom logic)
- **What to do**: Not needed, can be deleted

### ❌ NO Manual Kaniko Jobs
- **NOT IN USE**: Manual `kubectl create job` for Kaniko
- **Reason**: Tekton pipeline handles this automatically
- **What to do**: Never run Kaniko jobs manually

### ❌ NO ArgoCD or GitOps
- **NOT IN USE**: ArgoCD for deployment management
- **Reason**: Tekton deploy-task updates Kubernetes directly
- **What to do**: Do NOT add deployment syncs to ArgoCD

---

## ✅ HOW THE FLOW WORKS (Step by Step)

### **Example**: Pushing to `microservices/api-gateway/`

**Step 1: Developer Pushes Code**
```bash
cd /Users/bbaer/Development/cerebral
git add microservices/api-gateway/main.py
git commit -m "feat: new feature"
git push origin main
```

**Step 2: GitHub Sends Webhook**
```
POST https://webhook.dev.cerebral.baerautotech.com/
Headers:
  X-Hub-Signature-256: sha256=<HMAC-SHA256>
  Content-Type: application/json
Body:
  {
    "head_commit": {
      "modified": [
        "microservices/api-gateway/main.py",
        "microservices/api-gateway/Dockerfile"
      ]
    }
  }
```

**Step 3: Rust Receiver Processes Webhook**
1. Receives POST on port 3000
2. Validates HMAC using GitHub secret
3. Parses JSON payload
4. Finds modified files starting with `microservices/`
5. Extracts service name: `api-gateway`
6. Creates Tekton PipelineRun:
   ```yaml
   apiVersion: tekton.dev/v1
   kind: PipelineRun
   metadata:
     name: webhook-api-gateway-<timestamp>
     namespace: tekton-pipelines
   spec:
     pipelineRef:
       name: cerebral-microservice-pipeline
     params:
     - name: repo-url
       value: https://github.com/baerautotech/cerebral.git
     - name: image-name
       value: cerebral/api-gateway
     - name: service-name
       value: api-gateway
   ```
7. Returns 200 OK to GitHub

**Step 4: Tekton Pipeline Executes**
1. `git-clone-task`: Clones cerebral repo to workspace
2. `kaniko-build-task`: Builds `microservices/api-gateway/Dockerfile`
3. Pushes image to: `internal-registry.registry.svc.cluster.local:5000/cerebral/api-gateway:abc123`
4. `deploy-task`: Updates deployment
   ```bash
   kubectl set image deployment/api-gateway \
     app=internal-registry.registry.svc.cluster.local:5000/cerebral/api-gateway:abc123 \
     -n cerebral-platform
   ```

**Step 5: Pod Restarts**
- Kubernetes pulls new image
- Pod rolling update begins
- New pod starts with new code
- Old pod terminates

**Result**: ✅ **Deployment complete, end-to-end**

---

## 🔧 TROUBLESHOOTING CHECKLIST

### When: "Why didn't my code deploy?"

**Check 1: Did webhook fire?**
```bash
# Check if Rust receiver received the webhook
kubectl logs -n tekton-pipelines -l app=github-webhook-receiver --tail=50
# Look for: "Webhook received", "HMAC validated", "PipelineRun created"
```

**Check 2: Did PipelineRun get created?**
```bash
# List recent PipelineRuns
kubectl get pipelineruns -n tekton-pipelines --sort-by='.metadata.creationTimestamp' | tail -10
# Check for status: "Succeeded" or "Failed" or "Running"
```

**Check 3: What's the build error?**
```bash
# Get detailed PipelineRun status
kubectl describe pipelinerun <name> -n tekton-pipelines
# Look for: status conditions, task failures
```

**Check 4: Did Kaniko push the image?**
```bash
# Check registry for image
kubectl port-forward -n registry svc/internal-registry 5000:5000
curl http://localhost:5000/v2/<service>/tags/list
```

**Check 5: Did deployment update?**
```bash
# Check deployment image
kubectl describe deployment <service> -n cerebral-platform | grep Image:
# Should show the new image digest
```

**Check 6: Is pod running?**
```bash
# Check pod status
kubectl get pods -n cerebral-platform -l app=<service>
# Should show: 1/1 Running, Ready True
```

---

## 📋 CONFIGURATION VERIFICATION

**Run this to verify system is working**:

```bash
#!/bin/bash

echo "=== Rust Webhook Receiver ==="
kubectl get pods -n tekton-pipelines -l app=github-webhook-receiver

echo "=== Traefik IngressRoute ==="
kubectl get ingressroute -n tekton-pipelines | grep webhook

echo "=== Tekton Pipeline ==="
kubectl get pipeline cerebral-microservice-pipeline -n tekton-pipelines

echo "=== Recent PipelineRuns ==="
kubectl get pipelineruns -n tekton-pipelines --sort-by='.metadata.creationTimestamp' | tail -5

echo "=== Registry Service ==="
kubectl get svc -n registry | grep internal-registry

echo "=== Build Jobs ==="
kubectl get jobs -n build-system | tail -5

echo "=== Deployments ==="
kubectl get deployment -n cerebral-platform | grep -E "api-gateway|bmad|data|integration"
```

---

## 📚 RELATED DOCUMENTATION

**Must Read**:
1. This file (you are here)
2. `WEBHOOK_RECEIVER_CONFIGURATION.md` - Webhook receiver setup
3. `TRAEFIK_MIGRATION_COMPLETE_VERIFICATION.md` - Traefik routing
4. `CI_CD_COMPLETE_GUIDE.md` - Step-by-step guide

**Reference**:
- `FIREWALL_TRAEFIK_MAPPING.md` - Firewall rules
- `ENTERPRISE_BUILD_SYSTEM_REDESIGN.md` - Architecture details
- `BUILD_FRAMEWORK_UNIFIED.md` - Base image configuration

---

## ⚡ QUICK COMMANDS

```bash
# Check if webhook endpoint is reachable
curl -I https://webhook.dev.cerebral.baerautotech.com/

# Check Rust receiver logs
kubectl logs -n tekton-pipelines -l app=github-webhook-receiver -f

# Watch PipelineRuns as they execute
kubectl get pipelineruns -n tekton-pipelines -w

# View PipelineRun details
kubectl describe pipelinerun <name> -n tekton-pipelines

# Check TaskRun logs
kubectl logs -n tekton-pipelines <pipelinerun-name>

# Force trigger a build (manual)
kubectl create -f k8s/jobs/manual-pipelinerun-trigger.yaml

# Check deployment image
kubectl describe deployment <service> -n cerebral-platform | grep -A5 Containers
```

---

## 🎓 KEY LEARNINGS

1. **NO GitHub Actions runners** - We use Tekton + Kaniko
2. **NO GitHub Actions workflows** - Rust receiver + Tekton handle everything
3. **Webhook → Rust → PipelineRun** - This is the actual flow
4. **Traefik routes webhooks** - Firewall sends HTTPS to LoadBalancer
5. **Kaniko builds inside cluster** - Uses internal registry DNS
6. **Deployments auto-update** - deploy-task runs kubectl set image

---

## 🚨 FOR FUTURE AGENTS

**Before making changes to CI/CD**:
1. Read this file FIRST
2. Read `WEBHOOK_RECEIVER_CONFIGURATION.md` SECOND
3. Read ONE line of code to verify
4. ASK before creating workflows, runners, or EventListeners

**If you think GitHub Actions is the system**: ❌ WRONG - Read this file again

**If you think EventListener is used**: ❌ WRONG - Rust receiver replaces it

**If you think manual Kaniko is needed**: ❌ WRONG - Tekton pipeline does it

**If you're unsure**: Read this file, then ask questions

---

**Last Verified**: October 25, 2025, 13:20 UTC
**Status**: ✅ PRODUCTION READY
**Next Review**: After next microservice deployment

