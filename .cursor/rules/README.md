# Cerebral Platform Development Rules

This directory contains the comprehensive development rules and guidelines for the Cerebral Platform - an enterprise-grade, multi-industry SaaS framework serving Fortune 500 customers.

## 🚨 CRITICAL: All Rules Must Be Followed

**These rules are MANDATORY and must be followed on EVERY interaction. They contain production standards, compliance requirements, and architectural patterns essential for enterprise operation.**

## 📋 Rule Categories

### **Foundation & Infrastructure Rules**

1. **[00_MANDATORY_RAG_USAGE.mdc](00_MANDATORY_RAG_USAGE.mdc)** - AutoDoc RAG system usage (CRITICAL)
2. **[01_RAG_ENFORCEMENT.mdc](01_RAG_ENFORCEMENT.mdc)** - RAG accountability system (ZERO TOLERANCE)
3. **[01_PRODUCTION_STANDARDS.mdc](01_PRODUCTION_STANDARDS.mdc)** - Enterprise production requirements
4. **[02_SUPABASE_MCP_PROTOCOLS.mdc](02_SUPABASE_MCP_PROTOCOLS.mdc)** - Database operation protocols

### **Architecture & Development**

5. **[03_ARCHITECTURE_PATTERNS.mdc](03_ARCHITECTURE_PATTERNS.mdc)** - Multi-tenant SaaS architecture patterns
6. **[04_VERIFICATION_PROTOCOLS.mdc](04_VERIFICATION_PROTOCOLS.mdc)** - Zero-tolerance completion verification
7. **[06_TOOL_USAGE_PROTOCOLS.mdc](06_TOOL_USAGE_PROTOCOLS.mdc)** - Mandatory tool selection hierarchy
8. **[07_NAMING_CONVENTION_ENFORCEMENT.mdc](07_NAMING_CONVENTION_ENFORCEMENT.mdc)** - CEREBRAL naming standards

### **🏛️ Enterprise Compliance (NEW - CRITICAL)**

9. **[08_ENTERPRISE_COMPLIANCE_STANDARDS.mdc](08_ENTERPRISE_COMPLIANCE_STANDARDS.mdc)** - **COMPREHENSIVE MULTI-STANDARD COMPLIANCE**
   - **SOC2 Type II** - Continuous security and availability controls
   - **GDPR** - EU data protection and privacy requirements
   - **ISO27001** - Information security management system
   - **HIPAA** - Healthcare data protection (healthcare modules)
   - **Industry Standards** - Per vertical compliance requirements

### **🎯 AI Accuracy & Quality Assurance (NEW - CRITICAL)**

10. **[09_AI_ACCURACY_VERIFICATION_STANDARDS.mdc](09_AI_ACCURACY_VERIFICATION_STANDARDS.mdc)** - **ZERO TOLERANCE ACCURACY FRAMEWORK**
    - **Hallucination Prevention** - Comprehensive detection and prevention protocols
    - **Source Verification** - Mandatory factual grounding requirements
    - **Multi-Layer Validation** - AI + Human verification pipelines
    - **Continuous Monitoring** - Real-time accuracy drift detection
    - **Compliance Integration** - Enterprise regulatory alignment

### **Documentation & Workflow**

10. **[05_DOCUMENTATION_REFERENCES.mdc](05_DOCUMENTATION_REFERENCES.mdc)** - Key documentation resources

### **Development Utilities**

12. **[cursor_rules.mdc](cursor_rules.mdc)** - Rule formatting and structure guidelines
13. **[self_improve.mdc](self_improve.mdc)** - Rule improvement and maintenance

## 🎯 Primary Objectives

### **Enterprise-Scale Multi-Industry Framework**

- **Foundation Layer**: Knowledge base core (Priority 1 - Complete First)
- **Enterprise Expansion**: Industry verticals (automotive, healthcare, legal, financial)
- **Infrastructure Layer**: Enterprise-grade security, compliance, performance

### **Compliance-First Development**

- **Multi-Standard Compliance**: SOC2 + GDPR + ISO27001 + HIPAA + Industry-Specific
- **Privacy by Design**: GDPR Article 25 compliance in all features
- **Security-First**: ISO27001 systematic security controls
- **Healthcare Ready**: HIPAA technical, administrative, and physical safeguards

### **Production-Grade Standards**

- **Performance**: 99.97% bundle optimization maintained
- **Reliability**: Zero-downtime enterprise operation
- **Scalability**: Multi-tenant Fortune 500 ready
- **Compliance**: All regulatory requirements met
- **Code Quality**: Mandatory directives for conciseness, cleanliness, documentation (see [01_PRODUCTION_STANDARDS.mdc](core/01_PRODUCTION_STANDARDS.mdc))

## 🚨 Critical Compliance Integration

**NEW REQUIREMENT**: All development must now consider **MULTIPLE COMPLIANCE STANDARDS** simultaneously:

### **Before Any Development Work:**

```bash
# MANDATORY compliance check
cd backend-python && venv/bin/python rag_query_cli.py search "compliance requirements [feature/module]"
cd backend-python && venv/bin/python rag_query_cli.py search "GDPR HIPAA ISO27001 SOC2 requirements"
```

### **Code Review Checklist Addition:**

- [ ] **SOC2**: Audit trails and access controls implemented
- [ ] **GDPR**: Privacy by design and consent mechanisms
- [ ] **ISO27001**: Security controls documented and tested
- [ ] **HIPAA**: PHI protection for healthcare features
- [ ] **Industry Standards**: Vertical-specific compliance verified

### **Database Schema Requirements:**

- [ ] **Multi-tenant isolation** (SOC2 + ISO27001)
- [ ] **GDPR consent tracking** with audit trails
- [ ] **Data classification** (ISO27001 asset management)
- [ ] **Retention policies** (All standards)
- [ ] **Encryption at rest** (HIPAA + GDPR)

## 📊 Rule Priority Matrix

| Priority | Rule Category         | Business Impact        | Compliance Risk         |
| -------- | --------------------- | ---------------------- | ----------------------- |
| CRITICAL | Compliance Standards  | Revenue Loss           | Legal/Financial         |
| CRITICAL | RAG Usage             | Development Efficiency | Architecture Violations |
| HIGH     | Production Standards  | Customer Trust         | Business Continuity     |
| HIGH     | Architecture Patterns | Scalability            | Technical Debt          |
| MEDIUM   | Tool Usage            | Productivity           | Development Friction    |

## 🔄 Rule Maintenance

### **Quarterly Reviews**

- **Compliance Updates**: New regulatory requirements
- **Architecture Evolution**: Platform scaling needs
- **Performance Standards**: Optimization targets
- **Tool Integration**: Development workflow efficiency

### **Immediate Updates Required For:**

- **Regulatory Changes**: New compliance requirements
- **Security Incidents**: Enhanced security measures
- **Performance Regressions**: Optimization standard updates
- **Architecture Violations**: Pattern enforcement strengthening

## 🎯 Success Metrics

### **Compliance Success**

- **Zero Compliance Violations**: All standards continuously met
- **Audit Pass Rate**: 100% for all compliance frameworks
- **Incident Response**: Compliance breach notification within required timeframes

### **Development Success**

- **Rule Adherence**: 100% compliance with all development rules
- **Performance Maintenance**: Bundle optimization targets maintained
- **Architecture Consistency**: Zero pattern violations

### **Business Success**

- **Enterprise Customer Retention**: Compliance-driven trust
- **Market Expansion**: Multi-industry regulatory readiness
- **Revenue Growth**: Compliance-enabled market access

---

**CRITICAL REMINDER**: These rules protect the enterprise platform's legal compliance, customer trust, and business viability. Every rule violation creates immediate risk across multiple dimensions: legal, financial, operational, and reputational.

**Compliance is not optional - it's the foundation of enterprise operation.**

_Last Updated: July 18, 2025_
_Version: 1.0.0 - Multi-File Rule System with Enhanced RAG Integration_

## 🚀 NEW: React Optimization System

### Automated Bundle Size & Performance Optimization

The platform now includes a comprehensive React optimization system to maintain our 99.97% bundle size optimization achievement:

#### 📊 Optimization Files

- **React Optimization Rules**: `.cerebral/rules/react_optimization.json`
- **Comprehensive Plan**: `.cerebral/rules/react_optimization_plan.md`
- **Analysis Tool**: `.cerebral/rules/optimization-checker.ts`
- **Pre-commit Hook**: `.cerebral/hooks/react-optimization-pre-commit`

#### 🔧 Usage Commands

```bash
# Run comprehensive optimization analysis
tsx .cerebral/rules/optimization-checker.ts

# View detailed optimization plan
open .cerebral/rules/react_optimization_plan.md

# Install pre-commit optimization hook
cp .cerebral/hooks/react-optimization-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

#### 🎯 Optimization Targets

**Critical Thresholds** (Blocks commits):

- File size: >400KB
- Line count: >2000 lines

**Warning Thresholds** (Allows commits with warnings):

- File size: >75KB
- Line count: >400 lines

#### 📋 Optimization Features

1. **Automated File Analysis**
   - Size and line count monitoring
   - Content-based optimization suggestions
   - Tree-shaking and lazy loading recommendations

2. **Pre-commit Integration**
   - Automatic checks on every commit
   - Critical file blocking with suggestions
   - Bundle size impact analysis

3. **Comprehensive Planning**
   - 4-phase optimization strategy
   - Domain-specific decomposition guides
   - Performance monitoring integration

4. **Enterprise Integration**
   - AutoDoc system integration
   - RAG-powered analysis
   - Production-ready automation

## 🔄 Rule Development Workflow

### Adding New Rules

Follow [cursor_rules.mdc](cursor_rules.mdc) for proper rule formatting and structure.

### Rule Improvement

Use [self_improve.mdc](self_improve.mdc) guidelines for continuous rule enhancement.

### Quality Assurance

- Rules must be actionable and specific
- Examples should come from actual code
- Cross-reference related rules
- Maintain up-to-date documentation links

## 🚨 Critical Compliance Points

### Multi-Standard Compliance

The platform must maintain compliance with multiple enterprise standards simultaneously:

- **SOC2 Type II** - Continuous security and availability controls
- **GDPR** - EU data protection and privacy requirements
- **ISO27001** - Information security management system
- **HIPAA** - Healthcare data protection (healthcare modules)

### Performance Standards

- Maintain 99.97% bundle size optimization
- All components >20KB must use lazy loading
- TypeScript compilation <10s
- Initial page load <1s

### Architecture Requirements

- Use RAG system before any development work
- Follow Core[Feature][Type] naming patterns
- Implement proper error boundaries
- Maintain multi-tenant isolation

## 💡 Quick Reference

### Before Every Development Session

1. Load context: `cd backend-python && venv/bin/python rag_query_cli.py search "relevant topic"`
2. Check optimization: `tsx .cerebraflow/rules/optimization-checker.ts`
3. Review current tasks: `task_list` (MCP) or CerebraFlow local CLI
4. Verify dependencies: `validate_dependencies`

### Before Every Commit

1. Pre-commit hook runs automatically
2. Address any critical optimization issues
3. Verify compliance with all rules
4. Update documentation if needed

### Emergency Procedures

- **Critical Blocker**: Display 'Critical blocker reached' with full details
- **Rule Violations**: Immediate correction required
- **Performance Regression**: Rollback and re-optimize
- **Compliance Issues**: Stop work until resolved

---

**Remember: These rules exist to maintain enterprise-grade quality for a production platform serving real Fortune 500 customers. Every rule violation potentially impacts real revenue and customer trust.**

_Last Updated: July 18, 2025_
_Rule Count: 11 core rules + optimization system_
_Compliance Level: Enterprise Multi-Standard_
