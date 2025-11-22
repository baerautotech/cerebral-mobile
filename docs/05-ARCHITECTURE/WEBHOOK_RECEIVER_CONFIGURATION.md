# GitHub Webhook Receiver Configuration

**CRITICAL**: This document explains the PERMANENT configuration. If something is broken, start here.

## Architecture

```
GitHub Push Event
    ↓
GitHub Webhook (HTTPS)
    ↓
Ingress nginx (webhook.dev.cerebral.baerautotech.com)
    ↓
github-webhook-receiver Service (port 3000) ⚠️ PORT 3000, NOT 80!
    ↓
github-webhook-receiver Pod (Rust service listening on :3000)
    ↓
Creates Tekton PipelineRun
    ↓
Tekton Pipeline: [git-clone] → [kaniko-build] → [deploy]
```

## Source of Truth

**DO NOT** manually patch the ingress in the cluster. The source of truth is:

```
k8s/ci-cd/webhook-receiver-ingress.yaml
```

This file is committed to git. If the ingress ever reverts, regenerate it:

```bash
kubectl apply -f k8s/ci-cd/webhook-receiver-ingress.yaml
```

## Critical Configuration

### Ingress

- **Name**: `cerebral-github-listener`
- **Namespace**: `cerebral-development`
- **Host**: `webhook.dev.cerebral.baerautotech.com`
- **Backend Service**: `github-webhook-receiver` (in `tekton-pipelines` namespace)
- **Backend Port**: `3000` ⚠️ **NOT 80** - this is where the Rust service listens
- **TLS Certificate**: `dev-wildcard-tls`

### Webhook Receiver Deployment

- **Namespace**: `tekton-pipelines`
- **Name**: `github-webhook-receiver`
- **Replicas**: 2
- **Image**: `10.34.0.202:5000/webhook-receiver:latest`
- **Port**: `3000` (Rust service listening port)
- **Environment Variables**:
  - `PORT=3000`
  - `GITHUB_WEBHOOK_SECRET` (from `github-webhook-secret` secret)
  - `KUBE_NAMESPACE=tekton-pipelines`

### GitHub Webhook Configuration

Set in GitHub repository settings → Webhooks:

- **Payload URL**: `https://webhook.dev.cerebral.baerautotech.com/`
- **Content type**: `application/json`
- **Secret**: Must match value in `k8s/secrets/github-webhook-secret.sealed.yaml`
- **Events**: Push events only
- **Active**: Yes

## Common Issues & Fixes

### Issue: Ingress keeps reverting to port 80

**Cause**: Someone ran `kubectl apply` with old configuration that had port 80.

**Fix**:

1. Edit `k8s/ci-cd/webhook-receiver-ingress.yaml` (ensure port is 3000)
2. Commit to git
3. Run: `kubectl apply -f k8s/ci-cd/webhook-receiver-ingress.yaml`

### Issue: Webhook not being received

**Debug Steps**:

```bash
# 1. Check ingress is routing correctly
kubectl get ingress cerebral-github-listener -n cerebral-development -o yaml

# 2. Check webhook receiver pods are running
kubectl get pods -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver

# 3. Check logs for incoming webhooks
kubectl logs -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver -f

# 4. Test the webhook endpoint from inside cluster
kubectl run -it --rm test-curl --image=curlimages/curl --restart=Never -- \
  curl -X POST -H "Content-Type: application/json" \
  -d '{"test":"payload"}' \
  http://github-webhook-receiver.tekton-pipelines.svc.cluster.local:3000/
```

### Issue: "Connection refused" when accessing webhook.dev.cerebral.baerautotech.com

**Cause**: Ingress routing to wrong port (probably 80 instead of 3000)

**Fix**: Regenerate the ingress

```bash
kubectl apply -f k8s/ci-cd/webhook-receiver-ingress.yaml
```

## Verification Checklist

- [ ] Ingress has backend port 3000 (not 80)
- [ ] Webhook receiver deployment has PORT=3000
- [ ] Service targets port 3000
- [ ] GitHub webhook URL is https://webhook.dev.cerebral.baerautotech.com/
- [ ] GitHub webhook secret matches cluster secret
- [ ] TLS certificate (dev-wildcard-tls) is valid

## Permanent Solution

The permanent solution to prevent reversion:

1. **Git is the source of truth**: `k8s/ci-cd/webhook-receiver-ingress.yaml`
2. **Apply from git**: Always use `kubectl apply -f k8s/ci-cd/webhook-receiver-ingress.yaml`
3. **Never manually patch**: Avoid `kubectl patch` or `kubectl edit`
4. **CI/CD automation**: Configure a GitOps tool (ArgoCD/Flux) to enforce the git state

## References

- GitHub webhook receiver: `deployment/github-webhook-receiver` (tekton-pipelines namespace)
- Ingress definition: `k8s/ci-cd/webhook-receiver-ingress.yaml`
- Secret: `github-webhook-secret` (tekton-pipelines namespace)
- Tekton pipeline: `cerebral-microservice-pipeline` (tekton-pipelines namespace)
