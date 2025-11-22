# 🐳 Base Images Documentation - Complete Guide

**Last Updated**: October 25, 2025
**Status**: ✅ Production Ready
**Location**: Internal Registry at `10.34.0.202:5000`

---

## 📋 Overview

The Cerebral Platform uses two pre-built base images with ML/AI dependencies pre-installed. These images serve as the foundation for all microservices builds, dramatically reducing build time and ensuring consistent dependencies across all services.

### Base Images Available

| Image | Purpose | Size | Base Image | Registry Path |
|---|---|---|---|---|
| **ai-base:cuda** | GPU-accelerated AI services | ~7.5GB | `nvidia/cuda:12.4.1-runtime-ubuntu22.04` | `10.34.0.202:5000/cerebral/ai-base:cuda` |
| **ai-base:cpu** | CPU-only AI services | ~2.8GB | `python:3.11-slim` | `10.34.0.202:5000/cerebral/ai-base:cpu` |

---

## 🏗️ Architecture & Usage

### Services Using Base Images

**CUDA Version (`cerebral/ai-base:cuda`):**
- `ai-services` - AI/ML model serving
- `bmad-services` - BMAD orchestration
- `data-services` - Data processing with GPU
- `knowledge-services` - Knowledge graph with GPU acceleration
- `integration-services` - ML-based integrations
- `monitoring-services` - Advanced monitoring with ML
- `realtime-services` - Real-time processing
- `workflow-services` - Workflow orchestration
- `security-services` - Security scanning with ML
- `storage-services` - Optimized storage
- `notification-services` - Smart notifications
- `testing-services` - Advanced testing

### Building ON Base Images

When building a microservice, use this pattern in your Dockerfile:

```dockerfile
# ✅ CORRECT - Using base images
ARG REGISTRY=10.34.0.202:5000
ARG BASE_IMAGE_TAG=cuda  # or 'cpu'

FROM ${REGISTRY}/cerebral/ai-base:${BASE_IMAGE_TAG}

# Your service-specific code
COPY . /app
WORKDIR /app

# Your service-specific dependencies (if any)
RUN pip install -r requirements.txt

# Your service code
CMD ["python", "-m", "uvicorn", "main:app"]
```

**Example from ai-services:**

```dockerfile
# Build argument with internal registry
ARG BASE=internal-registry.registry.svc.cluster.local:5000/cerebral/ai-base:cuda
FROM ${BASE}

# Rest of your Dockerfile
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

---

## 🔍 Registry Location & Access

### Internal Registry Details

```
URL: http://10.34.0.202:5000 (inside cluster)
URL: https://registry.dev.cerebral.baerautotech.com (external)
Protocol: HTTP (internal), HTTPS (external)
Authentication: Docker config
```

### Verify Images in Registry

```bash
# List all ai-base tags
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list

# Expected output:
{"name":"cerebral/ai-base","tags":["cuda","cpu"]}

# Get image manifest
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/manifests/cuda

# Verify multi-architecture support
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/manifests/cuda \
  -H "Accept: application/vnd.oci.image.index.v1+json" | jq '.manifests[]'

# Should show both amd64 and arm64 entries ✅
```

---

## 🏗️ Multi-Platform Architecture Support

### ⚠️ CRITICAL: Building for Multi-Architecture

**The Cerebral Platform runs on AMD64 (x86_64) in Kubernetes, but developers use ARM64 (Apple Silicon) on Mac.**

✅ **The base images MUST support both architectures** or builds will fail.

### Current Multi-Architecture Status

```
✅ cerebral/ai-base:cuda
   • amd64 (linux/amd64) - for Kubernetes cluster
   • arm64 (linux/arm64) - for Mac development

✅ cerebral/ai-base:cpu
   • amd64 (linux/amd64) - for Kubernetes cluster
   • arm64 (linux/arm64) - for Mac development

Both images: Single tag with automatic architecture resolution
```

### How Multi-Architecture Works

When you pull `10.34.0.202:5000/cerebral/ai-base:cuda`:

```
1. Docker/Kaniko requests the image
2. Registry responds with manifest index
3. Client detects its own architecture (amd64 or arm64)
4. Registry returns matching image automatically
5. No errors, no conflicts ✅

Result:
  • Mac gets ARM64 version
  • Kubernetes gets AMD64 version
  • Same tag, zero configuration needed
```

### ⚠️ Architecture Mismatch Issues (RESOLVED)

**What happened (October 25, 2025):**

1. ❌ Built images locally on Mac → ARM64 only
2. ❌ Pushed to registry as ARM64
3. ❌ Kubernetes cluster (AMD64) couldn't use ARM64 image
4. ❌ Kaniko error: "no matching manifest for linux/amd64"
5. ❌ All builds blocked

**How we fixed it:**

✅ Used `docker buildx build --platform linux/amd64,linux/arm64`
✅ Both architectures built in single command
✅ Manifest index pushed to registry
✅ Now both Mac and cluster work automatically

### Building Multi-Platform Base Images (Correct Way)

**If you need to rebuild the base images, use this procedure:**

```bash
cd ~/Development/cerebral

# Option 1: Build for both architectures (RECOMMENDED)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile.ai-base.cuda \
  -t 10.34.0.202:5000/cerebral/ai-base:cuda \
  --push .

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile.ai-base.cpu \
  -t 10.34.0.202:5000/cerebral/ai-base:cpu \
  --push .

# Verify multi-architecture:
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/manifests/cuda \
  -H "Accept: application/vnd.oci.image.index.v1+json" | \
  jq '.manifests[] | select(.platform.architecture != "unknown") | .platform.architecture'

# Output should be:
# "amd64"
# "arm64"
```

### Why NOT to do single-architecture builds

❌ **WRONG - Building for Mac only:**
```bash
docker build -f docker/Dockerfile.ai-base.cuda -t 10.34.0.202:5000/cerebral/ai-base:cuda .
# This creates ARM64 image only
# Kubernetes cannot use it ❌
```

❌ **WRONG - Separate architecture tags:**
```bash
docker buildx build --platform linux/amd64 -t 10.34.0.202:5000/cerebral/ai-base:cuda-amd64 ...
docker buildx build --platform linux/arm64 -t 10.34.0.202:5000/cerebral/ai-base:cuda-arm64 ...
# Requires different Dockerfiles for Mac vs cluster ❌
# Developers have to know which tag to use ❌
```

✅ **CORRECT - Multi-architecture single tag:**
```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  -t 10.34.0.202:5000/cerebral/ai-base:cuda --push .
# Single tag works everywhere ✅
# Automatic resolution by OS ✅
# Zero configuration needed ✅
```

### Prerequisites for Multi-Platform Builds

Your Mac must have:

```bash
# Check if docker buildx is available
docker buildx ls

# Expected output:
# NAME/NODE           DRIVER/ENDPOINT     STATUS
# default             docker              running
# desktop-linux*      docker              running

# If missing, install Docker Desktop (includes buildx)
# Or: brew install docker-buildx-bin
```

---

## 📦 What's Included in Base Images

### Common Dependencies (Both Images)

**Python ML/AI Stack:**
- `torch` - PyTorch for deep learning
- `transformers` - Hugging Face transformers (NLP)
- `pandas` - Data manipulation
- `numpy` - Numerical computing
- `scikit-learn` - Machine learning
- `scipy` - Scientific computing

**Data & Storage:**
- `sqlalchemy` - ORM
- `redis` - Caching
- `psycopg2` - PostgreSQL driver
- `supabase` - Supabase client
- `chromadb` - Vector database

**Web & API:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `requests` - HTTP client
- `httpx` - Async HTTP client

**ML Infrastructure:**
- `sentence-transformers` - Embeddings
- `spacy` - NLP
- `nltk` - NLP toolkit
- `chromadb` - Vector DB
- `onnxruntime` - Model inference
- `huggingface_hub` - Model downloads

**Observability:**
- `prometheus-client` - Metrics
- `opentelemetry` - Tracing
- `structlog` - Structured logging

**See Full List:**
```bash
# View all dependencies
cat ~/Development/cerebral/docker/requirements-unified.txt

# Or in the cluster
kubectl exec -it <pod-name> -- pip list
```

### CUDA-Specific

The `:cuda` image additionally includes:
- `nvidia/cuda:12.4.1-runtime` base
- `torch[cuda]` - PyTorch with CUDA support
- `torchvision[cuda]` - Computer vision
- `torchaudio[cuda]` - Audio processing

---

## 🔄 Maintenance & Updates

### When to Update Base Images

Update base images when:
1. ✅ Adding new dependencies needed by multiple services
2. ✅ Upgrading existing packages (security patches, features)
3. ✅ Changing Python version (3.11 → 3.12)
4. ✅ Changing base OS (Ubuntu 22.04 → 24.04)
5. ✅ Updating CUDA version (12.4 → 13.0)

Do NOT update for service-specific dependencies - add those in the service's own `requirements.txt`.

### Step-by-Step: Update Base Image

#### Step 1: Update Dependencies File

Edit the unified requirements file with all shared dependencies:

```bash
# Edit the file
vim ~/Development/cerebral/docker/requirements-unified.txt

# Add or update packages:
# Example: Change torch version
# FROM: torch==2.4.1
# TO:   torch==2.5.0
```

#### Step 2: Test Dependency Changes

**For CUDA Version:**
```bash
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda-test .
docker run --rm cerebral/ai-base:cuda-test python -c "import torch; print(torch.__version__)"
```

**For CPU Version:**
```bash
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cpu -t cerebral/ai-base:cpu-test .
docker run --rm cerebral/ai-base:cpu-test python -c "import torch; print(torch.__version__)"
```

#### Step 3: If Dockerfile Needs Changes

Edit the Dockerfile directly if needed:

```bash
# CUDA version
vim ~/Development/cerebral/docker/Dockerfile.ai-base.cuda

# CPU version
vim ~/Development/cerebral/docker/Dockerfile.ai-base.cpu
```

**Common changes:**
- Add build dependencies: `gcc`, `g++`, `python3-dev`
- Update base image: `python:3.11-slim` → `python:3.12-slim`
- Update CUDA: `nvidia/cuda:12.4.1` → `nvidia/cuda:13.0`

#### Step 4: Build Both Images

```bash
cd ~/Development/cerebral

# Build CUDA version
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda .

# Build CPU version
docker build -f docker/Dockerfile.ai-base.cpu -t cerebral/ai-base:cpu .

# Verify builds succeeded
docker image ls | grep ai-base
```

#### Step 5: Push to Registry

```bash
# Tag for internal registry
docker tag cerebral/ai-base:cuda 10.34.0.202:5000/cerebral/ai-base:cuda
docker tag cerebral/ai-base:cpu 10.34.0.202:5000/cerebral/ai-base:cpu

# Push both
docker push 10.34.0.202:5000/cerebral/ai-base:cuda
docker push 10.34.0.202:5000/cerebral/ai-base:cpu

# Verify in registry
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list
```

#### Step 6: Commit Changes

```bash
cd ~/Development/cerebral
git add docker/requirements-unified.txt docker/Dockerfile.ai-base.*
git commit -m "chore: Update base images - <describe changes>

Changes:
- Updated torch to v2.5.0
- Added new ML dependency: <package-name>
- Updated build dependencies in Dockerfiles"
git push origin main
```

#### Step 7: Trigger Microservice Rebuilds

The updated base images will be automatically used for the next build of any dependent service:

```bash
# Option 1: Automatic via webhook
git commit --allow-empty -m "rebuild: using updated base images"
git push origin main

# Option 2: Manual rebuild
kubectl delete pods -n cerebral-platform -l app=ai-services  # Forces redeploy
```

---

## 🚀 Troubleshooting

### Problem: Service Build Fails with "Failed to resolve base image"

**Cause**: Base image not found in registry

**Solution:**
```bash
# 1. Verify image exists
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list

# 2. If missing, rebuild and push
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda .
docker tag cerebral/ai-base:cuda 10.34.0.202:5000/cerebral/ai-base:cuda
docker push 10.34.0.202:5000/cerebral/ai-base:cuda

# 3. Retry service build
gh workflow run build.yml --repo baerautotech/cerebral
```

### Problem: Import Error in Service - "No module named 'package'"

**Cause**: Package not in base image or version mismatch

**Solution:**
```bash
# 1. Check if in base image
docker run --rm 10.34.0.202:5000/cerebral/ai-base:cuda python -c "import <package>"

# 2. If missing:
# a. Add to requirements-unified.txt if needed by multiple services
# b. Or add to service's own requirements.txt if service-specific

# 3. Rebuild base image (if step 2a)
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda .
docker push 10.34.0.202:5000/cerebral/ai-base:cuda

# 4. Retry build
```

### Problem: Build Takes Longer Than Expected

**Cause**: Base image not cached or dependencies rebuilding

**Solution:**
```bash
# 1. Verify base image is in local Docker
docker image ls | grep ai-base

# 2. If not present, pull it
docker pull 10.34.0.202:5000/cerebral/ai-base:cuda
docker pull 10.34.0.202:5000/cerebral/ai-base:cpu

# 3. For Kaniko builds, ensure base image is reachable
kubectl run -it --rm debug --image=10.34.0.202:5000/cerebral/ai-base:cuda --restart=Never -- bash
```

---

## 📊 Image Metadata

### CUDA Version

```
Name: cerebral/ai-base:cuda
Base: nvidia/cuda:12.4.1-runtime-ubuntu22.04
Python: 3.11
PyTorch: 2.4.1 (CUDA 12.1)
TorchVision: 0.19.1
TorchAudio: 2.4.1
Digest: sha256:ebb4489bc747ab82090425caa7e18b56e1cc6ff8c911a8fe3d2b1f5ad317942e
Size: ~7.5GB
Built: 2025-10-25T05:45:00Z
Updated: 2025-10-25 (added python3.11-dev, gcc, g++)
```

### CPU Version

```
Name: cerebral/ai-base:cpu
Base: python:3.11-slim
Python: 3.11
PyTorch: 2.4.1 (CPU)
TorchVision: 0.19.1
TorchAudio: 2.4.1
Digest: sha256:a0283e20e6e29142993c0553c300e5c3faea234735b322a2c0a7dde744fe7917
Size: ~2.8GB
Built: 2025-10-25T05:48:00Z
Updated: 2025-10-25 (added gcc, g++, python3-dev)
```

---

## 🔐 Build Dependencies Reference

### Why These Are Needed

**python3-dev / python3.11-dev:**
- Required for C extensions (psutil, lxml, etc.)
- Provides Python.h header files
- Needed during `pip install` for packages that compile from source

**gcc / g++ (C/C++ compilers):**
- Required for compiling C/C++ extensions
- Needed by: psutil, cryptography, numpy, scipy, etc.

**build-essential:**
- Meta-package containing gcc, g++, make, libc-dev
- Standard for build environments

### If Adding New Packages

When adding a package that requires compilation, ensure build dependencies are in Dockerfile:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc g++ \
    python3-dev \
    git curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
```

---

## 📚 Related Documentation

- **CI_CD_COMPLETE_GUIDE.md** - Full build system overview
- **TEKTON_PIPELINE_PARAMETERS_COMPLETE.md** - Build parameters
- **BUILD_SYSTEM_TEKTON_ONLY.md** - Tekton configuration
- **BASE_IMAGE_BLOCKER_ACTION_PLAN.md** - Historical context

---

## 🎯 Quick Reference

### Check Images in Registry
```bash
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list
```

### Build & Push Updated Images
```bash
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda .
docker build -f docker/Dockerfile.ai-base.cpu -t cerebral/ai-base:cpu .
docker tag cerebral/ai-base:cuda 10.34.0.202:5000/cerebral/ai-base:cuda
docker tag cerebral/ai-base:cpu 10.34.0.202:5000/cerebral/ai-base:cpu
docker push 10.34.0.202:5000/cerebral/ai-base:cuda
docker push 10.34.0.202:5000/cerebral/ai-base:cpu
```

### Add New Dependency
```bash
# 1. Edit requirements file
echo "new-package==1.0.0" >> ~/Development/cerebral/docker/requirements-unified.txt

# 2. Rebuild (from above)
# 3. Commit & push
git add docker/requirements-unified.txt
git commit -m "chore: Add new-package v1.0.0"
git push origin main
```

---

**Status**: ✅ Production Ready
**Last Verified**: October 25, 2025
**Maintenance**: Quarterly dependency audit recommended
