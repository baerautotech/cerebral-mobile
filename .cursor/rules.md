# Cerebral Platform - CI/CD System Rules (COMPREHENSIVE)

## 🚨 CRITICAL: This is the DEFINITIVE CI/CD documentation for all 4 repositories

**Required Reading**: `CI_CD_COMPLETE_GUIDE.md` in each repo  
**This file**: Quick reference for AI agents and developers

---

## 🏗️ SYSTEM ARCHITECTURE (MUST UNDERSTAND)

### The Stack
```
GitHub Code Push
    ↓
CNAME → webhook.dev.cerebral.baerautotech.com
    ↓
Firewall: 67.221.99.140:443 → 10.34.0.246:443 (Traefik)
    ↓
Traefik IngressRoute (websecure entry point)
    ↓
Service: github-webhook-receiver:3000 (Rust service)
    ↓
Validates webhook signature (HMAC-SHA256)
    ↓
Extracts service name from modified files
    ↓
Creates Tekton PipelineRun in tekton-pipelines namespace
    ↓
Tekton Pipeline executes:
  1. git-clone-task (clone from GitHub)
  2. kaniko-build-task (build Docker image in-cluster)
  3. deploy-task (apply K8s manifests to cerebral-platform)
    ↓
Deployment rolls out new pods
```

### NOT IN THIS SYSTEM
- ❌ Knative EventListener (REMOVED Oct 24)
- ❌ Knative Broker (REMOVED Oct 24)
- ❌ ArgoCD (not used)
- ❌ Flux (not used)
- ❌ GitHub Actions for builds (not used for CI/CD)
- ❌ nginx ingress (REPLACED with Traefik Oct 24)

### COMPONENTS THAT EXIST
- ✅ Custom Rust webhook receiver (listen on port 3000)
- ✅ Tekton Pipelines (build orchestration)
- ✅ Kaniko (container build in Kubernetes)
- ✅ Traefik (ingress controller, TLS termination)
- ✅ cert-manager (certificate management)
- ✅ Internal Docker registry (10.34.0.202:5000)

---

## 🐳 BASE IMAGES (AI/ML Foundation)

### What You Need to Know

**Base Images**: Pre-built Docker images with ML/AI dependencies. Reduces build time from 30min → 3min.

| Image | Purpose | Size | Location |
|---|---|---|---|
| `cerebral/ai-base:cuda` | GPU services | ~7.5GB | `10.34.0.202:5000/cerebral/ai-base:cuda` |
| `cerebral/ai-base:cpu` | CPU services | ~2.8GB | `10.34.0.202:5000/cerebral/ai-base:cpu` |

### Where Are They?

**Registry**: `10.34.0.202:5000` (internal Kubernetes registry)

**Verify they exist:**
```bash
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list
# {"name":"cerebral/ai-base","tags":["cuda","cpu"]}
```

**Source in Git**: `~/Development/cerebral/docker/`
- `Dockerfile.ai-base.cuda` - GPU version
- `Dockerfile.ai-base.cpu` - CPU version
- `requirements-unified.txt` - All ML/AI dependencies

### ⚠️ CRITICAL: Multi-Architecture (Mac → AMD64 Cluster)

**Cluster = AMD64 (x86_64). Mac = ARM64 (Apple Silicon). MUST USE BOTH!**

✅ **Current Status**: Both base images are multi-architecture
```bash
cerebral/ai-base:cuda
  ├─ amd64 (linux/amd64) → Kubernetes cluster ✅
  └─ arm64 (linux/arm64) → Mac development ✅

cerebral/ai-base:cpu
  ├─ amd64 (linux/amd64) → Kubernetes cluster ✅
  └─ arm64 (linux/arm64) → Mac development ✅
```

**If rebuilding, MUST use multi-platform build:**
```bash
# ✅ CORRECT - Both architectures
docker buildx build --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile.ai-base.cuda \
  -t 10.34.0.202:5000/cerebral/ai-base:cuda --push .

# ❌ WRONG - Mac only (will break cluster)
docker build -f docker/Dockerfile.ai-base.cuda \
  -t 10.34.0.202:5000/cerebral/ai-base:cuda .
```

**Why?** 
- Mac builds ARM64-only images by default
- Kubernetes cluster (AMD64) cannot run ARM64 images
- Kaniko fails: "no matching manifest for linux/amd64"
- ALL BUILDS BLOCKED 🔴

**See**: `BASE_IMAGES_DOCUMENTATION.md` → "Multi-Platform Architecture Support"

### How Microservices Use Them

Every microservice Dockerfile starts with a base image:

```dockerfile
ARG BASE=10.34.0.202:5000/cerebral/ai-base:cuda
FROM ${BASE}

COPY . /app
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

Kaniko automatically pulls the base → adds code → builds → done!

### When to Update Base Images

✅ **DO update** when:
- Adding shared dependencies (needed by 2+ services)
- Security patches
- Python/CUDA version upgrades

❌ **DON'T update** for:
- Single-service dependencies (add to service's `requirements.txt`)
- Experimental packages

### How to Update (7-Step Process - Multi-Architecture)

**1. Edit shared dependencies:**
```bash
vim ~/Development/cerebral/docker/requirements-unified.txt
```

**2. Test locally:**
```bash
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cuda -t test-cuda .
docker run --rm test-cuda python -c "import torch; print(torch.__version__)"
```

**3. Update Dockerfile (if build deps needed):**
```bash
# Add to RUN apt-get install:
# gcc, g++, python3-dev (for C extensions)
vim ~/Development/cerebral/docker/Dockerfile.ai-base.cuda
vim ~/Development/cerebral/docker/Dockerfile.ai-base.cpu
```

**4. Build both images (MULTI-ARCHITECTURE - CRITICAL!):**
```bash
# Build for BOTH amd64 (cluster) and arm64 (Mac)
docker buildx build --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile.ai-base.cuda \
  -t 10.34.0.202:5000/cerebral/ai-base:cuda --push .

docker buildx build --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile.ai-base.cpu \
  -t 10.34.0.202:5000/cerebral/ai-base:cpu --push .
```

**5. Verify both architectures in registry:**
```bash
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/manifests/cuda \
  -H "Accept: application/vnd.oci.image.index.v1+json" | \
  jq '.manifests[] | select(.platform.architecture != "unknown") | .platform.architecture'

# Should output:
# "amd64"
# "arm64"
```

**6. Commit to git:**
```bash
git add docker/requirements-unified.txt docker/Dockerfile.ai-base.*
git commit -m "chore: Update base images - torch 2.5.0, added xyz (multi-arch)"
git push origin main
```

**7. Verify builds succeed:**
```bash
# Push code and check PipelineRun
git commit --allow-empty -m "test: trigger build with new base images"
git push origin main

# Monitor build:
kubectl get pipelineruns -n tekton-pipelines -w
```

### Base Image Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `exec format error` | Wrong architecture | Rebuild with `--platform linux/amd64,linux/arm64` |
| `no matching manifest for linux/amd64` | ARM64-only image in cluster | Use multi-platform build |
| Build takes 30+ min | Layer cache miss | Ensure base images exist in registry |
| `Python.h: No such file` | Missing `python3-dev` | Add to `apt-get install` in Dockerfile |
| Import errors | Package missing | Add to `requirements-unified.txt` |

---

### How to Update (7-Step Process)

**1. Edit shared dependencies:**
```bash
vim ~/Development/cerebral/docker/requirements-unified.txt
```

**2. Test locally:**
```bash
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cuda -t test-cuda .
docker run --rm test-cuda python -c "import torch; print(torch.__version__)"
```

**3. Update Dockerfile (if build deps needed):**
```bash
# Add to RUN apt-get install:
# gcc, g++, python3-dev (for C extensions)
vim ~/Development/cerebral/docker/Dockerfile.ai-base.cuda
vim ~/Development/cerebral/docker/Dockerfile.ai-base.cpu
```

**4. Build both images:**
```bash
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda .
docker build -f docker/Dockerfile.ai-base.cpu -t cerebral/ai-base:cpu .
```

**5. Push to registry:**
```bash
docker tag cerebral/ai-base:cuda 10.34.0.202:5000/cerebral/ai-base:cuda
docker tag cerebral/ai-base:cpu 10.34.0.202:5000/cerebral/ai-base:cpu
docker push 10.34.0.202:5000/cerebral/ai-base:cuda
docker push 10.34.0.202:5000/cerebral/ai-base:cpu
```

**6. Commit to git:**
```bash
git add docker/requirements-unified.txt docker/Dockerfile.ai-base.*
git commit -m "chore: Update base images - torch 2.5.0, added xyz"
git push origin main
```

**7. Trigger rebuilds:**
```bash
# All services rebuild automatically on next push
git commit --allow-empty -m "rebuild: new base images available"
git push origin main
```

### Build Dependency Explanation

**Why add `python3-dev`, `gcc`, `g++`?**

Packages like `psutil`, `cryptography`, `numpy` need C extensions built during `pip install`. Without these tools, install fails.

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ python3-dev \
  && rm -rf /var/lib/apt/lists/*
```

### What's Included?

**All packages from**: `docker/requirements-unified.txt`
- ML: torch, transformers, scikit-learn, pandas, numpy
- API: FastAPI, Pydantic, SQLAlchemy
- Data: Redis, Supabase, chromadb
- Observability: Prometheus, OpenTelemetry
- NLP: spacy, nltk, sentence-transformers

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails: "Failed to resolve base image" | `curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list` → if missing, rebuild locally and push |
| Service: "No module named 'X'" | Check if in base image: `docker run 10.34.0.202:5000/cerebral/ai-base:cuda python -c "import X"` |
| Build slow | Base image may not be cached locally - pull it: `docker pull 10.34.0.202:5000/cerebral/ai-base:cuda` |

### Key Files for Agents

- **BASE_IMAGES_DOCUMENTATION.md** - Complete reference
- **CI_CD_COMPLETE_GUIDE.md** - Integration with build pipeline
- **docker/Dockerfile.ai-base.cuda** - CUDA image definition
- **docker/Dockerfile.ai-base.cpu** - CPU image definition
- **docker/requirements-unified.txt** - All ML/AI dependencies

---

## 📋 CONFIGURATION FILES (SOURCE OF TRUTH)

### INFRASTRUCTURE
| File | Purpose | Location |
|------|---------|----------|
| `k8s/ci-cd/webhook-receiver-ingress.yaml` | DEPRECATED - use IngressRoute instead | - |
| `k8s/ci-cd/webhook-receiver-ingressroute.yaml` | Traefik route for webhook | cerebral-deployment |
| `k8s/ci-cd/webhook-receiver-service.yaml` | ClusterIP service on port 3000 | cerebral-deployment |
| `k8s/ci-cd/webhook-receiver-deployment.yaml` | Rust service (2 replicas) | cerebral-deployment |
| `.github/workflows/trigger-tekton-build.yml` | Manual build trigger (fallback) | Each repo |

### INGRESS & TLS
| File | Purpose | Location |
|------|---------|----------|
| `k8s/ci-cd/webhook-receiver-ingressroute.yaml` | Route webhook requests to port 3000 | cerebral-deployment |
| `k8s/cert-manager/dev-wildcard-certificate.yaml` | *.dev.cerebral.baerautotech.com TLS | cerebral-deployment |
| `traefik/traefik-values.yaml` | Traefik config (websecure entry point) | cerebral-deployment |

### TEKTON CONFIGURATION
| File | Purpose | Location |
|------|---------|----------|
| `k8s/ci-cd/tekton-tasks.yaml` | Reusable Tekton tasks | cerebral-deployment |
| `k8s/ci-cd/tekton-pipeline.yaml` | Pipeline definition (git → build → deploy) | cerebral-deployment |
| `k8s/ci-cd/tekton-webhook-config.yaml` | Secret for GitHub webhook validation | cerebral-deployment |

---

## 🎯 HOW TO TRIGGER A BUILD (3 METHODS)

### METHOD 1: Push Code to Main Branch (Automatic)
```bash
# In your repo (cerebral, cerebral-frontend, cerebral-mobile)
git add .
git commit -m "feat: add new feature"
git push origin main

# What happens:
# 1. GitHub sends webhook to webhook.dev.cerebral.baerautotech.com
# 2. Rust receiver validates signature
# 3. Extracts service name from changed files
# 4. Creates Tekton PipelineRun
# 5. Build starts automatically
```

### METHOD 2: Pull Request (Automatic)
```bash
# Create PR against main branch
# Webhook triggers same pipeline automatically
# Build runs before merge approval
```

### METHOD 3: Manual Trigger (Fallback)
```bash
# From repo with gh CLI installed:
gh workflow run trigger-tekton-build.yml --ref main

# Or using Tekton directly:
kubectl apply -f - <<EOF
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: cerebral-manual-$(date +%s)
  namespace: tekton-pipelines
spec:
  pipelineRef:
    name: cerebral-universal-pipeline
  params:
  - name: serviceName
    value: backend
  - name: gitRepo
    value: https://github.com/baerautotech/cerebral
  - name: gitBranch
    value: main
  - name: imageName
    value: cerebral/backend
EOF
```

---

## 📊 MONITORING (CRITICAL FOR AGENTS)

### Is the Webhook Listener Running?
```bash
# Check Rust service pods
kubectl get pods -n tekton-pipelines -l app=github-webhook-receiver
kubectl logs -n tekton-pipelines -l app=github-webhook-receiver -c webhook-receiver --tail=20

# Expected output:
# Listening on 0.0.0.0:3000
# [INFO] Received webhook
# [INFO] Created PipelineRun: cerebral-<service>-<timestamp>
```

### Did Webhook Trigger a Build?
```bash
# Check for recent PipelineRuns
kubectl get pipelineruns -n tekton-pipelines --sort-by=.metadata.creationTimestamp | tail -5

# Expected: Recent run with name like "cerebral-backend-<timestamp>"
```

### Is Build Running?
```bash
# Watch build progress
kubectl logs -n tekton-pipelines <pipelinerun-name> -f
# or
tkn pipelinerun logs -n tekton-pipelines <pipelinerun-name> -f

# Expected stages:
# 1. [git-clone-task] Cloning repository
# 2. [kaniko-build-task] Building image
# 3. [deploy-task] Deploying to cluster
```

### Did Build Complete Successfully?
```bash
# Check PipelineRun status
kubectl get pipelinerun -n tekton-pipelines <pipelinerun-name> -o yaml | grep "conditions:"

# Expected:
# conditions:
# - status: "True"
#   type: Succeeded

# Check for built image
kubectl get images -n cerebral-platform | grep cerebral/backend
```

### Did Pods Deploy Successfully?
```bash
# Check deployment status
kubectl get deployment cerebral-backend -n cerebral-platform
kubectl rollout status deployment/cerebral-backend -n cerebral-platform

# Expected:
# deployment "cerebral-backend" successfully rolled out

# Check running pods
kubectl get pods -n cerebral-platform -l app=cerebral-backend
```

---

## 🔍 TROUBLESHOOTING GUIDE

### Problem: "No PipelineRun created after push"
**Diagnosis**:
```bash
# 1. Check webhook receiver is running
kubectl get pods -n tekton-pipelines -l app=github-webhook-receiver

# 2. Check webhook receiver logs
kubectl logs -n tekton-pipelines -l app=github-webhook-receiver -c webhook-receiver --tail=50

# 3. Check if webhook reached ingress
kubectl logs -n cerebral-development -l app=traefik --tail=20 | grep webhook

# 4. Check GitHub webhook delivery
# Go to: GitHub repo → Settings → Webhooks
# Click webhook → Recent Deliveries → Check status codes
```

**Common Causes**:
- ❌ Webhook receiver pods are not running → `kubectl rollout restart deployment/github-webhook-receiver -n tekton-pipelines`
- ❌ Service port wrong → Should be 3000, check `kubectl get svc github-webhook-receiver -n tekton-pipelines`
- ❌ IngressRoute wrong → Check `kubectl get ingressroute github-webhook-receiver -n cerebral-development`
- ❌ TLS certificate invalid → Check `kubectl get certificate dev-wildcard-tls -n cerebral-development`

### Problem: "Build created but PipelineRun failed"
**Diagnosis**:
```bash
# Check PipelineRun details
kubectl describe pipelinerun <name> -n tekton-pipelines

# Check TaskRun status
kubectl get taskruns -n tekton-pipelines | grep <pipelinerun-name>

# Check specific task logs
kubectl logs -n tekton-pipelines <taskrun-name> -c <container-name>
```

**Common Causes**:
- ❌ Code has errors → Fix code, push again
- ❌ Dockerfile missing → Create `Dockerfile` in repo root
- ❌ Registry credentials invalid → Check `kubectl get secret -n build-system | grep docker`
- ❌ Deployment manifest missing → Create `k8s/deployment.yaml` in repo

### Problem: "Build succeeded but pods not running"
**Diagnosis**:
```bash
# Check deployment status
kubectl get deployment <service-name> -n cerebral-platform
kubectl describe deployment <service-name> -n cerebral-platform

# Check pod events
kubectl describe pod <pod-name> -n cerebral-platform

# Check logs
kubectl logs <pod-name> -n cerebral-platform
```

**Common Causes**:
- ❌ Image not found → Check registry: `kubectl get pods -n registry`
- ❌ Resource requests too high → Edit deployment, reduce CPU/memory
- ❌ Secret/config missing → Check ConfigMaps and Secrets in namespace
- ❌ Health checks failing → Check `livenessProbe` and `readinessProbe`

### Problem: "Webhook signature validation failed"
**Diagnosis**:
```bash
# Check webhook secret exists
kubectl get secret github-webhook-secret -n tekton-pipelines

# Check if secret value matches GitHub webhook secret
kubectl get secret github-webhook-secret -n tekton-pipelines -o yaml

# GitHub webhook settings:
# Go to repo → Settings → Webhooks → Find webhook
# Check "Secret" field matches K8s secret
```

---

## ✅ VALIDATION CHECKLIST

Run this before asking for help with CI/CD issues:

```bash
#!/bin/bash
# Save as: scripts/validate-cicd-system.sh

echo "🔍 VALIDATING CI/CD SYSTEM..."
echo ""

# 1. Webhook receiver running
echo "✓ Webhook receiver pods:"
kubectl get pods -n tekton-pipelines -l app=github-webhook-receiver

# 2. Webhook receiver service
echo "✓ Webhook receiver service:"
kubectl get svc github-webhook-receiver -n tekton-pipelines

# 3. IngressRoute configured
echo "✓ Webhook IngressRoute:"
kubectl get ingressroute github-webhook-receiver -n cerebral-development

# 4. TLS certificate
echo "✓ TLS certificate status:"
kubectl get certificate dev-wildcard-tls -n cerebral-development

# 5. Tekton controller running
echo "✓ Tekton controller:"
kubectl get deployment tekton-pipelines-controller -n tekton-pipelines

# 6. Recent PipelineRuns
echo "✓ Recent PipelineRuns:"
kubectl get pipelineruns -n tekton-pipelines --sort-by=.metadata.creationTimestamp | tail -3

# 7. GitHub webhook secret
echo "✓ Webhook secret exists:"
kubectl get secret github-webhook-secret -n tekton-pipelines

echo ""
echo "✅ All checks complete!"
```

---

## 🚫 CRITICAL: DO NOT DO THIS

### ❌ DO NOT kubectl patch ingress
```bash
# WRONG:
kubectl patch ingress cerebral-github-listener ...

# This reverts on next apply! Instead:
# 1. Edit YAML file: k8s/ci-cd/webhook-receiver-ingressroute.yaml
# 2. Run: kubectl apply -f k8s/ci-cd/webhook-receiver-ingressroute.yaml
# 3. Commit to git
```

### ❌ DO NOT change webhook receiver port to 80
```bash
# WRONG:
# service.spec.ports[0].port: 80
# service.spec.ports[0].targetPort: 80

# CORRECT:
# service.spec.ports[0].port: 3000
# service.spec.ports[0].targetPort: 3000
```

### ❌ DO NOT bypass Traefik
```bash
# WRONG: Firewall rule directly to webhook receiver
# Firewall: 3000 → 10.34.0.206:3000

# CORRECT: All traffic through Traefik
# Firewall: 443 → 10.34.0.246:443
# Traefik: webhook.dev.* → service:3000 (internally)
```

### ❌ DO NOT create EventListener or Broker
```bash
# WRONG: kubectl apply -f eventlistener.yaml
# Tekton EventListener removed Oct 24, 2025
# Custom Rust webhook receiver is the system!

# CORRECT: Let Rust receiver handle webhooks
# Trust the system, it's working
```

### ❌ DO NOT assume GitHub Actions builds code
```bash
# WRONG: Checking GitHub Actions logs for build status
# GitHub Actions may run tests, but Tekton does the BUILD

# CORRECT: Check Tekton PipelineRuns for build status
# kubectl get pipelineruns -n tekton-pipelines
# kubectl logs -n tekton-pipelines <pipelinerun> -f
```

---

## 📚 KEY COMMANDS (Copy-Paste Ready)

### Build Monitoring
```bash
# Watch latest build
watch kubectl get pipelineruns -n tekton-pipelines --sort-by=.metadata.creationTimestamp | tail -3

# See build logs
kubectl logs -n tekton-pipelines $(kubectl get pipelineruns -n tekton-pipelines -o jsonpath='{.items[-1].metadata.name}') -f

# Check deployment progress
kubectl rollout status deployment/cerebral-backend -n cerebral-platform

# See all pod events
kubectl get events -n cerebral-platform --sort-by='.lastTimestamp'
```

### Webhook Receiver Debugging
```bash
# Restart webhook receiver
kubectl rollout restart deployment/github-webhook-receiver -n tekton-pipelines

# Check webhook logs
kubectl logs -n tekton-pipelines -l app=github-webhook-receiver -c webhook-receiver --tail=100

# Port forward for local testing
kubectl port-forward -n tekton-pipelines svc/github-webhook-receiver 3000:3000

# Send test webhook (if port forwarded)
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=xxx" \
  -d '{"ref":"refs/heads/main",...}'
```

### Manual Build Trigger
```bash
# If webhook fails, trigger manually
kubectl apply -f - <<'EOF'
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  generateName: cerebral-backend-manual-
  namespace: tekton-pipelines
spec:
  pipelineRef:
    name: cerebral-universal-pipeline
  params:
  - name: serviceName
    value: backend
  - name: gitRepo
    value: https://github.com/baerautotech/cerebral
  - name: gitBranch
    value: main
  - name: imageName
    value: cerebral/backend
EOF
```

---

## 📖 DOCUMENTATION FILES (Read in Order)

1. **START HERE**: `CI_CD_COMPLETE_GUIDE.md` (comprehensive guide)
2. **WEBHOOK**: `WEBHOOK_RECEIVER_CONFIGURATION.md` (webhook details)
3. **INGRESS**: `TRAEFIK_MIGRATION_COMPLETE_VERIFICATION.md` (ingress details)
4. **FIREWALL**: `FIREWALL_TRAEFIK_MAPPING.md` (firewall rules)
5. **MONITORING**: `CI_CD_MONITORING_GUIDE.md` (build monitoring)

---

## 🎯 FOR AI AGENTS: WHAT TO DO

**User says: "Check if build completed"**

```bash
# FIRST: Validate system
./scripts/validate-cicd-system.sh

# SECOND: Check webhook receiver
kubectl get pods -n tekton-pipelines -l app=github-webhook-receiver

# THIRD: Check for recent PipelineRuns
kubectl get pipelineruns -n tekton-pipelines --sort-by=.metadata.creationTimestamp | tail -1

# FOURTH: Check if build succeeded
kubectl describe pipelinerun <name> -n tekton-pipelines | grep "Succeeded"

# FIFTH: Check if pods deployed
kubectl get pods -n cerebral-platform -l app=cerebral-backend

# If anything is wrong, capture output from steps 1-5 and troubleshoot using sections above
```

**User says: "Deploy to cluster"**

```bash
# Option 1: Push code (automatic trigger)
git push origin main
# → Wait for PipelineRun to complete
# → Check pod deployment

# Option 2: Manual trigger
kubectl apply -f - <<'EOF'
[use Manual Build Trigger template above]
EOF
```

---

## ✅ SUCCESS INDICATORS

**Build was triggered**: ✅ PipelineRun appears in `kubectl get pipelineruns -n tekton-pipelines`

**Build is running**: ✅ PipelineRun status is "Running", TaskRuns are in progress

**Build succeeded**: ✅ PipelineRun status is "Succeeded", image appears in registry

**Deployment succeeded**: ✅ Pods running in cerebral-platform namespace, `kubectl get pods -n cerebral-platform` shows READY status

---

## ❓ STILL UNSURE?

1. Read `CI_CD_COMPLETE_GUIDE.md` fully
2. Run validation script: `./scripts/validate-cicd-system.sh`
3. Collect output from troubleshooting section
4. Share with team

**DO NOT ASSUME**:
- ❌ "EventListener should exist"
- ❌ "Check GitHub Actions logs"
- ❌ "Knative should be configured"

**KNOW**:
- ✅ Custom Rust webhook receiver
- ✅ Tekton Pipelines
- ✅ Kaniko builds
- ✅ Traefik ingress
- ✅ Port 3000 webhook
