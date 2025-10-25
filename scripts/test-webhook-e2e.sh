#!/bin/bash
set -e

echo "================================"
echo "🧪 END-TO-END WEBHOOK TEST"
echo "================================"
echo ""

# Test 1: Verify pods running
echo "✅ TEST 1: Webhook receiver pods running"
READY=$(kubectl get pods -n tekton-pipelines -l app.kubernetes.io/name=github-webhook-receiver --no-headers | wc -l)
echo "   Found $READY webhook receiver pods"
if [ "$READY" -eq 0 ]; then
  echo "   ❌ FAILED: No pods running!"
  exit 1
fi
echo "   ✅ PASSED"
echo ""

# Test 2: Service exists and has endpoints
echo "✅ TEST 2: Service has active endpoints"
ENDPOINTS=$(kubectl get endpoints github-webhook-receiver -n tekton-pipelines -o jsonpath='{.subsets[*].addresses[*].ip}' | wc -w)
echo "   Found $ENDPOINTS endpoint IPs"
if [ "$ENDPOINTS" -eq 0 ]; then
  echo "   ❌ FAILED: Service has no endpoints!"
  exit 1
fi
echo "   ✅ PASSED"
echo ""

# Test 3: Health check through port-forward
echo "✅ TEST 3: Health check endpoint"
kubectl port-forward -n tekton-pipelines svc/github-webhook-receiver 3000:3000 &>/dev/null &
PF_PID=$!
sleep 2

HEALTH=$(curl -s http://localhost:3000/health)
kill $PF_PID 2>/dev/null || true

if [ "$HEALTH" != "ok" ]; then
  echo "   ❌ FAILED: Health endpoint returned '$HEALTH'"
  exit 1
fi
echo "   Health endpoint response: $HEALTH"
echo "   ✅ PASSED"
echo ""

# Test 4: Webhook through HTTPS
echo "✅ TEST 4: Webhook through HTTPS"
SECRET=$(kubectl get secret -n tekton-pipelines github-webhook-secret -o jsonpath='{.data.secretToken}' | base64 -d)
PAYLOAD='{"repository":{"name":"cerebral","clone_url":"https://github.com/baerautotech/cerebral","owner":{"name":"baerautotech"}},"head_commit":{"id":"abc123","modified":["microservices/api-gateway/test.py"],"message":"test"},"ref":"refs/heads/main","pusher":{"name":"testuser"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://webhook.dev.cerebral.baerautotech.com/ \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

echo "   HTTP Status: $HTTP_CODE"
echo "   Response: $BODY"

if [ "$HTTP_CODE" != "202" ]; then
  echo "   ❌ FAILED: Expected 202, got $HTTP_CODE"
  exit 1
fi

# Extract PipelineRun name
PIPELINE_RUN=$(echo "$BODY" | grep -o '"pipeline_run":"[^"]*' | cut -d'"' -f4)
echo "   PipelineRun: $PIPELINE_RUN"
echo "   ✅ PASSED"
echo ""

# Test 5: PipelineRun exists
echo "✅ TEST 5: PipelineRun created in cluster"
PIPELINE_EXISTS=$(kubectl get pipelinerun "$PIPELINE_RUN" -n tekton-pipelines 2>&1)
if [[ ! "$PIPELINE_EXISTS" ]]; then
  echo "   ❌ FAILED: PipelineRun not found"
  exit 1
fi
echo "   ✅ PASSED"
echo ""

echo "================================"
echo "🎉 ALL TESTS PASSED!"
echo "================================"
echo ""
echo "✅ Webhook is fully functional"
echo "✅ PipelineRuns are being created"
echo "✅ CI/CD pipeline is ready"
