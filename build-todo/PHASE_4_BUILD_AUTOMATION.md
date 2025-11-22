# Phase 4: Build Automation with Tekton/Kaniko - Mobile App CI/CD

## Overview
Complete build automation setup for React Native mobile app (iOS + Android) using Tekton Pipelines and Kaniko container builds, integrated with the existing Cerebral Platform CI/CD system.

**Status**: 🚀 IN PROGRESS
**Date Created**: November 9, 2025
**Build System**: Tekton Pipelines + Kaniko
**Webhook System**: GitHub Organization-level webhooks
**Registry**: Internal Kubernetes registry (10.34.0.202:5000)

---

## Quick Reference: CI/CD Architecture

### Existing System (Already in Place)

The Cerebral Platform CI/CD system is **production-ready** and documented in:
- 📄 `🚨_READ_THIS_FIRST_CI_CD_SYSTEM.md` - **READ THIS FIRST**
- 📄 `CI_CD_README.md` - 30-second overview
- 📄 `CI_CD_COMPLETE_GUIDE.md` - Full documentation
- 📄 `TEKTON_PIPELINE_PARAMETERS_COMPLETE.md` - Pipeline parameters

**Flow Overview**:
```
git push main → GitHub Webhook → Webhook Receiver (Rust) → Tekton Pipeline
    ↓
git-clone task → kaniko-build task → deploy task → Pod restarts with new image
```

---

## Phase 4 Tasks

### 4.1: Mobile Build Configuration

**Task**: Create mobile-specific build configuration

**Deliverables**:
- [ ] Dockerfile for React Native frontend
- [ ] Build configuration for iOS
- [ ] Build configuration for Android
- [ ] Build parameters file
- [ ] Secrets management for signing keys

**Status**: ⏳ Ready to implement

#### 4.1.1: Dockerfile for Frontend-React-Native

File: `frontend-react-native/Dockerfile.build`

```dockerfile
# Multi-stage build for React Native frontend

# Stage 1: Build environment
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Runtime environment
FROM node:18-alpine

WORKDIR /app

# Install serve to run the build
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "dist", "-l", "3000"]
```

---

### 4.2: Tekton Tasks for Mobile

**Task**: Create mobile-specific Tekton tasks

**Deliverables**:
- [ ] ios-build-task.yaml
- [ ] android-build-task.yaml
- [ ] firebase-deploy-task.yaml (TestFlight + Play Store)
- [ ] slack-notification-task.yaml

**Status**: ⏳ Ready to implement

#### 4.2.1: iOS Build Task

File: `k8s/tekton/tasks/ios-build-task.yaml`

```yaml
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: ios-build-task
  namespace: tekton-pipelines
spec:
  description: Build and sign iOS app
  params:
    - name: repo-url
      type: string
      description: Git repository URL
    - name: repo-branch
      type: string
      default: main
      description: Git branch
    - name: ios-cert-secret
      type: string
      description: Kubernetes secret containing iOS signing certificate
    - name: provisioning-profile
      type: string
      description: iOS provisioning profile path in secret
  workspaces:
    - name: shared-data
      description: Shared workspace for repo
  steps:
    - name: clone-repo
      image: alpine/git:latest
      script: |
        git clone -b $(params.repo-branch) $(params.repo-url) /workspace/shared-data/repo

    - name: setup-ios
      image: ghcr.io/cirruslabs/macos-runner:latest
      env:
        - name: CI_SIGNING_CERTIFICATE
          valueFrom:
            secretKeyRef:
              name: $(params.ios-cert-secret)
              key: cert.p12
        - name: CI_PROVISIONING_PROFILE
          valueFrom:
            secretKeyRef:
              name: $(params.ios-cert-secret)
              key: profile.mobileprovision
      script: |
        #!/bin/bash
        set -e

        cd /workspace/shared-data/repo/frontend-react-native

        # Install dependencies
        npm install -g pnpm
        pnpm install

        # Install CocoaPods dependencies
        cd ios && pod install && cd ..

        # Build iOS app
        xcodebuild \
          -workspace ios/CerebralNative.xcworkspace \
          -scheme CerebralNative \
          -configuration Release \
          -derivedDataPath build \
          -archivePath build/CerebralNative.xcarchive \
          archive

        # Export IPA
        xcodebuild \
          -exportArchive \
          -archivePath build/CerebralNative.xcarchive \
          -exportOptionsPlist ios/ExportOptions.plist \
          -exportPath build/output

        echo "✅ iOS build complete: build/output/CerebralNative.ipa"

    - name: upload-testflight
      image: alpine:latest
      script: |
        #!/bin/sh
        # This step requires fastlane setup
        echo "TODO: Upload to TestFlight using fastlane"
```

#### 4.2.2: Android Build Task

File: `k8s/tekton/tasks/android-build-task.yaml`

```yaml
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: android-build-task
  namespace: tekton-pipelines
spec:
  description: Build and sign Android app
  params:
    - name: repo-url
      type: string
      description: Git repository URL
    - name: repo-branch
      type: string
      default: main
      description: Git branch
    - name: android-keystore-secret
      type: string
      description: Kubernetes secret containing Android keystore
    - name: keystore-alias
      type: string
      description: Keystore alias for signing
  workspaces:
    - name: shared-data
      description: Shared workspace for repo
  steps:
    - name: clone-repo
      image: alpine/git:latest
      script: |
        git clone -b $(params.repo-branch) $(params.repo-url) /workspace/shared-data/repo

    - name: setup-android
      image: android:api-34
      env:
        - name: ANDROID_KEYSTORE
          valueFrom:
            secretKeyRef:
              name: $(params.android-keystore-secret)
              key: keystore.jks
        - name: KEYSTORE_ALIAS
          value: $(params.keystore-alias)
        - name: KEYSTORE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: $(params.android-keystore-secret)
              key: keystore-password
      script: |
        #!/bin/bash
        set -e

        cd /workspace/shared-data/repo/frontend-react-native

        # Install dependencies
        npm install -g pnpm
        pnpm install

        # Build Android app
        cd android
        ./gradlew clean bundleRelease \
          -DkeyAlias=$(KEYSTORE_ALIAS) \
          -DkeyPassword=$(KEYSTORE_PASSWORD) \
          -DstorePassword=$(KEYSTORE_PASSWORD) \
          -Dkeystore=/workspace/shared-data/keystore.jks

        echo "✅ Android build complete: app/build/outputs/bundle/release/app-release.aab"

    - name: upload-play-store
      image: alpine:latest
      script: |
        #!/bin/sh
        # This step requires fastlane setup
        echo "TODO: Upload to Play Store using fastlane"
```

---

### 4.3: Tekton Pipeline for Mobile

**Task**: Create mobile-specific Tekton pipeline

**Deliverables**:
- [ ] cerebral-mobile-pipeline.yaml
- [ ] Pipeline triggers
- [ ] Pipeline parameters

**Status**: ⏳ Ready to implement

#### 4.3.1: Mobile Pipeline YAML

File: `k8s/tekton/pipelines/cerebral-mobile-pipeline.yaml`

```yaml
apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: cerebral-mobile-pipeline
  namespace: tekton-pipelines
spec:
  description: Build and deploy Cerebral React Native mobile app
  params:
    - name: repo-url
      type: string
      description: Git repository URL
    - name: repo-branch
      type: string
      default: main
      description: Git branch to build
    - name: build-target
      type: string
      default: all
      description: "Build target: ios, android, or all"
    - name: version
      type: string
      description: App version (e.g., 1.0.0)
    - name: ios-cert-secret
      type: string
      default: ios-signing-cert
      description: Kubernetes secret with iOS signing certificate
    - name: android-keystore-secret
      type: string
      default: android-keystore
      description: Kubernetes secret with Android keystore

  workspaces:
    - name: shared-workspace
      description: Shared workspace for tasks
    - name: docker-config
      description: Docker config for registry access

  tasks:
    # Task 1: Clone repository
    - name: git-clone
      taskRef:
        name: git-clone
      params:
        - name: url
          value: $(params.repo-url)
        - name: revision
          value: $(params.repo-branch)
        - name: deleteExisting
          value: "true"
      workspaces:
        - name: output
          workspace: shared-workspace

    # Task 2: Run tests
    - name: run-tests
      runAfter:
        - git-clone
      taskRef:
        name: npm-test
      params:
        - name: ARGS
          value:
            - test
            - --coverage
      workspaces:
        - name: source
          workspace: shared-workspace

    # Task 3: Lint code
    - name: lint-code
      runAfter:
        - git-clone
      taskRef:
        name: npm-lint
      params:
        - name: ARGS
          value:
            - lint
      workspaces:
        - name: source
          workspace: shared-workspace

    # Task 4: Build iOS (if target is ios or all)
    - name: build-ios
      when:
        - input: $(params.build-target)
          operator: in
          values: ["ios", "all"]
      runAfter:
        - run-tests
        - lint-code
      taskRef:
        name: ios-build-task
      params:
        - name: repo-url
          value: $(params.repo-url)
        - name: repo-branch
          value: $(params.repo-branch)
        - name: ios-cert-secret
          value: $(params.ios-cert-secret)
      workspaces:
        - name: shared-data
          workspace: shared-workspace

    # Task 5: Build Android (if target is android or all)
    - name: build-android
      when:
        - input: $(params.build-target)
          operator: in
          values: ["android", "all"]
      runAfter:
        - run-tests
        - lint-code
      taskRef:
        name: android-build-task
      params:
        - name: repo-url
          value: $(params.repo-url)
        - name: repo-branch
          value: $(params.repo-branch)
        - name: android-keystore-secret
          value: $(params.android-keystore-secret)
      workspaces:
        - name: shared-data
          workspace: shared-workspace

    # Task 6: Notify Slack
    - name: notify-slack
      runAfter:
        - build-ios
        - build-android
      taskRef:
        name: slack-notification
      params:
        - name: message
          value: |
            🚀 Cerebral Mobile Build Complete
            Version: $(params.version)
            Branch: $(params.repo-branch)
            Status: ✅ Success
```

---

### 4.4: Kubernetes Secrets for Mobile

**Task**: Create Kubernetes secrets for signing keys and certificates

**Deliverables**:
- [ ] iOS signing certificate secret
- [ ] Android keystore secret
- [ ] Firebase service account secret
- [ ] Fastlane credentials secret

**Status**: ⏳ Ready to implement

#### 4.4.1: Create iOS Signing Secret

```bash
# Create iOS signing certificate secret
kubectl create secret generic ios-signing-cert \
  --from-file=cert.p12=/path/to/cert.p12 \
  --from-file=profile.mobileprovision=/path/to/profile.mobileprovision \
  --from-literal=cert-password='<PASSWORD>' \
  -n tekton-pipelines

# Verify
kubectl get secret ios-signing-cert -n tekton-pipelines
```

#### 4.4.2: Create Android Keystore Secret

```bash
# Create Android keystore secret
kubectl create secret generic android-keystore \
  --from-file=keystore.jks=/path/to/keystore.jks \
  --from-literal=keystore-password='<PASSWORD>' \
  --from-literal=keystore-alias='release' \
  --from-literal=alias-password='<PASSWORD>' \
  -n tekton-pipelines

# Verify
kubectl get secret android-keystore -n tekton-pipelines
```

#### 4.4.3: Create Firebase Secret

```bash
# Create Firebase service account secret
kubectl create secret generic firebase-credentials \
  --from-file=credentials.json=/path/to/firebase-credentials.json \
  -n tekton-pipelines

# Verify
kubectl get secret firebase-credentials -n tekton-pipelines
```

---

### 4.5: GitHub Webhook Integration for Mobile

**Task**: Configure GitHub webhook to trigger mobile builds

**Status**: ⏳ Ready to implement

#### 4.5.1: Webhook Configuration

The existing system uses **organization-level webhooks** that automatically trigger for all repositories.

**Current Configuration**:
- Organization: `baerautotech`
- Endpoint: `https://webhook.dev.cerebral.baerautotech.com/`
- Events: `push`, `pull_request`
- Secret: Stored in `github-webhook-secret` Kubernetes secret

**For Mobile Repo** (`cerebral-mobile-1`):
- Webhook already configured at org level ✅
- All pushes to `main` trigger builds automatically
- No additional configuration needed

**Verify Webhook**:
```bash
# Check webhook receiver logs
kubectl logs -l app=github-webhook-receiver -n tekton-pipelines -f

# Check PipelineRun creation
kubectl get pipelineruns -n tekton-pipelines -w
```

---

### 4.6: Build Monitoring & Metrics

**Task**: Setup build monitoring and metrics collection

**Deliverables**:
- [ ] Build success/failure tracking
- [ ] Build duration metrics
- [ ] Deployment frequency metrics
- [ ] Slack notifications
- [ ] Dashboard in Prometheus/Grafana

**Status**: ⏳ Ready to implement

#### 4.6.1: Monitor Builds

```bash
# Watch PipelineRuns
kubectl get pipelineruns -n tekton-pipelines -w

# Get build logs
kubectl logs -l tekton.dev/pipelineRun=<PIPELINERUN_NAME> -n tekton-pipelines -f

# Check pipeline status
tkn pipelinerun list -n tekton-pipelines

# Get detailed status
tkn pipelinerun describe <PIPELINERUN_NAME> -n tekton-pipelines

# Get task logs
tkn pipelinerun logs <PIPELINERUN_NAME> -n tekton-pipelines
```

---

### 4.7: Version Management

**Task**: Setup version management for mobile releases

**Deliverables**:
- [ ] Version file (version.txt or package.json)
- [ ] Automated version bumping
- [ ] Git tag creation
- [ ] Release notes generation

**Status**: ⏳ Ready to implement

#### 4.7.1: Version File

File: `frontend-react-native/version.txt`

```
1.0.0
```

#### 4.7.2: Version Bumping Script

File: `scripts/bump-version.sh`

```bash
#!/bin/bash

# Increment version
VERSION_FILE="frontend-react-native/version.txt"
CURRENT=$(cat $VERSION_FILE)

# Parse version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

# Bump patch version
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# Update version file
echo $NEW_VERSION > $VERSION_FILE

# Update package.json
jq --arg version "$NEW_VERSION" '.version = $version' frontend-react-native/package.json > temp.json
mv temp.json frontend-react-native/package.json

# Create git tag
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

# Commit changes
git add frontend-react-native/version.txt frontend-react-native/package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Push to repo
git push origin main --tags

echo "✅ Version bumped to $NEW_VERSION"
```

---

## Implementation Roadmap

### Week 1: Core Setup
- [ ] Create Dockerfile for mobile
- [ ] Create iOS/Android build tasks
- [ ] Create mobile pipeline YAML
- [ ] Create Kubernetes secrets
- [ ] Test pipeline with sample build

### Week 2: Integration & Testing
- [ ] Integrate with webhook receiver
- [ ] Test end-to-end build flow
- [ ] Setup Slack notifications
- [ ] Setup monitoring and metrics
- [ ] Create documentation

### Week 3: Optimization
- [ ] Optimize build times
- [ ] Setup caching layers
- [ ] Add performance monitoring
- [ ] Optimize Docker images
- [ ] Document best practices

---

## Useful Commands Reference

### Tekton Commands

```bash
# List all pipelines
kubectl get pipelines -n tekton-pipelines

# List pipeline runs
tkn pipelinerun list -n tekton-pipelines

# Start manual pipeline run
tkn pipeline start cerebral-mobile-pipeline \
  -p repo-url=https://github.com/baerautotech/cerebral-mobile-1 \
  -p repo-branch=main \
  -p build-target=all \
  -p version=1.0.0 \
  -n tekton-pipelines

# Cancel pipeline run
tkn pipelinerun cancel <PIPELINERUN_NAME> -n tekton-pipelines

# Delete old pipeline runs
kubectl delete pipelineruns --all -n tekton-pipelines
```

### Kubernetes Secrets

```bash
# List all secrets
kubectl get secrets -n tekton-pipelines

# Create secret
kubectl create secret generic <NAME> --from-file=<PATH> -n tekton-pipelines

# View secret
kubectl get secret <NAME> -o yaml -n tekton-pipelines

# Delete secret
kubectl delete secret <NAME> -n tekton-pipelines

# Update secret
kubectl delete secret <NAME> -n tekton-pipelines && \
  kubectl create secret generic <NAME> --from-file=<PATH> -n tekton-pipelines
```

### Monitoring

```bash
# Watch pipeline runs
kubectl get pipelineruns -n tekton-pipelines -w

# Get pod logs
kubectl logs <POD_NAME> -n tekton-pipelines -f

# Get all events
kubectl get events -n tekton-pipelines --sort-by='.lastTimestamp'

# Check Tekton dashboard
# Forward port: kubectl port-forward -n tekton-pipelines svc/tekton-dashboard 9097:9097
# Visit: http://localhost:9097
```

---

## Key Files & Locations

| File | Purpose | Status |
|------|---------|--------|
| `k8s/tekton/tasks/ios-build-task.yaml` | iOS build task | ⏳ To create |
| `k8s/tekton/tasks/android-build-task.yaml` | Android build task | ⏳ To create |
| `k8s/tekton/pipelines/cerebral-mobile-pipeline.yaml` | Mobile pipeline | ⏳ To create |
| `frontend-react-native/Dockerfile.build` | Frontend Docker image | ⏳ To create |
| `frontend-react-native/version.txt` | Version file | ⏳ To create |
| `scripts/bump-version.sh` | Version bumping script | ⏳ To create |

---

## Documentation Links

**Phase 4 Reference**:
- 📄 `🚨_READ_THIS_FIRST_CI_CD_SYSTEM.md` - **CRITICAL** - Existing CI/CD architecture
- 📄 `CI_CD_README.md` - 30-second overview
- 📄 `CI_CD_COMPLETE_GUIDE.md` - Full system documentation
- 📄 `TEKTON_PIPELINE_PARAMETERS_COMPLETE.md` - Pipeline parameters

**Related Phases**:
- 📄 `PHASE_3_INTEGRATION_TESTS.md` - Integration testing
- 📄 `PHASE_3_MANUAL_TESTING.md` - Manual testing guide

**External Resources**:
- [Tekton Pipelines Docs](https://tekton.dev/)
- [Kaniko Documentation](https://github.com/GoogleContainerTools/kaniko)
- [Fastlane Documentation](https://docs.fastlane.tools/)

---

## Summary

**Phase 4 - Build Automation** sets up production-ready CI/CD for the mobile app using the existing Cerebral Platform infrastructure.

**Key Deliverables**:
- ✅ Mobile-specific Tekton tasks (iOS + Android)
- ✅ Mobile pipeline configuration
- ✅ Kubernetes secrets for signing keys
- ✅ GitHub webhook integration
- ✅ Version management
- ✅ Build monitoring

**Status**: 🚀 READY TO IMPLEMENT
**Estimated Time**: 1-2 weeks
**Ready for**: Phase 5 (App Store Distribution)

---

**Next**: Phase 5: App Store & Play Store Distribution (Fastlane setup, TestFlight, Play Store)
