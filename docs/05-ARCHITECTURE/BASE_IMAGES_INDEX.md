# 🐳 Base Images Documentation - Complete Index & Navigation

**Created**: October 25, 2025
**Status**: ✅ Fully Deployed to All 4 Repositories
**Purpose**: Central index for all base image-related documentation

---

## 📍 Quick Navigation

### I Need To...

| Task | Location | Document | Section |
|------|----------|----------|---------|
| **Understand what base images are** | Any repo | CI_CD_COMPLETE_GUIDE.md | "Base Images - Fast Build Foundation" |
| **Use base images in my Dockerfile** | Any repo | BASE_IMAGES_DOCUMENTATION.md | "Building ON Base Images" |
| **Add a new ML dependency** | cerebral repo | BASE_IMAGES_DOCUMENTATION.md | "Maintaining & Updating Base Images" → Step 1 |
| **Update base images** | cerebral repo | BASE_IMAGES_DOCUMENTATION.md | "Complete 7-Step Procedure" |
| **Check if dependency is in base image** | Any repo | BASE_IMAGES_DOCUMENTATION.md | "Troubleshooting" |
| **Verify images in registry** | Any repo | .cursor/rules.md | "Base Images - Quick Commands" |
| **Understand build dependencies** | Any repo | BASE_IMAGES_DOCUMENTATION.md | "Build Dependencies Reference" |
| **See what's included** | Any repo | BASE_IMAGES_DOCUMENTATION.md | "What's Included in Base Images" |
| **Fix a build failure** | Any repo | .cursor/rules.md | "Troubleshooting" table |

---

## 📚 Documentation Structure

### Layer 1: Quick Reference (.cursor/rules.md)
**For**: AI agents, quick lookups
**When**: You need fast answers
**Content**:
- What are base images (1 paragraph)
- Where to find them (registry URL)
- How services use them (code snippet)
- When/when NOT to update (table)
- 7-step condensed process
- Troubleshooting table (3 common issues)

**In Every Repo**: ✅ YES

### Layer 2: Implementation Guide (CI_CD_COMPLETE_GUIDE.md)
**For**: Understanding context & integration
**When**: You need to understand how they fit into the system
**Content**:
- Overview & impact (30min → 3min)
- Table of available images
- How to use in Dockerfiles
- Kaniko pipeline integration
- Services using base images (12+)
- Registry access
- Maintenance procedures
- Troubleshooting

**In Every Repo**: ✅ YES

### Layer 3: Complete Reference (BASE_IMAGES_DOCUMENTATION.md)
**For**: Complete understanding & detailed procedures
**When**: You need all the details
**Content**:
- Complete architecture
- Registry operations
- Full Dockerfile patterns
- All included dependencies
- Complete 7-step update procedure
- Build dependency explanation
- Image metadata & digests
- Advanced troubleshooting
- Quick reference commands

**In Every Repo**: ✅ YES (NEW)

---

## 🏗️ Base Images Architecture

### Two Images Available

**Image 1: cerebral/ai-base:cuda**
- Purpose: GPU-accelerated services
- Base: `nvidia/cuda:12.4.1-runtime-ubuntu22.04`
- Size: ~7.5GB
- Python: 3.11
- PyTorch: 2.4.1 (with CUDA 12.1)
- Registry: `10.34.0.202:5000/cerebral/ai-base:cuda`
- Digest: `sha256:ebb4489bc747ab82090425caa7e18b56e1cc6ff8c911a8fe3d2b1f5ad317942e`
- Services: ai-services, bmad-services, data-services, knowledge-services, +8 more

**Image 2: cerebral/ai-base:cpu**
- Purpose: CPU-only services
- Base: `python:3.11-slim`
- Size: ~2.8GB
- Python: 3.11
- PyTorch: 2.4.1 (CPU only)
- Registry: `10.34.0.202:5000/cerebral/ai-base:cpu`
- Digest: `sha256:a0283e20e6e29142993c0553c300e5c3faea234735b322a2c0a7dde744fe7917`
- Services: Integration services, testing, utilities

### What's Included

```
ML/AI Stack:
  torch, transformers, scikit-learn, pandas, numpy, scipy
  sentence-transformers, spacy, nltk, chromadb, onnxruntime, huggingface_hub

Web & API:
  FastAPI, uvicorn, Pydantic, SQLAlchemy, requests, httpx

Data & Storage:
  redis, PostgreSQL driver, Supabase client, chromadb

Observability:
  prometheus-client, OpenTelemetry, structlog

Build Tools:
  gcc, g++, python3-dev, build-essential, make
```

**See complete list**: `cerebral/docker/requirements-unified.txt`

---

## 🚀 Common Workflows

### Workflow 1: Using Base Image in Your Service

```bash
# 1. Check what's in base image
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list

# 2. Create Dockerfile
cat > Dockerfile << 'EOF'
ARG BASE=10.34.0.202:5000/cerebral/ai-base:cuda
FROM ${BASE}

WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
EOF

# 3. Build & test locally
docker build -t my-service .
docker run --rm my-service python -c "import torch; print(torch.__version__)"

# 4. Push code → webhook fires → Kaniko uses your Dockerfile → Deployed!
```

**See**: BASE_IMAGES_DOCUMENTATION.md → "Building ON Base Images"

### Workflow 2: Adding a New Dependency

```bash
# 1. Check if needed by multiple services
#    If YES → add to base image
#    If NO → add to service's own requirements.txt

# 2. Edit requirements file (if multiple services need it)
echo "new-package==1.0.0" >> ~/Development/cerebral/docker/requirements-unified.txt

# 3. Test locally
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cuda -t test-cuda .
docker run --rm test-cuda python -c "import new_package"

# 4. Build & push both images
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda .
docker build -f docker/Dockerfile.ai-base.cpu -t cerebral/ai-base:cpu .
docker tag cerebral/ai-base:cuda 10.34.0.202:5000/cerebral/ai-base:cuda
docker tag cerebral/ai-base:cpu 10.34.0.202:5000/cerebral/ai-base:cpu
docker push 10.34.0.202:5000/cerebral/ai-base:cuda
docker push 10.34.0.202:5000/cerebral/ai-base:cpu

# 5. Commit & trigger rebuilds
git add docker/requirements-unified.txt
git commit -m "chore: Add new-package"
git push origin main  # All services rebuild!
```

**See**: BASE_IMAGES_DOCUMENTATION.md → "Step-by-Step: Update Base Image"

### Workflow 3: Fixing Build Failure - "Failed to resolve base image"

```bash
# 1. Check if image exists
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list
# If missing both tags → step 2

# 2. Rebuild base images locally
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda .
docker build -f docker/Dockerfile.ai-base.cpu -t cerebral/ai-base:cpu .

# 3. Push to registry
docker tag cerebral/ai-base:cuda 10.34.0.202:5000/cerebral/ai-base:cuda
docker tag cerebral/ai-base:cpu 10.34.0.202:5000/cerebral/ai-base:cpu
docker push 10.34.0.202:5000/cerebral/ai-base:cuda
docker push 10.34.0.202:5000/cerebral/ai-base:cpu

# 4. Verify
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list

# 5. Retry build
git commit --allow-empty -m "rebuild: base images now available"
git push origin main
```

**See**: BASE_IMAGES_DOCUMENTATION.md → "Troubleshooting" section

---

## 📋 File Locations

### Documentation Files (All 4 Repos)

```
cerebral/
├── BASE_IMAGES_DOCUMENTATION.md        ← Complete reference
├── CI_CD_COMPLETE_GUIDE.md            ← Base images section
└── .cursor/rules.md                   ← Quick reference

cerebral-deployment/
├── BASE_IMAGES_DOCUMENTATION.md        ← Complete reference
├── CI_CD_COMPLETE_GUIDE.md            ← Base images section
└── .cursor/rules.md                   ← Quick reference

cerebral-frontend/
├── BASE_IMAGES_DOCUMENTATION.md        ← Complete reference
├── CI_CD_COMPLETE_GUIDE.md            ← Base images section
└── .cursor/rules.md                   ← Quick reference

cerebral-mobile/
├── BASE_IMAGES_DOCUMENTATION.md        ← Complete reference
├── CI_CD_COMPLETE_GUIDE.md            ← Base images section
└── .cursor/rules.md                   ← Quick reference
```

### Source Files (cerebral repo only)

```
cerebral/docker/
├── Dockerfile.ai-base.cuda            ← GPU image definition
├── Dockerfile.ai-base.cpu             ← CPU image definition
└── requirements-unified.txt           ← All ML/AI dependencies
```

---

## 🔍 Decision Tree - Which Document to Read?

```
START
  │
  ├─ "I need a quick answer"
  │  └─ Read: .cursor/rules.md → "Base Images" section
  │     (2-3 min read)
  │
  ├─ "I want to understand context"
  │  └─ Read: CI_CD_COMPLETE_GUIDE.md → "Base Images" section
  │     (5-10 min read)
  │
  ├─ "I need to update/maintain base images"
  │  └─ Read: BASE_IMAGES_DOCUMENTATION.md → "Maintaining & Updating"
  │     (15-20 min read, then follow procedure)
  │
  ├─ "I'm debugging a build error"
  │  └─ Check: .cursor/rules.md → Troubleshooting table
  │     If not there → BASE_IMAGES_DOCUMENTATION.md → Troubleshooting
  │
  ├─ "I want to understand everything"
  │  └─ Read: BASE_IMAGES_DOCUMENTATION.md (entire document)
  │     (30-45 min comprehensive review)
  │
  └─ "I'm implementing a microservice"
     └─ Read: BASE_IMAGES_DOCUMENTATION.md → "Building ON Base Images"
        (10-15 min read + implementation)
```

---

## ✅ What This Documentation Guarantees

| Guarantee | How It's Met |
|-----------|------------|
| **Zero ambiguity about location** | Registry URL explicit in 3 docs + quick reference |
| **Clear usage patterns** | Dockerfile templates in 2 docs + real examples |
| **Complete maintenance process** | 7-step procedure in BASE_IMAGES_DOCUMENTATION.md |
| **Troubleshooting coverage** | Troubleshooting sections in all 3 docs |
| **Build dependency explanation** | Complete reference in BASE_IMAGES_DOCUMENTATION.md |
| **Quick access for agents** | .cursor/rules.md in every repo |
| **Context within CI/CD** | Integrated into CI_CD_COMPLETE_GUIDE.md |
| **Comprehensive reference** | BASE_IMAGES_DOCUMENTATION.md (500+ lines) |
| **Synced across repos** | Same docs deployed to all 4 repos |
| **Future-proof procedures** | Step-by-step process documented for all scenarios |

---

## 🎯 Quick Reference Commands

### Verify Images
```bash
curl -s http://10.34.0.202:5000/v2/cerebral/ai-base/tags/list
```

### Build & Push
```bash
cd ~/Development/cerebral
docker build -f docker/Dockerfile.ai-base.cuda -t cerebral/ai-base:cuda .
docker build -f docker/Dockerfile.ai-base.cpu -t cerebral/ai-base:cpu .
docker tag cerebral/ai-base:cuda 10.34.0.202:5000/cerebral/ai-base:cuda
docker tag cerebral/ai-base:cpu 10.34.0.202:5000/cerebral/ai-base:cpu
docker push 10.34.0.202:5000/cerebral/ai-base:cuda
docker push 10.34.0.202:5000/cerebral/ai-base:cpu
```

### Test Dependency
```bash
docker run --rm 10.34.0.202:5000/cerebral/ai-base:cuda python -c "import package"
```

### Pull for Caching
```bash
docker pull 10.34.0.202:5000/cerebral/ai-base:cuda
docker pull 10.34.0.202:5000/cerebral/ai-base:cpu
```

---

## 📊 Documentation Statistics

| Metric | Value |
|--------|-------|
| New documents created | 1 (BASE_IMAGES_DOCUMENTATION.md) |
| Existing docs updated | 2 (CI_CD_COMPLETE_GUIDE.md, .cursor/rules.md) |
| Repositories deployed to | 4 (all) |
| Total new lines | ~850 lines |
| Code examples | 15+ ready-to-use |
| Quick commands | 20+ copy-paste ready |
| Troubleshooting scenarios | 10+ covered |
| Build procedures | 7-step documented |

---

## 📅 Version History

| Date | Change | Impact |
|------|--------|--------|
| 2025-10-25 | Initial creation | All base image docs created & deployed |
| 2025-10-25 | CUDA Dockerfile fix | Added gcc, g++, python3-dev |
| 2025-10-25 | CPU Dockerfile fix | Added gcc, g++, python3-dev |
| | | Both images now available in registry |

---

## 🔗 Related Documentation

- **CI_CD_COMPLETE_GUIDE.md** - Build pipeline context
- **WEBHOOK_RECEIVER_CONFIGURATION.md** - GitHub webhook setup
- **TEKTON_PIPELINE_PARAMETERS_COMPLETE.md** - Tekton configuration
- **BUILD_SYSTEM_TEKTON_ONLY.md** - Build system details
- **.cursor/rules.md** - AI agent guidelines

---

## 📞 Support

**For questions about**:
- Base image usage → Read: BASE_IMAGES_DOCUMENTATION.md
- Build failures → Check: .cursor/rules.md Troubleshooting
- CI/CD integration → See: CI_CD_COMPLETE_GUIDE.md
- Dependency updates → Follow: BASE_IMAGES_DOCUMENTATION.md Steps 1-7

**All documentation**: Available in every repo (same files, synchronized)

---

**Status**: ✅ Complete & Production Ready
**Last Updated**: October 25, 2025
**Deployed**: All 4 repositories
**Maintained**: Synchronized across repos
