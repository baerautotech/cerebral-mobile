# 🚀 Traefik Configuration Guide - Cross-Namespace Routing

**Date**: October 25, 2025
**Last Updated**: After webhook 404 fix
**Status**: Production Ready ✅
**Namespace**: `traefik-production`

---

## EXECUTIVE SUMMARY

Traefik is the main ingress controller for Cerebral Platform. It handles:

- ✅ HTTPS/TLS termination for all services
- ✅ Host-based routing (different domains → different services)
- ✅ Cross-namespace service routing (with `allowCrossNamespace=true`)
- ✅ Load balancing across multiple replicas
- ✅ Metrics collection for Prometheus

### Critical Fix Applied (Oct 25, 2025)

Added `--providers.kubernetescrd.allowCrossNamespace=true` to enable webhook routing across namespaces.

---

## INSTALLATION & DEPLOYMENT

### Current Installation

- **Type**: DaemonSet (runs on every node)
- **Replicas**: 7 (one per cluster node)
- **Version**: v3.5.3
- **Image**: `docker.io/traefik:v3.5.3`
- **Deployment**: `/traefik-production` namespace

### Key Deployment Settings

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: traefik
  namespace: traefik-production
spec:
  template:
    spec:
      containers:
        - name: traefik
          image: docker.io/traefik:v3.5.3
          args:
            # Global settings
            - --global.checkNewVersion=true
            - --global.sendAnonymousUsage=false

            # Entry Points (where Traefik listens)
            - --entryPoints.web.address=:8000 # HTTP
            - --entryPoints.websecure.address=:8443 # HTTPS
            - --entryPoints.metrics.address=:9090 # Prometheus

            # HTTP → HTTPS redirect
            - --entryPoints.web.http.redirections.entryPoint.to=websecure
            - --entryPoints.web.http.redirections.entryPoint.scheme=https

            # Providers (what Traefik watches for routing rules)
            - --providers.kubernetescrd # Watch Traefik CRDs
            - --providers.kubernetescrd.allowCrossNamespace=true # ✅ CRITICAL - Enable cross-namespace
            - --providers.kubernetesingress # Watch Kubernetes Ingress resources

            # Metrics
            - --metrics.prometheus.addEntryPointsLabels=true
            - --metrics.prometheus.addServicesLabels=true

            # Logging & Dashboard
            - --log.level=INFO
            - --accesslog=true
            - --api.dashboard=true
            - --api.insecure=false

          ports:
            - containerPort: 8000 # HTTP
              name: http
            - containerPort: 8443 # HTTPS
              name: https
            - containerPort: 9090 # Metrics
              name: metrics
```

---

## ENTRY POINTS EXPLAINED

### web (Port 8000)

- **Protocol**: HTTP
- **Traffic**: Incoming HTTP requests
- **Behavior**: Automatically redirects to HTTPS
- **External**: Exposed by firewall

### websecure (Port 8443)

- **Protocol**: HTTPS/TLS
- **Traffic**: Incoming HTTPS requests (all production traffic)
- **Certificates**: Managed by cert-manager or manual TLS secrets
- **External**: Primary endpoint - firewall routes 443 → 8443

### metrics (Port 9090)

- **Protocol**: HTTP
- **Traffic**: Prometheus metrics scraping
- **Endpoint**: `/metrics`
- **Internal**: Only accessible within cluster

---

## PROVIDERS & RESOURCE DETECTION

### What Traefik Watches

```yaml
--providers.kubernetescrd          # Watch these Kubernetes CRDs:
                                   # - IngressRoute
                                   # - Middleware
                                   # - TLSStore
                                   # - Service (for services referenced by IngressRoute)

--providers.kubernetesingress      # Watch traditional Kubernetes Ingress resources
```

### Cross-Namespace Service References

**Critical Flag**: `--providers.kubernetescrd.allowCrossNamespace=true`

**What it does**:

- Allows IngressRoute in namespace `A` to reference services in namespace `B`
- Default (without flag): Only allows same-namespace references

**Example**:

```yaml
# This IngressRoute is in cerebral-development namespace
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  namespace: cerebral-development
spec:
  routes:
    - match: Host(`webhook.dev.cerebral.baerautotech.com`)
      services:
        - name: github-webhook-receiver
          namespace: tekton-pipelines # ← Different namespace!
          port: 3000
```

**Without flag**: 404 Not Found
**With flag**: ✅ Routes correctly to service

---

## FIREWALL INTEGRATION

### Network Path

```
GitHub Webhook
  ↓ HTTPS/443
  ↓ Public IP: 67.221.99.140
  ↓ Firewall (Meraki n132)
  ↓ NAT Rule: 443 → 10.34.0.246:443
  ↓ Traefik Service (LoadBalancer, IP: 10.34.0.246)
  ↓ Traefik DaemonSet Pods (Port 8443 = HTTPS)
  ↓ IngressRoute matching
  ↓ Service ClusterIP
  ↓ Backend Pods
```

### Required Firewall Configuration

```
NAT Rules:
  Public 443 → Internal 10.34.0.246:443

Port Forwarding:
  (automatically handled by Traefik LoadBalancer Service)

DNS:
  webhook.dev.cerebral.baerautotech.com → 67.221.99.140 (CNAME)
```

---

## TLS/CERTIFICATE MANAGEMENT

### Certificates in Use

| Certificate      | Namespace            | Secret Name      | Domains                          | Issuer        |
| ---------------- | -------------------- | ---------------- | -------------------------------- | ------------- |
| Wildcard Dev     | cerebral-development | dev-wildcard-tls | \*.dev.cerebral.baerautotech.com | Let's Encrypt |
| Prod (if exists) | cert-manager         | prod-tls         | \*.cerebral.baerautotech.com     | Let's Encrypt |

### Certificate Configuration

```yaml
# IngressRoute TLS reference
spec:
  tls:
    secretName: dev-wildcard-tls # Kubernetes Secret
  routes:
    - match: Host(`webhook.dev.cerebral.baerautotech.com`)
      tls: {} # Use entryPoints.websecure TLS
```

### Checking Certificate Status

```bash
# List certificates
kubectl get certificate -n cerebral-development

# Check cert details
kubectl describe certificate dev-wildcard-tls -n cerebral-development

# Check secret
kubectl get secret dev-wildcard-tls -n cerebral-development -o yaml

# Verify cert validity
kubectl get secret dev-wildcard-tls -n cerebral-development -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout
```

---

## CURRENT INGRESSROUTES

### GitHub Webhook Receiver

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: github-webhook-receiver
  namespace: cerebral-development
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`webhook.dev.cerebral.baerautotech.com`)
      services:
        - name: github-webhook-receiver
          namespace: tekton-pipelines # ← Cross-namespace
          port: 3000
  tls:
    secretName: dev-wildcard-tls
```

**Flow**:

1. Webhook arrives on `webhook.dev.cerebral.baerautotech.com:443`
2. Traefik matches Host rule
3. Routes to `github-webhook-receiver` service in `tekton-pipelines` namespace
4. Service LoadBalances to webhook receiver pods on port 3000

---

## ROUTING RULES (TRAEFIK CRD SYNTAX)

### Basic Host Matching

```yaml
routes:
  - match: Host(`example.com`) # Match single host
    services:
      - name: backend-service
        port: 8000

  - match: Host(`*.example.com`) # Match wildcard
    services:
      - name: wildcard-service
        port: 8000

  - match: Host(`api.example.com`) && PathPrefix(`/v1`) # Host AND path
    services:
      - name: api-v1-service
        port: 8000
```

### Service Priority

```yaml
routes:
  - match: Host(`example.com`) && PathPrefix(`/api`)
    services:
      - name: api-service # Primary
        weight: 80
      - name: api-service-backup
        weight: 20 # 20% traffic to backup
```

---

## MONITORING & METRICS

### Prometheus Metrics

Traefik exports metrics on `:9090/metrics`:

```
# HELP traefik_requests_total Total request count
traefik_requests_total{code="200",entrypoint="websecure",method="POST",protocol="http",service="github-webhook-receiver@kubernetescrd"} 1234

# HELP traefik_request_duration_seconds Request duration
traefik_request_duration_seconds_bucket{entrypoint="websecure",service="github-webhook-receiver@kubernetescrd",le="0.1"}
```

### Scraping Config

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik.traefik-production:9090']
```

### Useful Queries

```promql
# Request rate (requests/sec)
rate(traefik_requests_total[5m])

# Error rate (% 5xx responses)
sum(rate(traefik_requests_total{code=~"5.."}[5m])) /
sum(rate(traefik_requests_total[5m]))

# Request duration percentiles
histogram_quantile(0.95, rate(traefik_request_duration_seconds_bucket[5m]))
```

---

## TROUBLESHOOTING

### Issue: 404 Not Found

**Symptoms**: All requests return "404 page not found"

**Causes**:

1. IngressRoute doesn't match the Host header
2. Service referenced in IngressRoute doesn't exist
3. Cross-namespace service reference blocked (missing `allowCrossNamespace=true`)

**Debug**:

```bash
# 1. Check IngressRoute exists
kubectl get ingressroute -A | grep webhook

# 2. View IngressRoute details
kubectl get ingressroute github-webhook-receiver -n cerebral-development -o yaml

# 3. Check service exists
kubectl get svc github-webhook-receiver -n tekton-pipelines

# 4. Check Traefik has cross-namespace flag
kubectl get daemonset traefik -n traefik-production -o yaml | grep allowCrossNamespace
# Should output: --providers.kubernetescrd.allowCrossNamespace=true

# 5. Check Traefik logs
kubectl logs -n traefik-production -l app.kubernetes.io/name=traefik --tail=50 | grep -i error
```

### Issue: TLS Certificate Error

**Symptoms**: `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` or invalid certificate

**Causes**:

1. Certificate expired
2. Wrong certificate for domain
3. TLS secret not found

**Debug**:

```bash
# Check certificate validity
kubectl get certificate -n cerebral-development -o wide

# Check secret exists
kubectl get secret dev-wildcard-tls -n cerebral-development

# Check cert expiration
kubectl get secret dev-wildcard-tls -n cerebral-development -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -dates
```

### Issue: High Latency

**Symptoms**: Requests taking >1 second

**Causes**:

1. Service behind pods are slow
2. Traefik CPU/memory exhausted
3. Network congestion

**Debug**:

```bash
# Check Traefik resource usage
kubectl top pod -n traefik-production

# Check DaemonSet limits
kubectl get daemonset traefik -n traefik-production -o yaml | grep -A 5 "resources:"

# Monitor request latency
kubectl logs -n traefik-production -l app.kubernetes.io/name=traefik --tail=100 | grep duration
```

---

## UPGRADING TRAEFIK

### Rollout Process

```bash
# 1. Edit DaemonSet (change image version)
kubectl edit daemonset traefik -n traefik-production

# Or patch directly:
kubectl patch daemonset traefik -n traefik-production \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"traefik","image":"docker.io/traefik:v3.6.0"}]}}}}'

# 2. Monitor rollout (DaemonSets don't have traditional rollout, but pods will restart)
kubectl get pods -n traefik-production -w

# 3. Verify new version
kubectl get pods -n traefik-production -o jsonpath='{.items[0].spec.containers[0].image}'
```

### Before Upgrading

1. ✅ Check release notes for breaking changes
2. ✅ Test in staging environment first
3. ✅ Backup current DaemonSet: `kubectl get daemonset traefik -n traefik-production -o yaml > traefik-backup.yaml`
4. ✅ Schedule during low-traffic period
5. ✅ Have rollback plan (use backup YAML)

---

## SCALING & HIGH AVAILABILITY

### Current Setup (HA)

- **DaemonSet**: 7 pods (one per node)
- **Service Type**: LoadBalancer
- **Load Balancing**: Round-robin across all pods
- **Pod Disruption**: PodDisruptionBudget ensures availability during upgrades

### If Needed: Scale Horizontally

```yaml
# Convert DaemonSet to Deployment for scale control
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik-production
spec:
  replicas: 3 # Control number of pods
  selector:
    matchLabels:
      app.kubernetes.io/name: traefik
  template:
    # ... (use same pod spec as DaemonSet)
```

---

## COMMANDS REFERENCE

```bash
# Health checks
curl -I https://webhook.dev.cerebral.baerautotech.com/
curl -s http://traefik.traefik-production:9090/metrics | head -20

# View routing rules
kubectl get ingressroutes -A
kubectl get ingressroute github-webhook-receiver -n cerebral-development -o yaml

# Check services
kubectl get svc -n tekton-pipelines -o wide

# Monitor in real-time
kubectl logs -n traefik-production -l app.kubernetes.io/name=traefik -f

# Verify flag is enabled
kubectl get daemonset traefik -n traefik-production -o yaml | grep -i crossnamespace

# Test webhook routing
SECRET=$(kubectl get secret -n tekton-pipelines github-webhook-secret -o jsonpath='{.data.secretToken}' | base64 -d)
PAYLOAD='{"repository":{"name":"test","clone_url":"https://github.com/test","owner":{"name":"test"}},"head_commit":{"id":"abc","modified":["microservices/api/test.py"],"message":"test"},"ref":"refs/heads/main","pusher":{"name":"test"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)
curl -v -X POST https://webhook.dev.cerebral.baerautotech.com/ \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

---

## SUMMARY

**Traefik Configuration (Oct 25, 2025)**:

- ✅ DaemonSet with 7 replicas
- ✅ Listens on 8000 (HTTP) → 8443 (HTTPS)
- ✅ Watches Traefik CRDs and Kubernetes Ingress resources
- ✅ **CRITICAL**: `allowCrossNamespace=true` enabled
- ✅ Routes webhooks to receiver service across namespaces
- ✅ Handles TLS/certificates automatically
- ✅ Exports Prometheus metrics
- ✅ All systems fully operational

**Status**: 🟢 PRODUCTION READY
