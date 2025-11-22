# 🔄 CURSOR AGENT LOOPING FIX

## ⚠️ **ROOT CAUSE IDENTIFIED**
Your project has **excessive `alwaysApply: true` rules** causing agent context overload and looping behavior.

## 🎯 **IMMEDIATE FIXES**

### 1. **Rule Audit & Optimization**
Convert most `alwaysApply: true` rules to more specific patterns:

**Current:**
```yaml
alwaysApply: true
```

**Better:**
```yaml
description: "Apply when working with TypeScript files for React components"
globs: "src/**/*.tsx, src/**/*.ts"
alwaysApply: false
```

### 2. **Priority Rules to Keep as `alwaysApply: true`:**
- `.cursor/rules/core/01_PRODUCTION_STANDARDS.mdc` (keep)
- `.cursor/rules/core/00_MANDATORY_RAG_USAGE.mdc` (keep)
- **Maximum 3-5 critical rules only**

### 3. **Convert to Agent-Select Rules:**
For rules that should be available on-demand:
```yaml
description: "Use for architecture decisions and design patterns when refactoring or creating new components"
globs:
alwaysApply: false
```

### 4. **Cursor Settings Fix:**
Add to Cursor settings to prevent rule editor issues:
```json
"workbench.editorAssociations": {
  "*.mdc": "default"
}
```

## 🛠️ **SYSTEMATIC CONVERSION**

### Step 1: Backup Current Rules
```bash
cp -r .cursor/rules .cursor/rules-backup-$(date +%Y%m%d)
```

### Step 2: Convert Rules by Category

**Development Process Rules** → Convert to glob-based:
- `development/self_improve.mdc` → Target specific file types
- `development/cursor_rules.mdc` → Agent-select only

**Tool Usage Rules** → Convert to description-based:
- `development/06_TOOL_USAGE_PROTOCOLS.mdc` → Agent-select
- `development/02_SUPABASE_MCP_PROTOCOLS.mdc` → Target Supabase files

**Architecture Rules** → Convert to pattern-based:
- `development/03_ARCHITECTURE_PATTERNS.mdc` → Target source code files

## ✅ **VERIFICATION**

After converting rules:
1. **Restart Cursor** completely
2. **Test with simple MCP calls** (like Supabase list tables)
3. **Monitor for looping behavior reduction**
4. **Gradually re-enable rules** if needed

## 📊 **EXPECTED IMPROVEMENTS**
- ✅ **Reduced context window pressure**
- ✅ **Faster response times**
- ✅ **Elimination of repetitive tool calls**
- ✅ **More focused agent behavior**

## 🚨 **EMERGENCY BYPASS**
If looping continues, temporarily disable all always-apply rules:
```bash
# Backup and disable
find .cursor/rules -name "*.mdc" -exec sed -i '' 's/alwaysApply: true/alwaysApply: false/g' {} \;
```

---
**Source:** Research from Cursor Community Forums & BMad's Cursor Rules Best Practices
