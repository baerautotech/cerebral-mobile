#!/bin/bash

# Manual Testing Helper Script for Tier and Feature Flag Guards
# Usage: ./scripts/test-tier-guards.sh [ios|android]

set -e

PLATFORM=${1:-ios}
PROJECT_DIR="/Users/bbaer/Development/cerebral-mobile-1/frontend-react-native"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║       TIER & FEATURE FLAG GUARD TESTING - Manual Tests        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_test() {
  echo -e "${YELLOW}→${NC} $1"
}

print_pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
}

print_fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
}

# Verify platform
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" ]]; then
  echo -e "${RED}Error: Invalid platform. Use 'ios' or 'android'${NC}"
  exit 1
fi

print_section "PRE-TEST SETUP"

# Check dependencies
print_test "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_pass "Node.js $NODE_VERSION found"
else
    print_fail "Node.js not found"
    exit 1
fi

# Check React Native CLI
print_test "Checking React Native CLI..."
if command -v react-native &> /dev/null; then
    print_pass "React Native CLI found"
else
    print_fail "React Native CLI not found"
    exit 1
fi

# Navigate to project
cd "$PROJECT_DIR"
print_pass "Working directory: $PROJECT_DIR"

# Clear cache
print_test "Clearing npm cache..."
npm cache clean --force > /dev/null 2>&1
print_pass "Cache cleared"

print_section "RUNNING INTEGRATION TESTS"

print_test "Running all integration tests..."
npm test -- --testPathPattern="integration" --no-coverage 2>&1 | tee test-results.log

if grep -q "Tests.*passed" test-results.log; then
    print_pass "Integration tests passed"
else
    print_fail "Integration tests failed - review test-results.log"
fi

print_section "STARTING $PLATFORM SIMULATOR/EMULATOR"

if [[ "$PLATFORM" == "ios" ]]; then
    print_test "Checking for iOS simulator..."
    
    # Find available iOS simulator
    SIMULATOR=$(xcrun simctl list devices available | grep "^  iPhone" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')
    
    if [ -z "$SIMULATOR" ]; then
        print_fail "No iOS simulator available"
        echo "Please ensure Xcode is installed and a simulator is available"
        exit 1
    fi
    
    print_pass "Found simulator: $SIMULATOR"
    
    print_test "Opening iOS simulator..."
    open -a Simulator
    
    # Wait for simulator to start
    sleep 5
    
    print_test "Starting Metro bundler..."
    npm start -- --reset-cache &
    METRO_PID=$!
    
    # Wait for Metro to be ready
    sleep 10
    
    print_test "Building and running iOS app..."
    npm run ios
    
    print_pass "iOS app launched"
    
elif [[ "$PLATFORM" == "android" ]]; then
    print_test "Checking for Android emulator..."
    
    # Check if emulator is running
    if ! pgrep -x "emulator" > /dev/null; then
        print_fail "Android emulator not running"
        echo "Please start an Android emulator first"
        exit 1
    fi
    
    print_pass "Android emulator detected"
    
    print_test "Starting Metro bundler..."
    npm start -- --reset-cache &
    METRO_PID=$!
    
    # Wait for Metro to be ready
    sleep 10
    
    print_test "Building and running Android app..."
    npm run android
    
    print_pass "Android app launched"
fi

print_section "MANUAL TESTING STARTED"

echo ""
echo -e "${GREEN}The app is now running on your simulator/emulator!${NC}"
echo ""
echo "Testing Checklist:"
echo "├─ [ ] FREE TIER TESTS (Suite 1)"
echo "│  ├─ [ ] Login/Signup screens visible"
echo "│  ├─ [ ] Dashboard shows base content only"
echo "│  ├─ [ ] Tasks shows base content only"
echo "│  ├─ [ ] Premium screens not accessible"
echo "│  └─ [ ] No errors in console"
echo "│"
echo "├─ [ ] STANDARD TIER TESTS (Suite 2)"
echo "│  ├─ [ ] LiveDashboard accessible"
echo "│  ├─ [ ] Advanced Analytics visible"
echo "│  ├─ [ ] Enterprise features still blocked"
echo "│  └─ [ ] Export Task Data visible"
echo "│"
echo "├─ [ ] ENTERPRISE TIER TESTS (Suite 3)"
echo "│  ├─ [ ] All premium features visible"
echo "│  ├─ [ ] AR View accessible"
echo "│  ├─ [ ] AI features visible"
echo "│  └─ [ ] Automation rules visible"
echo "│"
echo "├─ [ ] TIER TRANSITIONS (Suite 4)"
echo "│  ├─ [ ] Features appear on upgrade"
echo "│  └─ [ ] Features disappear on downgrade"
echo "│"
echo "├─ [ ] FEATURE FLAGS (Suite 5)"
echo "│  ├─ [ ] Flags control visibility"
echo "│  └─ [ ] Killswitch works"
echo "│"
echo "└─ [ ] EDGE CASES (Suite 6)"
echo "   ├─ [ ] Offline works"
echo "   ├─ [ ] Cache works"
echo "   └─ [ ] No crashes on rapid changes"
echo ""

echo "Helpful Commands:"
echo "├─ Open browser DevTools: Press Cmd+D (iOS) or Cmd+M (Android)"
echo "├─ Toggle Inspector: Ctrl+I"
echo "├─ Toggle Performance Monitor: Ctrl+Shift+J"
echo "├─ Kill Metro: Press Ctrl+C"
echo "└─ To switch tiers: Modify mock data in useAuth hook"
echo ""

print_section "TESTING IN PROGRESS"

echo -e "${YELLOW}Keep this window open while testing...${NC}"
echo "Logs are being captured in 'test-results.log'"
echo ""
echo "When you're done testing, press Ctrl+C to stop."

# Keep the script running
wait $METRO_PID 2>/dev/null || true

print_section "MANUAL TESTING COMPLETE"

echo ""
echo -e "${GREEN}✅ Manual testing session ended${NC}"
echo ""
echo "Next steps:"
echo "1. Review any issues found during testing"
echo "2. Check 'test-results.log' for integration test results"
echo "3. If all tests pass, proceed to Phase 4"
echo "4. If issues found, fix and re-run tests"
echo ""

