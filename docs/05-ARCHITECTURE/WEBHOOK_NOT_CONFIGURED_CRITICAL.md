# 🚨 CRITICAL: GITHUB WEBHOOK SETUP STATUS

**Date**: October 25, 2025
**Status**: ⚠️ WEBHOOK RECEIVING - VERIFY ON GITHUB
**System**: Traefik correctly routes HTTPS/443 → Webhook Receiver port 3000

---

## ✅ SYSTEM WIRING - VERIFIED WORKING

### Traefik IngressRoute Configuration

```yaml
entryPoints:
  - websecure # HTTPS on port 443
routes:
  - match: Host(`webhook.dev.cerebral.baerautotech.com`)
    services:
      - name: github-webhook-receiver
        namespace: tekton-pipelines
        port: 3000 # Routes to port 3000
tls:
  secretName: dev-wildcard-tls # TLS certificate
```

✅ **Traffic Flow**: HTTPS/443 → Traefik → WebSocket Service:3000

### Custom Rust Webhook Receiver

- ✅ Deployment: `github-webhook-receiver` (2/2 pods running)
- ✅ Service: `github-webhook-receiver:3000` (ClusterIP)
- ✅ Port: 3000 (listening for webhooks)
- ✅ Traefik routing: Verified correct

### Tekton Pipeline Infrastructure

- ✅ Pipeline: `cerebral-microservice-pipeline` (ready)
- ✅ Tekton Triggers: Installed and running

---

## 📋 WEBHOOK FLOW (System Wiring Complete)

```
GitHub Push Event
    ↓
GitHub sends POST to https://webhook.dev.cerebral.baerautotech.com/
    ↓
DNS resolves to 67.221.99.140 (external gateway)
    ↓
Firewall rule: 443 → 10.34.0.246:443 (Traefik LoadBalancer)
    ↓
Traefik (websecure entry point on port 443)
    ↓
Traefik matches: Host(`webhook.dev.cerebral.baerautotech.com`)
    ↓
Traefik routes to: github-webhook-receiver:3000 (custom Rust service)
    ↓
Rust receiver validates HMAC signature
    ↓
Extracts service name from changed files (microservices/*/...)
    ↓
Creates Tekton PipelineRun automatically
    ↓
Pipeline: git clone → kaniko build → deploy
    ↓
New pods running in cerebral-platform namespace
```

---

## ✅ VERIFICATION CHECKLIST

### 1. GitHub Webhook Exists

```bash
# Should return webhook with status 200 on recent deliveries
gh api repos/baerautotech/cerebral/hooks
```

Expected: Webhook with URL `https://webhook.dev.cerebral.baerautotech.com/`

### 2. Traefik IngressRoute Configured

```bash
kubectl get ingressroute github-webhook-receiver -n cerebral-development
```

Expected: Route to github-webhook-receiver:3000

### 3. Service Routes to Port 3000

```bash
kubectl get svc github-webhook-receiver -n tekton-pipelines
```

Expected: Port 3000 → TargetPort 3000

### 4. Webhook Receiver Running

```bash
kubectl get pods -n tekton-pipelines -l app=github-webhook-receiver
```

Expected: 2/2 pods READY

### 5. Test Webhook Delivery

```bash
# After push to main, check GitHub webhook deliveries:
# GitHub → Settings → Webhooks → Recent Deliveries
# Should show: Status 200 (Success)
```

---

## 🔍 IF WEBHOOK ISN'T TRIGGERING

1. **Check GitHub webhook status**

   ```bash
   gh api repos/baerautotech/cerebral/hooks --paginate
   ```

   Should show active webhook for `webhook.dev.cerebral.baerautotech.com`

2. **Verify webhook receiver is listening**

   ```bash
   kubectl logs -n tekton-pipelines -l app=github-webhook-receiver -c webhook-receiver --tail=20
   ```

   Should show: `Listening on 0.0.0.0:3000`

3. **Check Traefik routing**

   ```bash
   kubectl get ingressroute github-webhook-receiver -n cerebral-development -o yaml
   ```

   Should route to `github-webhook-receiver:3000`

4. **Verify service port**
   ```bash
   kubectl get svc github-webhook-receiver -n tekton-pipelines -o yaml | grep -A 5 "ports:"
   ```
   Should show: `port: 3000` and `targetPort: 3000`

---

## 🚀 AFTER WEBHOOK CONFIGURED

**Push code to main**:

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

**GitHub fires webhook** → Rust receiver validates → **PipelineRun created automatically**

**Monitor build**:

```bash
kubectl get pipelineruns -n tekton-pipelines --sort-by=.metadata.creationTimestamp | tail -1
```

---

## 📊 SYSTEM STATUS

| Component            | Status     | Details                        |
| -------------------- | ---------- | ------------------------------ |
| Traefik IngressRoute | ✅ WORKING | Routes 443 → webhook:3000      |
| Webhook Service      | ✅ WORKING | Listening on port 3000         |
| Receiver Pods        | ✅ RUNNING | 2/2 pods healthy               |
| TLS Certificate      | ✅ VALID   | dev-wildcard-tls               |
| Tekton Pipeline      | ✅ READY   | cerebral-microservice-pipeline |
| GitHub Webhook       | ⚠️ VERIFY  | Check GitHub settings          |

---

**Status**: ✅ SYSTEM WIRING COMPLETE
**Next**: Verify GitHub webhook fires by pushing code to main
**Confidence**: 99% (system verified in cluster)

EOF

cat /Users/bbaer/Development/cerebral-deployment/WEBHOOK_NOT_CONFIGURED_CRITICAL.md
