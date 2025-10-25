# 🚀 Cerebral Platform - CI/CD System

**Status**: ✅ Production Ready  
**Last Updated**: October 24, 2025  
**Build System**: Tekton Pipelines with Kaniko  
**Webhook Receiver**: Rust service

---

## 📚 Quick Navigation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **This File** | 5-minute overview | ⭐⭐⭐ START HERE |
| `CI_CD_COMPLETE_GUIDE.md` | Full system documentation + mermaid diagram | 10 min |
| `WEBHOOK_RECEIVER_CONFIGURATION.md` | Detailed webhook receiver configuration | 5 min |
| `.cursor/rules.md` | Quick reference rules (in Cursor) | 2 min |
| `scripts/validate-webhook-receiver.sh` | Validation script | Run it |

---

## ⚡ The 30-Second Version

```bash
# To deploy code:
git push origin main

# That's it! Tekton will:
# 1. Detect the push (GitHub webhook)
# 2. Build the Docker image (Kaniko in K8s)
# 3. Push to registry (10.34.0.302:5000)
# 4. Deploy to cluster (zero downtime)

# To monitor:
kubectl get pipelineruns -n tekton-pipelines -w
```

---

## 🏗️ How It Works

```
┌─────────────────┐
│ Developer Push  │
│  git push main  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ GitHub Webhook                          │
│ → https://webhook.dev.cerebral.baerautotech.com/ │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ Ingress nginx                           │
│ webhook.dev.cerebral.baerautotech.com   │
└────────┬────────────────────────────────┘
         │ (port 3000)
         ↓
┌─────────────────────────────────────────┐
│ GitHub Webhook Receiver (Rust)          │
│ - Validates GitHub signature            │
│ - Creates Tekton PipelineRun            │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ Tekton Pipeline                         │
│ ├─ Task 1: git-clone                    │
│ ├─ Task 2: kaniko-build                 │
│ └─ Task 3: deploy                       │
└────────┬────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Docker Image Built & Deployed        │
│ Services running in cerebral-platform│
└──────────────────────────────────────┘
```

---

## 🎯 For Different Roles

### 👤 Developer

**What you need to know**:
- Push code: `git push origin main`
- Watch it build: `kubectl get pipelineruns -n tekton-pipelines -w`
- Relax - it's automatic!

**Read**: `CI_CD_COMPLETE_GUIDE.md` (How to use section)

### 🔧 DevOps/Infrastructure

**What you need to know**:
- Webhook receiver runs on port 3000 (NOT 80!)
- Ingress routes to `github-webhook-receiver:3000`
- All config in `k8s/ci-cd/webhook-receiver-ingress.yaml`
- Validate with: `./scripts/validate-webhook-receiver.sh`

**Read**: `WEBHOOK_RECEIVER_CONFIGURATION.md` (Full reference)

### 🤖 AI Agents/Debugging

**What you need to know**:
- System is completely automated (no manual PipelineRuns!)
- DO NOT manually patch ingress
- DO NOT bypass webhook receiver
- DO validate after changes
- DO commit everything to git

**Read**: `.cursor/rules.md` (Quick reference)

---

## 🛠️ Configuration Files (Source of Truth)

### 1. Ingress Configuration
```
k8s/ci-cd/webhook-receiver-ingress.yaml
```
- **What**: Routes webhook.dev.cerebral.baerautotech.com to port 3000
- **When to edit**: If changing webhook URL, port, or certificate
- **How to apply**: `kubectl apply -f k8s/ci-cd/webhook-receiver-ingress.yaml`

### 2. Webhook Receiver Deployment
```
Namespace: tekton-pipelines
Name: github-webhook-receiver
Image: 10.34.0.302:5000/webhook-receiver:latest
Replicas: 2
Port: 3000
```

### 3. Tekton Components
```
Namespace: tekton-pipelines
Pipeline: cerebral-microservice-pipeline
Tasks:
  - git-clone-task
  - kaniko-build-task
  - deploy-task
```

---

## ✅ Validation

**Run this to verify everything is working**:
```bash
./scripts/validate-webhook-receiver.sh
```

**Expected output**:
```
✅ ALL CHECKS PASSED
🌐 Webhook URL: https://webhook.dev.cerebral.baerautotech.com/
📝 GitHub should send push events to the above URL
```

---

## 🔍 Troubleshooting

### Issue: "Connection refused" when accessing webhook URL

**Solution**:
```bash
# Check ingress is routing to port 3000
kubectl get ingress cerebral-github-listener -n cerebral-development -o yaml | grep number

# Should show: number: 3000
# If showing: number: 80, regenerate ingress
kubectl apply -f k8s/ci-cd/webhook-receiver-ingress.yaml
```

### Issue: Webhook not being received

**Debug**:
```bash
# Check webhook receiver logs
kubectl logs -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver -f

# Should show: "POST / - Received webhook"
# If not, check GitHub webhook settings in repository
```

### Issue: Build failed or stuck

**Check**:
```bash
# List builds
kubectl get pipelineruns -n tekton-pipelines

# View logs
kubectl logs -n tekton-pipelines <pipelinerun-name> -f
```

---

## 🚫 What NOT to Do

```bash
# ❌ NEVER manually patch ingress
kubectl patch ingress cerebral-github-listener ...

# ❌ NEVER edit ingress directly
kubectl edit ingress cerebral-github-listener

# ❌ NEVER create PipelineRun manually
kubectl apply -f pipelinerun-manual.yaml

# ❌ NEVER leave config outside git
# Save everything to files, commit to git
```

---

## ✅ What TO Do

```bash
# ✅ Edit config file
vim k8s/ci-cd/webhook-receiver-ingress.yaml

# ✅ Apply from git
kubectl apply -f k8s/ci-cd/webhook-receiver-ingress.yaml

# ✅ Validate changes
./scripts/validate-webhook-receiver.sh

# ✅ Commit to git
git add k8s/ci-cd/webhook-receiver-ingress.yaml
git commit -m "fix: Update webhook ingress configuration"
git push origin main
```

---

## 📊 Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Webhook latency | < 100ms | GitHub → receiver |
| Build time | 2-5 min | Depends on image size |
| Deployment time | 30-60 sec | Rolling update |
| Total pipeline | 3-7 min | Push to production |
| Pod startup | 10-30 sec | Container + health checks |

---

## 🌐 URLs & Endpoints

| Service | URL | Access |
|---------|-----|--------|
| Webhook endpoint | https://webhook.dev.cerebral.baerautotech.com/ | External (GitHub) |
| Internal registry | http://10.34.0.302:5000 | Inside cluster |
| External registry | https://registry.dev.cerebral.baerautotech.com | Outside cluster (HTTPS) |

---

## 📞 Support

### Quick Fixes

1. **Run validation**: `./scripts/validate-webhook-receiver.sh`
2. **Read docs**: `CI_CD_COMPLETE_GUIDE.md`
3. **Check logs**: `kubectl logs -n tekton-pipelines ...`

### Common Issues

| Issue | Command |
|-------|---------|
| Ingress not routing | `kubectl apply -f k8s/ci-cd/webhook-receiver-ingress.yaml` |
| Webhook not received | Check GitHub webhook settings + logs |
| Build failed | `kubectl logs -n tekton-pipelines <pipelinerun-name> -f` |
| Image not in registry | Check Kaniko build logs |

---

## 🎓 Learning Path

1. **You are here**: Read this README (5 min)
2. **Next**: Read `CI_CD_COMPLETE_GUIDE.md` (10 min)
3. **Details**: Read `WEBHOOK_RECEIVER_CONFIGURATION.md` (5 min)
4. **Reference**: Open `.cursor/rules.md` when you need quick lookup

---

## 🎉 Summary

**What We Have**:
- ✅ Fully automated CI/CD pipeline
- ✅ GitHub push triggers builds automatically
- ✅ Tekton handles everything (build, push, deploy)
- ✅ Zero manual intervention needed
- ✅ All configuration in git
- ✅ Validation script prevents reversions

**What Developers Do**:
```bash
git push origin main
# ... automatically builds and deploys
```

**Status**: ✅ Production Ready - Rock Solid

---

## 📋 Files in This System

```
cerebral-deployment/
├── CI_CD_README.md (THIS FILE)
├── CI_CD_COMPLETE_GUIDE.md (Full documentation)
├── WEBHOOK_RECEIVER_CONFIGURATION.md (Config reference)
├── SESSION_COMPLETE_OCTOBER_24.md (What was fixed today)
├── .cursor/rules.md (Cursor quick reference)
├── scripts/
│   └── validate-webhook-receiver.sh (Validation script)
└── k8s/ci-cd/
    └── webhook-receiver-ingress.yaml (SOURCE OF TRUTH)
```

---

**Questions?** Read the documentation files above.  
**Something broken?** Run `./scripts/validate-webhook-receiver.sh` to diagnose.  
**Everything good?** Push code with confidence! ✨

