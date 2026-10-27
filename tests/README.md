# SmartGlow Automated Test Strategy

SmartGlow implements testing across all application tiers to ensure reliability, security, and mathematical precision in e-commerce workflows.

## Test Tiers

### 1. Web Application Tests (Vitest & React Testing Library)
- **Component Tests**: Storefront catalog, filtering, search bar, product cards, interactive modals.
- **Cart & State Tests**: Cart item addition, quantity updates, removal, and price calculations.
- **Form Validation**: Customer checkout, address inputs, and registration forms.

### 2. Backend API Tests (pytest & httpx)
- **Endpoint Tests**: Category endpoints, product retrieval, filter queries, order creation.
- **Authentication & RBAC**: Customer token issuance, admin endpoint protection, invalid token rejection.
- **Data Integrity Tests**: Stock reduction upon order placement, atomic rollback upon payment failure.

### 3. AI Pipeline Unit Tests
- **Image Validation**: Blur detection threshold checks, low-light image rejections.
- **Preprocessing**: Coordinate normalization, ROI patch extraction.
- **Recommendation Logic**: Verification that allergic ingredients are strictly excluded from output recommendations.

## Running Tests
```bash
# Backend tests
cd backend && pytest -v

# Web tests
npm run test
```
