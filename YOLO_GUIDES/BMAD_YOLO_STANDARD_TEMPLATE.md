# 📋 BMAD-Method YOLO Mode Preparation Standard Template

**Version**: 1.0
**Purpose**: Standard methodology for preparing ANY project for YOLO-mode autonomous execution with 99%+ accuracy
**Methodology**: BMAD (Brainstorm, Map, Architecture, Deploy)
**Target Accuracy**: 99%+ across entire project lifecycle

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: BMAD Planning (40-50 hours)](#phase-1-bmad-planning)
3. [Phase 2: YOLO Preparation (65-75 hours total)](#phase-2-yolo-preparation)
4. [Phase 3: Documentation & CI/CD Integration](#phase-3-documentation--cicd)
5. [Perfect Context Extraction Prompt](#perfect-context-extraction-prompt)
6. [Gap Analysis & Validation](#gap-analysis--validation)
7. [Implementation Checklist](#implementation-checklist)

---

## Overview

### What This Template Does

This template standardizes the conversion of ANY project into a YOLO-mode autonomous execution system:

- **Input**: Project vision, scope, architecture decisions, SCRUM breakdown
- **Process**: Comprehensive error scenario mapping + integration testing + architecture gates + gap analysis
- **Output**: 99%+ accuracy autonomous execution system with zero manual intervention
- **Timeline**: 65-75 hours prep → N-week project execution

### The BMAD Method

```
B (Brainstorm)  → Identify all failure modes
M (Map)         → Create error scenario + test matrices
A (Architecture)→ Design gates + validation layers
D (Deploy)      → Automate via CI/CD + continuous repair
```

### Success Metrics

- ✅ Zero mid-project surprises
- ✅ 99%+ accuracy across all phases
- ✅ 0-2% rework rate (vs 20-30% without prep)
- ✅ 100% on-time delivery
- ✅ Complete audit trail (git)
- ✅ Full autonomy (no manual intervention)

---

## Phase 1: BMAD Planning (40-50 hours)

### Step 1.1: Project Intake (2-3 hours)

Create project intake document:

```markdown
# PROJECT INTAKE FORM

## Project Basics

- **Name**: [Project Name]
- **Duration**: [Weeks] weeks / [Epics] epics / [Stories] stories / [SP] story points
- **Tech Stack**: [Languages, frameworks, databases, platforms]
- **Team Size**: [Dev days available per week]
- **Success Criteria**: [Business objectives]

## Scope Breakdown

- **Phases**: [Number of phases/milestones]
- **Phase Duration**: [Weeks per phase]
- **Critical Path**: [Dependencies]
- **Risk Areas**: [What could go wrong]

## Known Unknowns

- **Architecture Unknowns**: [Architectural risks]
- **Integration Unknowns**: [External API/system risks]
- **Performance Unknowns**: [Scalability concerns]
- **Operational Unknowns**: [Deployment/infra concerns]

## Team Expertise

- **Strengths**: [What team knows well]
- **Gaps**: [What team doesn't know]
- **Training Needed**: [Skills to develop]

## Previous Lessons Learned

- **What Worked**: [Successful practices]
- **What Failed**: [Past project failures]
- **Best Practices**: [Organizational standards]
```

### Step 1.2: Brainstorm Error Scenarios (10-15 hours)

For EACH story/component, identify:

```yaml
ERROR SCENARIO TEMPLATE:

Story/Component: [Name]

ERROR 1: [Error Type]
  Trigger: [What causes this]
  Impact: [What breaks]
  Symptom: [How will we know]
  Handler: [Automatic fix]
  Verification: [How to test fix]
  Rollback: [Recovery procedure]

ERROR 2: [Error Type]
  ...

EDGE CASE 1: [Unusual scenario]
  Scenario: [Description]
  Expected: [What should happen]
  Solution: [How to handle]
  Verification: [Test it]
  Rollback: [Recovery]
```

**Deliverable**: `PROJECT_ERROR_SCENARIOS.yaml` (3-5 KB per story)

### Step 1.3: Map Architecture Phases (5-10 hours)

For each phase:

```yaml
PHASE MAPPING:

Phase [N]: [Phase Name] ([T] weeks)
  Stories: [Count] ([SP] points)
  Critical Dependencies:
    - [Dependency 1] (from Phase N-1)
    - [Dependency 2] (external)
  Risk Areas:
    - [Risk 1]
    - [Risk 2]
  Unknown Factors:
    - [Unknown 1]
    - [Unknown 2]
  Success Metrics:
    - [Metric 1]
    - [Metric 2]
  Gate Criteria:
    - [Criterion 1]
    - [Criterion 2]
```

**Deliverable**: `PROJECT_PHASE_MAP.yaml` (1-2 KB per phase)

### Step 1.4: Define Architecture Gates (3-5 hours)

For each phase:

```yaml
PHASE [N] GATE:

  Criteria:
    1. [Metric]: [Target] (SLO: [Threshold])
    2. [Metric]: [Target] (SLO: [Threshold])
    3. [Metric]: [Target] (SLO: [Threshold])

  Remediation:
    If [Criterion 1] fails:
      Action: [Fix procedure]
      Owner: [Who fixes]
      Escalation: [If still failing]

  Decision:
    All pass: PROCEED
    Any fail: INVESTIGATE → FIX → RETEST
    Critical fail: PAUSE → ARCHITECTURE REVIEW

  Timeline: [Review duration] (typically 30 min)
```

**Deliverable**: `PROJECT_PHASE_GATES.yaml` (1 KB per phase)

### Step 1.5: Integration Testing Strategy (5-8 hours)

For each phase:

```yaml
PHASE [N] TESTING STRATEGY:

  Test Suite: test_phase[N]_integration.py

  Test Categories:

    1. Happy Path Tests
       - [Test 1]: [Description]
       - [Test 2]: [Description]

    2. Error Path Tests
       - [Error 1 test]: [Description]
       - [Error 2 test]: [Description]

    3. Concurrency Tests
       - [Concurrent scenario 1]: [Description]
       - [Concurrent scenario 2]: [Description]

    4. Performance Tests
       - [Performance metric 1]: [Target]
       - [Performance metric 2]: [Target]

    5. Regression Tests
       - [Compare against]: [Baseline]

  Coverage Target: [95]%
  Test Duration: [T] minutes
  Test Environment: [Dev/Staging/Prod]
```

**Deliverable**: `PROJECT_TEST_STRATEGY.yaml` (2-3 KB per phase)

---

## Phase 2: YOLO Preparation (65-75 hours total)

### Step 2.1: Implementation Hours 0-8 (Error Scenarios + Integration Tests)

```
Hour 0-1:   Project setup, context loading
Hour 1-3:   Error scenario YAML creation (all stories in phase)
Hour 3-5:   Integration test suite implementation
Hour 5-7:   Test framework scaffolding
Hour 7-8:   Commit work
```

**Input**: `PROJECT_ERROR_SCENARIOS.yaml`
**Output**:

- Error scenario handlers (code)
- Integration test suite (code + YAML)
- Test framework setup
- Baseline metrics established

### Step 2.2: Implementation Hours 8-16 (Architecture Gates + Edge Cases)

```
Hour 8-10:  Phase gate checklist system creation
Hour 10-12: Edge case matrix documentation
Hour 12-14: Edge case handler implementation
Hour 14-16: Commit work
```

**Input**: `PROJECT_PHASE_GATES.yaml`, `PROJECT_PHASE_MAP.yaml`
**Output**:

- Gate validator (code)
- Edge case handlers (code)
- Phase executor (code)
- Automated validation

### Step 2.3: Implementation Hours 16-24 (Testing Framework + Perfect Prompts)

```
Hour 16-18: Comprehensive testing framework
Hour 18-20: CI/CD automation setup
Hour 20-22: Perfect sprint prompt generation
Hour 22-24: Commit work + validation
```

**Input**: All previous deliverables
**Output**:

- Complete test framework
- CI/CD pipeline
- Auto-generated sprint prompts
- Validation reports

### Step 2.4: Implementation Hours 24-65 (Phase-Specific Details)

For EACH phase (repeat pattern):

```
Per Phase (5-8 hours):
  - Error scenario documentation (Phase-specific)
  - Integration test suite (Phase-specific)
  - Architecture gate definition (Phase-specific)
  - Edge case mapping (Phase-specific)
  - Commit deliverables
```

### Step 2.5: Implementation Hours 54-65 (Cross-Phase Integration)

```
Hour 54-59: Global gap analysis + dependency mapping
Hour 59-62: System-wide repair findings
Hour 62-65: Final validation + CI/CD integration
```

**Output**:

- Cross-phase dependency graph
- Global optimization recommendations
- Complete CI/CD automation
- End-to-end validation

---

## Phase 3: Documentation & CI/CD Integration

### Deliverable 1: Complete YOLO Blueprint

**File**: `COMPLETE_YOLO_[PROJECT]_[Hours]H_ALL_PHASES.md`

```markdown
# Complete YOLO: [PROJECT] [Hours]-Hour Blueprint

## Executive Summary

- Total hours: [X]
- Total phases: [Y]
- Total stories: [Z]
- Total error scenarios: [N1]
- Total tests: [N2]
- Target accuracy: 99%+

## Phase-by-Phase Breakdown

[Each phase with full details]

## Accuracy Projections

[Table showing accuracy by phase]

## Deliverables Checklist

[All outputs listed]

## Timeline & ROI

[Implementation timeline + financial analysis]
```

### Deliverable 2: Engineering Blueprint

**File**: `YOLO_MODE_ENGINEERING_BLUEPRINT.md`

```markdown
# YOLO Mode Engineering Blueprint: [PROJECT]

## Perfect Prompt Architecture

[Error scenario layer design]
[Integration test matrix design]
[Architecture gate design]
[Edge case handling design]

## Phase-Specific Implementations

[Templates for each phase]

## Code Examples

[Complete code samples]

## Testing Strategy

[Full testing approach]
```

### Deliverable 3: Decision Framework

**File**: `YOLO_MODE_GO_DECISION.md`

```markdown
# YOLO Mode: Go/No-Go Decision Framework

## Options Comparison

[Pure YOLO vs. Guided YOLO vs. Complete YOLO]

## ROI Analysis

[Financial comparison]

## Risk Assessment

[Risk analysis for each option]

## Recommendation

[Clear recommendation with justification]
```

### Deliverable 4: Summary Document

**File**: `YOLO_MODE_[PROJECT]_SUMMARY.md`

```markdown
# [PROJECT]: YOLO Mode Summary

## What You Have

[Complete system overview]

## Accuracy Path

[Accuracy by phase table]

## How to Use

[Implementation instructions]

## Success Criteria

[Definition of done]
```

### Deliverable 5: CI/CD Automation

**File**: `.github/workflows/yolo-[project]-complete.yml`

```yaml
name: YOLO [PROJECT] - Complete Automation

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  phase-tests:
    # All phase tests run
  phase-gates:
    # All gates validate
  gap-analysis:
    # Global gap analysis
  regression-tests:
    # Regression detection
  accuracy-tracking:
    # Accuracy metrics
```

---

## Perfect Context Extraction Prompt

### The Master Prompt for Extracting All Project Context

Use this prompt to pull complete context from your project documentation:

```markdown
# 🎯 YOLO PROJECT CONTEXT EXTRACTION PROMPT

You are preparing [PROJECT_NAME] for YOLO-mode autonomous execution with 99%+ accuracy.

## MANDATORY CONTEXT TO EXTRACT

### 1. PROJECT FUNDAMENTALS (Required)

- [ ] Project scope: [N] stories, [M] epics, [P] story points
- [ ] Timeline: [W] weeks / [D] days
- [ ] Tech stack: [Technologies used]
- [ ] Team capacity: [Hours/week available]
- [ ] Success definition: [Business objectives]

### 2. ARCHITECTURE DECISIONS (Required)

- [ ] Technology choices and WHY
- [ ] Database architecture
- [ ] API/integration points
- [ ] Deployment strategy
- [ ] Scaling approach

### 3. PHASE BREAKDOWN (Required)

For EACH phase:

- [ ] Phase name and duration
- [ ] Story count and total SP
- [ ] Critical dependencies
- [ ] Risk areas
- [ ] Success metrics

### 4. KNOWN UNKNOWNS (Required)

- [ ] What could fail and why
- [ ] External dependencies
- [ ] Technical risks
- [ ] Architectural challenges
- [ ] Performance unknowns

### 5. ERROR SCENARIOS (Critical)

For EACH story/component:

- [ ] 3-5 likely error scenarios
- [ ] Root cause for each
- [ ] Automatic handler approach
- [ ] Edge cases related to errors
- [ ] Failure impact

### 6. INTEGRATION POINTS (Critical)

- [ ] External APIs used
  - [ ] Fallback behavior
  - [ ] Timeout handling
  - [ ] Retry strategy

- [ ] Internal dependencies
  - [ ] Service-to-service calls
  - [ ] Data consistency
  - [ ] State management

### 7. TESTING REQUIREMENTS (Critical)

- [ ] Happy path tests per story
- [ ] Error path tests per scenario
- [ ] Concurrency test scenarios
- [ ] Performance targets (latency, throughput)
- [ ] Load test parameters
- [ ] Regression test baselines

### 8. GATES & CHECKPOINTS (Critical)

For EACH phase:

- [ ] Go/no-go criteria
- [ ] Validation metrics
- [ ] SLO targets
- [ ] Remediation procedures
- [ ] Escalation paths

### 9. CROSS-PHASE DEPENDENCIES (Required)

- [ ] Phase-to-phase data flow
- [ ] Circular dependency detection
- [ ] Shared resources
- [ ] Synchronization needs
- [ ] Rollback procedures

### 10. OPERATIONAL CONCERNS (Important)

- [ ] Monitoring & observability
- [ ] Alerting strategy
- [ ] Disaster recovery
- [ ] Data persistence
- [ ] State consistency

## VERIFICATION CHECKLIST

Before proceeding, confirm:

- [ ] All 10 context categories above are documented
- [ ] No gaps identified in error scenarios
- [ ] All phase gates clearly defined
- [ ] Cross-phase dependencies mapped
- [ ] Testing strategy complete for all phases
- [ ] Technical risks identified and mitigated
- [ ] Team capacity confirmed
- [ ] Success metrics measurable

## OUTPUT REQUIREMENT

Extract COMPLETE context into:

1. PROJECT_INTAKE.md (project fundamentals)
2. PROJECT_ERROR_SCENARIOS.yaml (all error scenarios)
3. PROJECT_PHASE_MAP.yaml (phase breakdown)
4. PROJECT_PHASE_GATES.yaml (gates + criteria)
5. PROJECT_TEST_STRATEGY.yaml (testing approach)
6. PROJECT_DEPENDENCIES.yaml (cross-phase mapping)
7. PROJECT_RISKS.md (technical risks + mitigations)

## NO GAPS POLICY

Do NOT proceed with implementation if ANY of the 10 context categories above is incomplete.

If gap found:

1. Identify which categories are incomplete
2. Document specific missing information
3. Return to architecture team
4. Re-gather missing context
5. Retry extraction

## SUCCESS INDICATOR

Extraction is COMPLETE when:

- ✅ All 10 categories have detailed information
- ✅ Every story has 3-5 error scenarios
- ✅ Every phase has go/no-go criteria
- ✅ Every dependency is mapped
- ✅ Every test is specified
- ✅ No "TBD" or "TK" sections remain
- ✅ All numbers add up (story count, timeline, etc)
- ✅ No contradictions between documents

## NEXT STEPS AFTER EXTRACTION

1. ✅ Review extracted context with team
2. ✅ Validate all numbers and timelines
3. ✅ Confirm error scenarios are complete
4. ✅ Approve gate criteria
5. ✅ Sign off on risk mitigations
6. → Ready for 65-hour YOLO implementation
```

---

## Gap Analysis & Validation

### Gap Analysis Framework

```yaml
# GAP ANALYSIS CHECKLIST

PROJECT COMPLETENESS:

1. SCOPE COMPLETENESS
   - [ ] All stories defined
   - [ ] All story points estimated
   - [ ] All dependencies mapped
   - [ ] Total SP = sum of phases
   - Gap if: Any missing

2. ARCHITECTURE COMPLETENESS
   - [ ] All systems documented
   - [ ] All APIs defined
   - [ ] All databases specified
   - [ ] All deployment targets
   - Gap if: Any "TBD"

3. ERROR SCENARIO COMPLETENESS
   - [ ] 3-5 errors per story
   - [ ] All CRUD operations covered
   - [ ] All integrations covered
   - [ ] All user workflows covered
   - Gap if: Story with < 3 scenarios

4. TESTING COMPLETENESS
   - [ ] Happy path per story
   - [ ] Error paths per scenario
   - [ ] Concurrency covered
   - [ ] Performance targets set
   - Gap if: Any test "TBD"

5. GATE COMPLETENESS
   - [ ] 1 gate per phase minimum
   - [ ] Go/no-go criteria clear
   - [ ] Remediation defined
   - [ ] Escalation path clear
   - Gap if: Subjective criteria

6. DEPENDENCY COMPLETENESS
   - [ ] Phase-to-phase mapped
   - [ ] External dependencies listed
   - [ ] Circular deps identified
   - [ ] Fallbacks for each
   - Gap if: Any unresolved

7. RISK COMPLETENESS
   - [ ] Technical risks identified
   - [ ] Business risks identified
   - [ ] Mitigations defined
   - [ ] Contingencies planned
   - Gap if: Any "unknown risk"

8. TEAM COMPLETENESS
   - [ ] Capacity confirmed
   - [ ] Skills mapped
   - [ ] Training planned
   - [ ] Roles clear
   - Gap if: Uncertain availability

OVERALL COMPLETENESS:
If ANY gap detected → MUST resolve before implementation
If all clear → Ready for 65-hour YOLO prep
```

---

## Implementation Checklist

### Pre-Implementation (Day 0)

```markdown
## DAY 0: PRE-IMPLEMENTATION CHECKLIST

- [ ] All project context extracted (10 categories complete)
- [ ] Gap analysis passed (0 gaps remaining)
- [ ] Team signed off on scope + timeline
- [ ] Error scenarios reviewed + validated
- [ ] Gate criteria approved
- [ ] Test strategy approved
- [ ] Risk mitigations agreed
- [ ] Team capacity confirmed
- [ ] Tools/infrastructure ready (git, CI/CD, testing framework)

Result: READY FOR 65-HOUR IMPLEMENTATION
```

### Implementation (Days 1-7)

```markdown
## DAYS 1-7: IMPLEMENTATION SCHEDULE

### OPTION A: Intensive 4-Day Sprint

- Day 1: Phases 1-3 prep (24h cumulative)
- Day 2-3: Phases 4-6 prep (24h more)
- Day 4: Phases 7-9 + cross-phase (17h more)
- Result: 65h complete, all phases ready

### OPTION B: Weekly Implementation

- Week 1: Phases 1-3 prep (24h)
- Week 2: Phases 4-6 prep (24h)
- Week 3: Phases 7-9 + cross-phase (17h)
- Result: 65h spread, all phases ready

### OPTION C: Concurrent Execution + Prep

- Week 1-2: Phases 1-3 prep + execute Phase 1-2
- Week 3-4: Phases 4-6 prep + execute Phase 3
- Week 5-6: Phases 7-9 prep + execute Phase 4-5
- Result: Rolling implementation

### Deliverables Each Day:

- Error scenario YAML files
- Integration test suites
- Phase gate definitions
- Edge case documentation
- Handler implementations
- Commit to git (audit trail)

### Daily Validation:

- [ ] All files committed to git
- [ ] Tests passing
- [ ] No "TODO" sections
- [ ] Documentation complete
```

### Post-Implementation (Day 8+)

```markdown
## DAY 8+: EXECUTION PHASE

### Pre-Execution (1 day)

- [ ] Review complete YOLO blueprint
- [ ] Validate all gate criteria
- [ ] Confirm test framework working
- [ ] Test CI/CD pipeline
- [ ] Team training complete

### Execution (Days 9 onwards)

- [ ] Load sprint prompt
- [ ] Execute stories per plan
- [ ] Tests run automatically
- [ ] Gates validate automatically
- [ ] Gaps detected automatically
- [ ] Repairs applied automatically
- [ ] Accuracy maintained 99%+

### Success Indicators:

- ✅ All stories executed
- ✅ All tests passing
- ✅ All gates passing
- ✅ 99%+ accuracy
- ✅ 0-2 stories need rework
- ✅ Timeline maintained
- ✅ Zero surprises
```

---

## Quick Reference: File Checklist

```markdown
# BMAD YOLO PREPARATION: FILE DELIVERABLES CHECKLIST

## Documentation Files (Must Create)

- [ ] PROJECT_INTAKE.md (2-3 KB)
- [ ] PROJECT_ERROR_SCENARIOS.yaml (3-5 KB per story)
- [ ] PROJECT_PHASE_MAP.yaml (1-2 KB per phase)
- [ ] PROJECT_PHASE_GATES.yaml (1 KB per phase)
- [ ] PROJECT_TEST_STRATEGY.yaml (2-3 KB per phase)
- [ ] PROJECT_DEPENDENCIES.yaml (1-2 KB)
- [ ] PROJECT_RISKS.md (2-3 KB)

## Implementation Files (Must Create)

- [ ] Complete YOLO blueprint MD (500+ lines)
- [ ] Engineering blueprint MD (300+ lines)
- [ ] Decision framework MD (200+ lines)
- [ ] Summary MD (200+ lines)
- [ ] Error scenario handlers (code)
- [ ] Integration test suites (code)
- [ ] Phase executors (code)
- [ ] CI/CD automation YAML
- [ ] Prompt generator (code)
- [ ] Gap analyzer (code)
- [ ] Repair findings system (code)

## Total Output

- Documentation: 2000+ lines
- Code: 3000+ lines
- Total: 5000+ lines production-ready

## Commit Strategy

- Commit after each phase (not one big commit)
- Commit message must include phase summary
- Full git audit trail required
- Tag major milestones
```

---

## Conclusion

This template standardizes ANY project for YOLO-mode execution with 99%+ accuracy.

**Key Principle**: Prepare exhaustively upfront → Execute autonomously → Zero surprises

**Time Investment**: 65-75 hours prep
**Execution Timeline**: N weeks autonomous (no manual intervention)
**Accuracy Target**: 99%+ throughout project
**Audit Trail**: Complete git history

**You are now ready to transform ANY project into a 99%+ accuracy autonomous system.** 🚀
