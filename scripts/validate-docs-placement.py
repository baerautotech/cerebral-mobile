#!/usr/bin/env python3
"""Documentation File Placement Validator (P0 ENFORCEMENT)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT_ALLOWLIST = {
    "README.md",
    "CLAUDE.md",
    ".env",
    ".env.example",
    "LICENSE",
    ".gitignore",
    ".gitattributes",
    ".cursorrules",
    "Makefile",
    "makefile",
    "justfile",
    "pyproject.toml",
    "package.json",
    "uv.lock",
    "ruff.toml",
    "setup.cfg",
    "pyrightconfig.json",
    "openapitools.json",
}

MUST_BE_IN_DOCS = {
    "session-",
    "checkpoint-",
    "summary-",
    "phase-",
    "pattern-",
    "analysis-",
    "plan-",
    "audit-",
    "report-",
    "handoff-",
    "guide-",
    "blueprint-",
    "deployment-",
    "migration-",
    "architecture-",
}


def validate_markdown_files(files: list[str]) -> list[tuple[str, str, str]]:
    """Validate markdown file placement."""
    violations: list[tuple[str, str, str]] = []
    for file_path in files:
        path = Path(file_path)
        if path.suffix != ".md":
            continue
        if path.parent.name == "cerebral" or str(path.parent) == ".":
            if path.name in ROOT_ALLOWLIST:
                continue
            should_be_in_docs = any(path.name.lower().startswith(p) for p in MUST_BE_IN_DOCS)
            if should_be_in_docs or path.name[0].isupper():
                msg = (
                    "Move to docs/{category}/{subcategory}/ "
                    "(see 00_MASTER_DOCUMENTATION_STANDARDS.mdc)"
                )
                violations.append((file_path, "Root placement violation", msg))
    return violations


def main() -> int:
    """Validate all staged files."""
    files = sys.argv[1:]
    if not files:
        return 0
    violations = validate_markdown_files(files)
    if violations:
        print("❌ DOCUMENTATION PLACEMENT VALIDATION FAILED (P0 RULE)\n")
        print("=" * 80)
        for file_path, issue, suggestion in violations:
            print(f"\n📁 {file_path}\n   ❌ {issue}\n   💡 {suggestion}")
        print("\n" + "=" * 80)
        print("\n📋 Root directory allowlist:")
        for fn in sorted(ROOT_ALLOWLIST):
            print(f"   ✅ {fn}")
        print("\n📂 Allowed documentation categories:")
        for cat in [
            "00-QUICK-START/",
            "01-DEPLOYMENT/",
            "02-OBSERVABILITY/",
            "03-SECURITY/",
            "04-OPERATIONS/",
            "05-ARCHITECTURE/",
            "06-COMPLIANCE/",
            "07-REFERENCE/",
            "archive/phase-archive/",
            "archive/session-archive/",
            "archive/epic-archive/",
        ]:
            print(f"   • docs/{cat}")
        print("\n❌ COMMIT BLOCKED - Fix placement and try again")
        return 1
    print("✅ Documentation placement validation passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
