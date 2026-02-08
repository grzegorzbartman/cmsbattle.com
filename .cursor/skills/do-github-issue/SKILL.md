---
name: do-github-issue
description: Do GitHub Issue
disable-model-invocation: true
---

# Do GitHub Issue

Required parameter: GitHub issue ID or link to issue.

## Preparation
- Create empty file ./tmp/task-[ID].md
- Based on this file and GitHub description, fill the empty file with task list. Use - [ ] to mark done/not done. Update it during task execution
- Read ./AGENTS.md
- Validate parameter - check if ID or link provided; if link, extract ID from it
- Check issue status on GitHub - verify issue is open (not closed/merged)
- Fetch issue details - display title and description before starting work
- Check if branch `issue/[ID]` already exists locally or remotely
- Check if working directory is clean - no uncommitted changes before start
- Check which branch you're starting from - ensure you're on the correct branch (main/staging)
- Update base branch - run `git pull` on base branch before creating new branch

## Working on Task
- Add comment to GitHub issue: `gh issue comment [ID] --body "Starting work on this issue"`
- Create new branch: issue/[ID-github-issue]
- Execute task according to GitHub description

## Tests and Verification
- Run command .cursor/commands/do-tests.md
- Run command .cursor/commands/pre-commit-check.md

## Before Commit
- Check if there are changes to commit - run `git status`
- Check if all changes are staged
- Use correct commit message format - per AGENTS.md: `[type]: description` (max 50 chars)

## Commit and Push
- Commit in branch
- Check if branch is up to date with remote - avoid conflicts before push
- Push branch

## Pull Request
- Create pull request
- Automatically link PR with issue - add "Closes #[ID]" or "Fixes #[ID]" in PR description
- Automatically open PR in browser - use `gh pr create --web` if available
- Optionally add PR labels - based on issue labels
- Check reviewers - if reviewers assigned to issue, add them to PR

## Documentation
- Update TASKS_AND_PROBLEMS.md - document changes after completing task
