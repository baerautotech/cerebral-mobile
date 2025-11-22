# 🔥 Firewall ↔ Traefik Port Mapping Analysis

**Date**: October 25, 2025
**Status**: ⚠️ PARTIAL - Some mappings need Traefik entry points

## 📋 Current Firewall Rules (67.221.99.140)

| Description | Protocol | Public Port | LAN IP | Local Port | Status |
|---|---|---|---|---|---|
| redis-token-external | TCP | 6385 | 10.34.0.201 | 6385 | ✅ Direct (not Traefik) |
| HTTP | TCP | 80 | 10.34.0.246 | 80 | ⚠️ Traefik but wrong config |
| HTTPS | TCP | 443 | 10.34.0.246 | 443 | ✅ Correct - Traefik primary |
| redis-tls-external | TCP | 6380 | 10.34.0.203 | 6380 | ✅ Direct (not Traefik) |
| s3-vector-proxy-service | TCP | 9000 | 10.34.0.240 | 9000 | ⚠️ Wrong IP (should be .246) |
| minio-console-service | TCP | 9001 | 10.34.0.204 | 9001 | ⚠️ Wrong IP (should be .246) |
| internal-registry | TCP | 5000 | 10.34.0.202 | 5000 | ✅ Direct (not Traefik) |
| github-webhook-handle | TCP | 8080 | 10.34.0.240 | 8080 | ⚠️ Wrong (should be 443→.246) |

## 🎯 WHAT NEEDS TO BE CONFIGURED IN TRAEFIK

### ✅ ALREADY CORRECT (No Changes Needed)

1. **HTTPS (Port 443) - CORRECT**
   - Public Port: 443
   - LAN IP: 10.34.0.246 (traefik-production)
   - Local Port: 443
   - Status: ✅ Perfect - this is your main entry point
   - Handles: webhook, auth, all HTTPS services

2. **Direct Services (Not Through Traefik)**
   - redis-token-external: 6385 → 10.34.0.201 ✅
   - redis-tls-external: 6380 → 10.34.0.203 ✅
   - internal-registry: 5000 → 10.34.0.202 ✅

### ❌ NEEDS FIX IN TRAEFIK

3. **HTTP (Port 80) - WRONG**
   - Currently: 80 → 10.34.0.246:80
   - Problem: Points to port 80 which doesn't exist in Traefik
   - Traefik Entry Point: `web` (8000 internal)
   - Fix: Leave firewall as-is OR redirect 80 → 443
   - Recommendation: ✅ Remove HTTP port from public (use HTTPS only)

4. **S3 Vector Proxy (Port 9000) - WRONG IP**
   - Currently: 9000 → 10.34.0.240:9000
   - Problem: Goes to .240 (dev traefik), should go to .246 (production)
   - Status in Traefik: ✅ Configured via IngressRoute
   - Fix: Change firewall LAN IP to 10.34.0.246
   - Change firewall Local port to 443 (HTTPS on Traefik)
   - Traefik will route by Host header

5. **MinIO Console (Port 9001) - WRONG IP**
   - Currently: 9001 → 10.34.0.204:9001
   - Problem: Goes to .204 (wrong service), should go to .246
   - Status in Traefik: ✅ Configured via IngressRoute
   - Fix: Change firewall LAN IP to 10.34.0.246
   - Change firewall Local port to 443 (HTTPS on Traefik)
   - Traefik will route by Host header

6. **GitHub Webhook Handle (Port 8080) - WRONG**
   - Currently: 8080 → 10.34.0.240:8080
   - Problem: Goes to .240, should go to .246, AND port should be 443
   - Status in Traefik: ✅ Configured via IngressRoute
   - Fix: Change firewall LAN IP to 10.34.0.246
   - Change firewall Local port to 443 (HTTPS on Traefik)
   - Traefik will route to webhook.dev... via Host header

## 🔧 TRAEFIK CONFIGURATION FOR FIREWALL PORTS

### Port 443 (HTTPS/TLS)
- **Entry Point**: `websecure` (443)
- **Handles**: All HTTPS traffic
- **Routes**: By Host header via IngressRoutes
- **Config**: ✅ Already correct

### Custom Ports (9000, 9001, etc.)
**Option A - Direct Service (Current, Complex)**
- Firewall: 9000 → 10.34.0.240:9000 (s3-vector-proxy-service)
- Each service needs separate port forward
- Problem: Scales poorly, hard to manage

**Option B - Traefik Host-Based Routing (Recommended)**
- Firewall: Forward ALL to 10.34.0.246:443
- Let Traefik route by Host header
- Traefik routes s3-vector-proxy to port 9000 internally
- Cleaner, more scalable

### Current Traefik Entry Points
```
Port 80 (http) → Target port: 8000
Port 443 (https) → Target port: 8443
Port 9090 (metrics) → Target port: 9090
```

## ✅ RECOMMENDED FIREWALL CONFIGURATION

| Description | Public Port | Protocol | LAN IP | Local Port | Purpose |
|---|---|---|---|---|---|
| **HTTPS Main** | 443 | TCP | 10.34.0.246 | 443 | **ALL Traefik routes (✅ Keep as-is)** |
| HTTP Redirect | 80 | TCP | 10.34.0.246 | 80 | HTTP→HTTPS redirect (optional) |
| redis-token-external | 6385 | TCP | 10.34.0.201 | 6385 | Direct (✅ Keep as-is) |
| redis-tls-external | 6380 | TCP | 10.34.0.203 | 6380 | Direct (✅ Keep as-is) |
| internal-registry | 5000 | TCP | 10.34.0.202 | 5000 | Direct (✅ Keep as-is) |
| ~~s3-vector-proxy~~ | ~~9000~~ | TCP | ~~10.34.0.240~~ | ~~9000~~ | **DELETE - use 443 instead** |
| ~~minio-console~~ | ~~9001~~ | TCP | ~~10.34.0.204~~ | ~~9001~~ | **DELETE - use 443 instead** |
| ~~github-webhook~~ | ~~8080~~ | TCP | ~~10.34.0.240~~ | ~~8080~~ | **DELETE - use 443 instead** |

## 🎯 WHAT THIS MEANS

### For S3 Vector Proxy Service (minio:9000)
- **Currently**: Public port 9000 goes directly to service
- **With Traefik**: Public port 443, Traefik routes by Host header
- **Change needed**: Delete port 9000 rule
- **Traefik handles**: Hostname-based routing (assets.dev.cerebral.baerautotech.com)
- **IngressRoute**: ✅ Already configured

### For MinIO Console (minio:9001)
- **Currently**: Public port 9001 goes directly to service
- **With Traefik**: Public port 443, Traefik routes by Host header
- **Change needed**: Delete port 9001 rule
- **Traefik handles**: Hostname-based routing (minio-console.dev.cerebral.baerautotech.com)
- **IngressRoute**: ✅ Already configured

### For GitHub Webhook Handler
- **Currently**: Public port 8080 goes to service
- **With Traefik**: Public port 443, Traefik routes by Host header
- **Change needed**: Delete port 8080 rule
- **Traefik handles**: Hostname-based routing (webhook.dev.cerebral.baerautotech.com)
- **IngressRoute**: ✅ Already configured (github-webhook-receiver)

## ✅ ACTION ITEMS

### In Traefik (Already Done ✅)
All IngressRoutes are configured with:
- Entry Point: `websecure` (443)
- TLS Certificate: `dev-wildcard-tls`
- Host-based routing

### In Firewall (You Need To Do ⚠️)

**DELETE these rules:**
1. ~~s3-vector-proxy-service: 9000 → 10.34.0.240:9000~~
2. ~~minio-console-service: 9001 → 10.34.0.204:9001~~
3. ~~github-webhook-handle: 8080 → 10.34.0.240:8080~~

**CHANGE this rule:**
1. HTTP: Keep as-is (optional) or set to redirect to 443
   - If keeping: 80 → 10.34.0.246:80 (Traefik redirect)

**VERIFY/KEEP these rules:**
1. HTTPS: 443 → 10.34.0.246:443 ✅ **PRIMARY - DO NOT CHANGE**
2. redis-token-external: 6385 → 10.34.0.201:6385 ✅
3. redis-tls-external: 6380 → 10.34.0.203:6380 ✅
4. internal-registry: 5000 → 10.34.0.202:5000 ✅

## 🎓 Why This Works

When a request comes in on public port 443:

```
Example: https://assets.dev.cerebral.baerautotech.com/

67.221.99.140:443 (Firewall)
    ↓
10.34.0.246:443 (Traefik-production LoadBalancer)
    ↓
Traefik reads Host header: assets.dev.cerebral.baerautotech.com
    ↓
Matches IngressRoute: minio-public-assets-traefik
    ↓
Traefik internally routes to minio:9000
    ↓
MinIO service on port 9000 (but from client perspective, they used 443!)
```

## ✅ SUMMARY

**YES - All ports/IPs need to be configured in Traefik:**

But you don't need individual public ports for each service!

Instead:
- **Public**: All traffic on 443 (HTTPS)
- **Traefik**: Routes by Host header
- **Internal**: Traefik maps to custom ports (9000, 9001, etc.)

**Firewall Changes Required**:
1. Delete: 9000, 9001, 8080 port forward rules
2. Keep: 443 → 10.34.0.246 (the main one!)
3. Keep: Direct services (redis, registry)

This is MUCH cleaner and more secure! 🎉
