# Cerebral Platform - CI/CD System Rules

## 🏗️ CI/CD Architecture (CRITICAL)

**The System**: Tekton Pipelines + Custom Rust Webhook Receiver

Flow: `Git Push → GitHub Webhook → Ingress → Webhook Receiver → Tekton → Build → Deploy`

**Key Components**:
- Webhook Receiver: Rust service, 2 replicas, listening on PORT 3000
- Ingress: webhook.dev.cerebral.baerautotech.com → port 3000
- Tekton Pipeline: 3 tasks (git-clone → kaniko-build → deploy)
- Registry: 10.34.0.302:5000 (internal HTTP)
- Build: Kaniko builds inside Kubernetes

## ⚙️ Configuration Files (SOURCE OF TRUTH)

- `k8s/ci-cd/webhook-receiver-ingress.yaml` (INGRESS CONFIG)
- `CI_CD_COMPLETE_GUIDE.md` (Complete system guide)
- `WEBHOOK_RECEIVER_CONFIGURATION.md` (Config reference)
- `scripts/validate-webhook-receiver.sh` (Validation)

## 🚫 CRITICAL RULES

**DO NOT**:
- kubectl patch the ingress
- kubectl edit the ingress  
- Leave config outside git
- Bypass webhook receiver
- Change port from 3000

**DO**:
- Edit YAML files, then kubectl apply -f
- Run: ./scripts/validate-webhook-receiver.sh
- Commit all changes to git
- Let automation work

## 📚 Documentation

Read: CI_CD_COMPLETE_GUIDE.md first!

## ✅ Status: Production Ready
