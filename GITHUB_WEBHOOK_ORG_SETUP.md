# 🚨 GitHub Organization-Level Webhook Configuration

**CRITICAL**: This is the ONLY correct way to configure webhooks for Cerebral Platform CI/CD.

**Last Updated**: October 25, 2025
**Scope**: `baerautotech` organization
**Status**: Organization-level webhook must be configured by org admins

---

## WHAT THIS IS

This document explains how GitHub organization-level webhooks are configured for the Cerebral Platform's CI/CD system.

**⚠️ DO NOT create repo-level webhooks** - they will NOT work and will conflict with the organization webhook.

---

## Organization-Level Webhook Configuration

### Location
- **GitHub UI**: Organization Settings → Webhooks  
- **Configured By**: Organization owners/admins (requires `admin:org_hook` scope)
- **Scope**: Applies to ALL repositories in the organization

### Settings

**Payload URL**: `https://webhook.dev.cerebral.baerautotech.com/`

**Content Type**: `application/json`

**Secret**: Must match the Kubernetes secret in the cluster
```bash
kubectl get secret -n tekton-pipelines github-webhook-secret -o jsonpath='{.data.secretToken}' | base64 -d
```

**Events to trigger on**:
- ✅ `push`
- ✅ `pull_request`
- (Only `push` to `main` branch actually triggers builds)

**Active**: ✅ Yes

**SSL verification**: ✅ Enabled

---

## How It Works

### Flow

```
1. Developer pushes code to ANY repo in baerautotech org
   ↓
2. GitHub sends POST to organization webhook endpoint
   → https://webhook.dev.cerebral.baerautotech.com/
   ↓
3. Firewall NAT: 443 → 10.34.0.246 (Traefik LoadBalancer)
   ↓
4. Traefik routes to: github-webhook-receiver service (port 3000)
   ↓
5. Rust receiver validates HMAC-SHA256 signature
   ↓
6. Receiver extracts service name from modified files
   ↓
7. IF code in microservices/ directory:
      → Create Tekton PipelineRun
      → Kaniko builds
      → Deploy
   ↓
   ELSE (docs/tests/root changes only):
      → Return 200 OK (webhook received but no action)
```

### Why Organization-Level?

**Advantages**:
- ✅ Single webhook configuration for ALL repos
- ✅ No per-repo duplicates or conflicts
- ✅ Consistent secret management across all repos
- ✅ Easy to enable new repositories

**Disadvantages of repo-level** (what we DON'T do):
- ❌ Requires webhook setup in each repo separately
- ❌ Multiple webhook attempts to same endpoint causes 404 errors
- ❌ Harder to maintain consistent secret across repos
- ❌ Conflicts with org-level webhook if both exist

---

## Kubernetes Infrastructure

### Receiving End

**Deployment**: `github-webhook-receiver`
- **Namespace**: `tekton-pipelines`
- **Replicas**: 2 (for HA)
- **Port**: 3000
- **Image**: `10.34.0.202:5000/webhook-receiver:latest` (Rust binary)

### Secret Storage

```bash
# Kubernetes secret
kubectl get secret github-webhook-secret -n tekton-pipelines -o yaml

# Contains:
data:
  secretToken: <base64-encoded-64-character-secret>
```

### Networking

```bash
# IngressRoute (Traefik)
kubectl get ingressroute github-webhook-receiver -n cerebral-development

# Routes:
# Host: webhook.dev.cerebral.baerautotech.com
# Protocol: HTTPS (websecure entry point)
# Port: 443 → Traefik → Service:3000
# TLS: dev-wildcard-tls certificate
```

### Service

```bash
kubectl get svc github-webhook-receiver -n tekton-pipelines

# ClusterIP: 10.100.43.113
# Port: 3000
# Targets: Receiver pods (2 replicas)
```

---

## How Receiver Works

### Rust Webhook Receiver (`/app/github-webhook-receiver` binary)

**Purpose**: Validate GitHub webhooks and create Tekton PipelineRuns

**Process**:

1. **Receives POST** to `https://webhook.dev.cerebral.baerautotech.com/`
   - Accepts both `/` and `/webhook` paths
   - Rejects anything else with 404

2. **Validates Signature**
   - Extracts `X-Hub-Signature-256` header
   - Computes HMAC-SHA256 using secret from env var
   - Constant-time comparison to prevent timing attacks
   - Returns 401 if invalid

3. **Parses Payload**
   - Expects GitHub push webhook format
   - Extracts:
     - Repository name
     - Branch (ref)
     - Modified files
     - Commit ID
     - Pusher name

4. **Extracts Service Name**
   - Looks for files in `microservices/*/`
   - Skips documentation-only changes (.md, .txt, .pdf, etc.)
   - Extracts service name from path: `microservices/{SERVICE_NAME}/`
   - Returns 200 OK with "no action" message if no code changes

5. **Creates PipelineRun**
   - If valid microservice code found:
     - Generates unique PipelineRun name
     - Sets parameters (repo-url, image-name, etc.)
     - Runs `kubectl apply` to create PipelineRun
     - Returns 202 ACCEPTED with PipelineRun name

6. **Tekton Executes**
   - PipelineRun: git-clone → kaniko-build → deploy
   - Kaniko builds image and pushes to registry
   - Deploy task updates Kubernetes deployment
   - Pod rolling update completes

---

## Debugging

### Check Organization Webhook Status

```bash
# Requires admin:org_hook scope
gh api orgs/baerautotech/hooks
```

### Check Receiver Status

```bash
# Verify pods are running
kubectl get pods -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver

# Check logs for webhook receipt
kubectl logs -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver -f

# Look for messages like:
# "Webhook receiver listening on port 3000"
# "Processing webhook for microservice build"
# "PipelineRun created"
```

### Test Webhook Manually

```bash
SECRET=$(kubectl get secret -n tekton-pipelines github-webhook-secret -o jsonpath='{.data.secretToken}' | base64 -d)
PAYLOAD='{"repository":{"name":"cerebral","clone_url":"https://github.com/baerautotech/cerebral.git","owner":{"name":"baerautotech"}},"head_commit":{"id":"abc123","message":"test","modified":["microservices/api-gateway/test.py"]},"ref":"refs/heads/main","pusher":{"name":"test"}}'

SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

curl -X POST https://webhook.dev.cerebral.baerautotech.com/ \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"

# Should return 202 ACCEPTED with PipelineRun details
```

### Check PipelineRun

```bash
# List recent PipelineRuns
kubectl get pipelineruns -n tekton-pipelines --sort-by='.metadata.creationTimestamp' | tail -5

# Describe specific PipelineRun
kubectl describe pipelinerun <name> -n tekton-pipelines

# Check logs
kubectl logs -n tekton-pipelines <pipelinerun-name>
```

---

## Common Issues & Solutions

### Issue: Webhook returns 404

**Cause**: GitHub is sending to wrong endpoint or route not configured

**Solution**:
1. Verify org webhook URL is exactly: `https://webhook.dev.cerebral.baerautotech.com/`
2. Check Traefik IngressRoute exists: `kubectl get ingressroute github-webhook-receiver -n cerebral-development`
3. Test endpoint: `curl -I https://webhook.dev.cerebral.baerautotech.com/health`

### Issue: Webhook returns 401

**Cause**: HMAC signature validation failed

**Solution**:
1. Verify org webhook secret matches cluster secret
2. Check if secret was recently rotated
3. Regenerate if mismatch: `kubectl delete secret github-webhook-secret -n tekton-pipelines` (will be recreated from org setting)

### Issue: Webhook returns 200 but no PipelineRun

**Cause**: No code changes in microservices/ (only docs)

**Solution**: This is NORMAL and EXPECTED
- Check receiver logs: `kubectl logs -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver`
- Look for message: "No buildable changes detected"
- Only commits modifying files in `microservices/*/` create PipelineRuns

### Issue: No webhook received at all

**Cause**: Org webhook not configured or GitHub not sending

**Solution**:
1. Ask org admin to verify webhook is configured in GitHub
2. Check webhook delivery history in GitHub UI (Settings → Webhooks → Recent Deliveries)
3. Verify endpoint is reachable: test with manual POST
4. Check pod logs during push: `kubectl logs -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver -f`

---

## Maintenance

### Rotating the Secret

When rotating the webhook secret:

1. **Update GitHub org webhook**: Set new secret in GitHub settings
2. **Update Kubernetes secret**:
   ```bash
   kubectl patch secret github-webhook-secret -n tekton-pipelines \
     --type merge -p '{"data":{"secretToken":"<base64-new-secret>"}}'
   ```
3. **Restart receiver pods**:
   ```bash
   kubectl rollout restart deployment/github-webhook-receiver -n tekton-pipelines
   ```
4. **Verify**:
   ```bash
   kubectl logs -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver -f
   ```

### Checking Current Secret

```bash
# View (base64 encoded)
kubectl get secret github-webhook-secret -n tekton-pipelines -o jsonpath='{.data.secretToken}'

# Decode to plaintext
kubectl get secret github-webhook-secret -n tekton-pipelines -o jsonpath='{.data.secretToken}' | base64 -d
```

---

## 🚨 CRITICAL RULES

1. ✅ **DO** configure webhook at **ORGANIZATION-LEVEL**
2. ✅ **DO** use HTTPS endpoint: `https://webhook.dev.cerebral.baerautotech.com/`
3. ✅ **DO** match the Kubernetes secret exactly
4. ❌ **DON'T** create repo-level webhooks (they conflict)
5. ❌ **DON'T** create multiple org webhooks
6. ❌ **DON'T** modify the receiver endpoint path (it's `/` and `/webhook`)
7. ❌ **DON'T** change the receiver port without updating Traefik/Service

---

## Quick Reference

```bash
# All commands for CI/CD webhook system

# Receiver status
kubectl get pods -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver

# Receiver logs (real-time)
kubectl logs -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver -f

# Traefik route
kubectl get ingressroute github-webhook-receiver -n cerebral-development

# Service endpoints
kubectl get endpoints -n tekton-pipelines | grep webhook

# Recent PipelineRuns
kubectl get pipelineruns -n tekton-pipelines --sort-by='.metadata.creationTimestamp' | tail

# Pipeline definition
kubectl get pipeline cerebral-microservice-pipeline -n tekton-pipelines -o yaml

# Secret (encoded)
kubectl get secret github-webhook-secret -n tekton-pipelines -o jsonpath='{.data.secretToken}'

# Secret (decoded)
kubectl get secret github-webhook-secret -n tekton-pipelines -o jsonpath='{.data.secretToken}' | base64 -d
```

---

**This is the DEFINITIVE guide for GitHub organization webhook configuration.**  
**No other method will work for Cerebral Platform CI/CD.**
