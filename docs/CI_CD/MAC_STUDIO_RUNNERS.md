# Mac Studio runners (interim iOS build topology)

This repo supports an **interim enterprise topology** where iOS builds run on **developer Mac Studios** while Android builds continue to run in Linux/Kubernetes.

## Why
- iOS/watchOS/tvOS builds require **macOS + Xcode**.
- Running Xcode inside Kubernetes containers is not reliable/portable.

## Approach
- Tekton runs **quality gates** in-cluster (lint/test/typecheck/guardrails).
- Tekton triggers an **SSH remote build** on a Mac Studio for iOS signing/build.

## Requirements on each Mac Studio runner
- Xcode installed + CLI tools enabled:
  - `xcodebuild -version`
- CocoaPods installed:
  - `pod --version`
- Node + pnpm available (or installable)
- A dedicated user account (recommended): `build`

## Kubernetes secret / ServiceAccount
The Tekton task expects an SSH private key mounted at:
- `/tekton/ssh/id_ed25519`

Recommended secret name: `macstudio-ssh`

## Tekton task
- `k8s/tekton/tasks/ios-remote-macstudio-task.yaml`

Pipeline params you’ll set:
- `ios-runner-host`: e.g. `macstudio-01.local`
- `ios-runner-user`: e.g. `build`
- `ios-runner-workdir`: e.g. `/Users/build/ci/cerebral-mobile`

## Security notes
- Keep signing identities/Keychain access on the Mac Studio locked down.
- Use least-privilege keys and rotate them.
- Prefer migrating to a dedicated Mac runner as the team scales.
