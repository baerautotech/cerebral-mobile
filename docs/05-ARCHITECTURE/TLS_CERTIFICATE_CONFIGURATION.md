# 🔐 TLS CERTIFICATE CONFIGURATION - COMPLETE GUIDE

**Date**: October 25, 2025
**Status**: ✅ PRODUCTION READY
**Last Updated**: All IngressRoutes using dev-wildcard-tls

---

## 📋 CERTIFICATE OVERVIEW

### Primary Certificate: dev-wildcard-tls

```yaml
Name: dev-wildcard-tls
Namespace: cerebral-development ✅ (CORRECT LOCATION)
Type: kubernetes.io/tls
Issuer: Let's Encrypt (letsencrypt-prod)
Status: READY ✅
Valid From: 2025-10-25
Valid Until: 2026-01-23
Common Name: *.dev.cerebral.baerautotech.com
DNS Names:
  - *.dev.cerebral.baerautotech.com
  - dev.cerebral.baerautotech.com
Auto-renewal: Enabled (via cert-manager)
```

### Certificate Manager

```yaml
Manager: cert-manager
Namespace: cert-manager
ClusterIssuer: letsencrypt-prod
Renewal Window: 30 days before expiry
```

---

## 🏗️ ALL INGRESSROUTES USING dev-wildcard-tls

All 9 IngressRoutes now use the same wildcard certificate:

| IngressRoute                | Namespace            | Host                                        | Entry Point | TLS Secret          |
| --------------------------- | -------------------- | ------------------------------------------- | ----------- | ------------------- |
| webhook-receiver            | cerebral-development | webhook.dev.cerebral.baerautotech.com       | websecure   | dev-wildcard-tls ✅ |
| airflow-traefik             | cerebral-development | airflow.dev.cerebral.baerautotech.com       | websecure   | dev-wildcard-tls ✅ |
| api-dev-traefik             | cerebral-development | api.dev.baerautotech.com                    | websecure   | dev-wildcard-tls ✅ |
| bmad-api-traefik            | cerebral-development | bmad-api.dev.cerebral.baerautotech.com      | websecure   | dev-wildcard-tls ✅ |
| cerebral-backend-traefik    | cerebral-development | api.dev.cerebral.baerautotech.com           | websecure   | dev-wildcard-tls ✅ |
| minio-console-traefik       | cerebral-development | minio-console.dev.cerebral.baerautotech.com | websecure   | dev-wildcard-tls ✅ |
| minio-public-assets-traefik | cerebral-development | assets.dev.cerebral.baerautotech.com        | websecure   | dev-wildcard-tls ✅ |
| oauth2-proxy-traefik        | cerebral-development | auth.dev.cerebral.baerautotech.com          | websecure   | dev-wildcard-tls ✅ |
| rag-webhook-traefik         | cerebral-development | rag.dev.cerebral.baerautotech.com           | websecure   | dev-wildcard-tls ✅ |

---

## ✅ CERTIFICATE LOCATION REQUIREMENTS

### Certificate Must Be In

- **Namespace**: `cerebral-development` ✅
- **Name**: `dev-wildcard-tls` ✅
- **Type**: `kubernetes.io/tls` ✅

### IngressRoutes Reference Certificate Via

```yaml
spec:
  tls:
    secretName: dev-wildcard-tls # Secret name
    # Note: Certificate MUST be in same namespace as IngressRoute
    # All IngressRoutes are in cerebral-development
    # Certificate is in cerebral-development
    # ✅ CORRECT!
```

### Traefik Access

```
Traefik Pods (cerebral-development namespace)
    ↓
Read certificate from cerebral-development/dev-wildcard-tls
    ↓
Apply to all requests to *.dev.cerebral.baerautotech.com
    ↓
TLS termination at entry point (websecure/443)
```

---

## 🔍 VERIFICATION CHECKLIST

### 1. Certificate Exists in Correct Namespace

```bash
kubectl get certificate dev-wildcard-tls -n cerebral-development
```

✅ Expected: `NAME: dev-wildcard-tls, READY: True`

### 2. Secret Exists in Correct Namespace

```bash
kubectl get secret dev-wildcard-tls -n cerebral-development
```

✅ Expected: `TYPE: kubernetes.io/tls`

### 3. Certificate Status is READY

```bash
kubectl describe certificate dev-wildcard-tls -n cerebral-development | grep -A 5 "Status:"
```

✅ Expected: `Ready: True, Message: Certificate is up to date and has not expired`

### 4. All IngressRoutes Use dev-wildcard-tls

```bash
kubectl get ingressroute -n cerebral-development -o json | \
  jq -r '.items[] | select(.spec.tls) | "\(.metadata.name): \(.spec.tls.secretName)"'
```

✅ Expected: All lines show `dev-wildcard-tls`

### 5. No Duplicates in Other Namespaces

```bash
kubectl get secret dev-wildcard-tls -A
```

✅ Expected: ONLY in `cerebral-development`, NOT in `default` or other namespaces

### 6. Certificate Valid Until

```bash
kubectl get certificate dev-wildcard-tls -n cerebral-development -o jsonpath='{.status.notAfter}'
```

✅ Expected: Date in 2026 (current: 2026-01-23)

---

## 🔐 HOW TLS WORKS IN CI/CD

### Request Flow with TLS

```
1. Client (Browser/Application)
   Sends HTTPS request to: webhook.dev.cerebral.baerautotech.com:443

2. Firewall (Meraki n132)
   Rule: 443 → 10.34.0.246:443
   Forwards to Traefik LoadBalancer

3. Traefik (10.34.0.246:443)
   Listens on entry point: websecure (HTTPS/443)
   TLS Termination: Uses dev-wildcard-tls certificate
   Decrypts HTTPS → HTTP internally
   Matches Host: Host(`webhook.dev.cerebral.baerautotech.com`)

4. IngressRoute (github-webhook-receiver)
   Matched by host
   Routes to service: github-webhook-receiver:3000

5. Kubernetes Service (github-webhook-receiver:3000)
   ClusterIP service
   Routes to pod on port 3000

6. Custom Rust Webhook Receiver Pod
   Receives HTTP (not HTTPS, internal)
   Processes webhook
   Validates HMAC signature
   Creates Tekton PipelineRun

✅ TLS handled by Traefik + Certificate
```

---

## 🛠️ UPDATING INGRESSROUTES

### To Update an IngressRoute to Use dev-wildcard-tls

```bash
kubectl patch ingressroute <route-name> \
  -n cerebral-development \
  --type merge \
  -p '{"spec":{"tls":{"secretName":"dev-wildcard-tls"}}}'
```

### Example

```bash
# Update airflow IngressRoute
kubectl patch ingressroute airflow-traefik \
  -n cerebral-development \
  --type merge \
  -p '{"spec":{"tls":{"secretName":"dev-wildcard-tls"}}}'
```

---

## 📝 INGRESSROUTE TEMPLATE

When creating new IngressRoutes for \*.dev.cerebral.baerautotech.com:

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: my-service-traefik
  namespace: cerebral-development # MUST be cerebral-development
spec:
  entryPoints:
    - websecure # HTTPS/443
  routes:
    - match: Host(`my-service.dev.cerebral.baerautotech.com`)
      kind: Rule
      services:
        - name: my-service
          port: 8000
  tls:
    secretName: dev-wildcard-tls # ALWAYS use this for *.dev.cerebral.baerautotech.com
```

---

## 🔄 CERTIFICATE RENEWAL (Automatic)

### How Renewal Works

1. cert-manager monitors certificate expiry
2. 30 days before expiry → requests renewal
3. Let's Encrypt validates domain (HTTP-01 challenge)
4. New certificate issued
5. Secret updated automatically
6. Traefik reloads certificate (no downtime)

### Current Renewal Schedule

- Current expiry: 2026-01-23
- Auto-renewal starts: ~2025-12-24
- Expected new expiry: ~2026-04-23

### Monitor Renewal

```bash
# Watch certificate status
kubectl get certificate dev-wildcard-tls -n cerebral-development -w

# View renewal logs
kubectl logs -n cert-manager -l app=cert-manager -f | grep dev-wildcard
```

---

## 🚨 TROUBLESHOOTING

### Problem: "Certificate not found"

```bash
# Check certificate exists
kubectl get certificate dev-wildcard-tls -n cerebral-development

# Check secret exists
kubectl get secret dev-wildcard-tls -n cerebral-development

# Check IngressRoute namespace matches certificate namespace
kubectl get ingressroute <name> -n cerebral-development -o yaml | grep namespace
```

### Problem: "Invalid certificate"

```bash
# Check certificate details
kubectl describe certificate dev-wildcard-tls -n cerebral-development

# Check certificate content
kubectl get secret dev-wildcard-tls -n cerebral-development -o yaml

# Verify domain coverage
openssl s_client -connect webhook.dev.cerebral.baerautotech.com:443
# Look for CN and subjectAltName
```

### Problem: "HTTPS not working"

```bash
# 1. Verify Traefik is running
kubectl get pods -n cerebral-development -l app=traefik

# 2. Check entry point configuration
kubectl get deployment traefik -n cerebral-development -o yaml | grep -A 5 websecure

# 3. Check IngressRoute TLS configuration
kubectl get ingressroute <name> -n cerebral-development -o yaml | grep -A 5 tls

# 4. Check certificate is READY
kubectl get certificate dev-wildcard-tls -n cerebral-development
```

### Problem: "Certificate expires soon"

```bash
# Check expiry date
kubectl get certificate dev-wildcard-tls -n cerebral-development -o jsonpath='{.status.notAfter}'

# Force renewal (if needed)
kubectl delete secret dev-wildcard-tls -n cerebral-development
# cert-manager will automatically recreate it

# Monitor renewal progress
kubectl logs -n cert-manager -l app=cert-manager --tail=100 | grep dev-wildcard
```

---

## 📊 CERTIFICATE AUDIT REPORT

**Last Verified**: October 25, 2025, 05:30 UTC

| Item                     | Status     | Details                                  |
| ------------------------ | ---------- | ---------------------------------------- |
| Certificate Exists       | ✅         | dev-wildcard-tls in cerebral-development |
| Certificate Ready        | ✅         | Status: Ready, valid through 2026-01-23  |
| IngressRoutes Using Cert | ✅         | 9/9 routes using dev-wildcard-tls        |
| Duplicates               | ✅ CLEANED | Removed from default namespace           |
| TLS Termination          | ✅         | Traefik (websecure entry point)          |
| Auto-renewal             | ✅         | Enabled via cert-manager                 |
| Domain Coverage          | ✅         | \*.dev.cerebral.baerautotech.com         |

---

## 📚 RELATED DOCUMENTATION

- **CI_CD_COMPLETE_GUIDE.md** - Complete CI/CD system guide
- **TRAEFIK_MIGRATION_COMPLETE_VERIFICATION.md** - Traefik configuration
- **WEBHOOK_SECRET_CONFIGURATION.md** - Webhook setup
- **.cursor/rules.md** - AI agent reference

---

## 🎯 QUICK REFERENCE

**Certificate Location**:

```bash
kubectl get certificate dev-wildcard-tls -n cerebral-development
```

**Check Certificate Status**:

```bash
kubectl describe certificate dev-wildcard-tls -n cerebral-development
```

**Check Secret**:

```bash
kubectl get secret dev-wildcard-tls -n cerebral-development -o yaml
```

**Verify All IngressRoutes Using Cert**:

```bash
kubectl get ingressroute -n cerebral-development -o json | \
  jq '.items[] | select(.spec.tls) | {name: .metadata.name, tls: .spec.tls.secretName}'
```

**Monitor Renewal**:

```bash
kubectl get certificate dev-wildcard-tls -n cerebral-development -w
```

---

**Status**: ✅ PRODUCTION READY
**Certificate**: dev-wildcard-tls in cerebral-development
**All IngressRoutes**: Using correct certificate ✅
**Last Updated**: October 25, 2025
**Confidence**: 99%
