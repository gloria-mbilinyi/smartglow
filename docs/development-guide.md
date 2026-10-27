# SmartGlow — Development & Contribution Guide

This guide establishes conventions, commit guidelines, and testing workflows for the SmartGlow monorepo.

---

## 1. Git Workflow & Commit Guidelines

We use **Conventional Commits** (`type(scope): description`) to ensure clean history and traceable contributions.

### Allowed Commit Types:
- `feat`: New feature or user-facing functionality.
- `fix`: Bug fix.
- `docs`: Documentation updates or design specifications.
- `chore`: Repository configuration, dependency bumps, or toolchain changes.
- `refactor`: Code reorganization without functional or behavioral changes.
- `test`: Adding or updating test suites.
- `style`: Formatting or whitespace improvements.

### Scopes:
- `web`: Web application / React storefront.
- `mobile`: Flutter iOS/Android application.
- `api` / `backend`: FastAPI server endpoints and routers.
- `db`: Database models, schemas, and migrations.
- `ai`: Computer vision, preprocessing, or ML models.
- `shop`: Cart, checkout, orders, and payment.
- `auth`: Registration, login, JWT, and permissions.

### Example Commits:
```bash
git commit -m "docs: define SmartGlow project requirements"
git commit -m "chore: initialize monorepo structure"
git commit -m "docs: document application architecture"
git commit -m "feat(web): create responsive cosmetics storefront"
git commit -m "feat(mobile): add Flutter navigation"
git commit -m "feat(api): implement product catalogue endpoints"
git commit -m "feat(db): add initial database migrations"
git commit -m "feat(ai): add image preprocessing pipeline"
```

---

## 2. Code Quality & Pre-Commit Checklist

Before pushing or submitting commits:
1. Ensure all packages compile cleanly without syntax or type errors.
2. Ensure no hardcoded credentials, secret keys, or test passwords exist.
3. Validate that `.env` files and user uploaded photos are not staged in git.
4. Run automated test suites relevant to modified components.

---

## 3. Contribution Verification & Remote Sync

If automatic Git pushes cannot be completed within an isolated sandbox environment due to credentials, changes are committed locally, and remote push instructions are generated for local execution:

```bash
git add .
git commit -m "type(scope): concise description"
git push origin main
```
