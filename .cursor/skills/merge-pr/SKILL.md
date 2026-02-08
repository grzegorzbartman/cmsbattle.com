---
name: merge-pr
description: Merge PR
disable-model-invocation: true
---

# Merge PR

- Commit all changes
- Add comment to GitHub issue: `gh issue comment [ID] --body "Task completed, merging PR now"`
- Merge PR (use gh cli) - do squash - merge to "main" branch
- Switch to main branch
- Pull current main
