# SmartGlow — System Architecture & Design Specification

## 1. High-Level Architecture

SmartGlow implements a unified services architecture where multiple client applications (Web, Android, iOS) interface with a centralized FastAPI backend, a relational PostgreSQL database, and a specialized AI inference pipeline.

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATIONS                   │
├──────────────────────────┬─────────────────────────────┤
│ Responsive Web (React)   │ Mobile Apps (Flutter)       │
│ • Tailwind CSS Storefront│ • Flutter 3.x (Android/iOS) │
│ • Admin Dashboard        │ • Native Camera Integration │
│ • Customer Account       │ • Offline-First Caching     │
└────────────┬─────────────┴──────────────┬──────────────┘
             │                            │
             │ HTTPS / REST API (JSON)    │
             ▼                            ▼
┌────────────────────────────────────────────────────────┐
│             FASTAPI BACKEND SERVICE (PORT 8000)        │
├────────────────────────────────────────────────────────┤
│ • Auth & User Management (JWT + RBAC)                  │
│ • Cosmetics Product & Inventory Catalog                │
│ • Order Lifecycle & Checkout Management                │
│ • AI Skin Diagnostic & Recommendation Orchestrator     │
│ • Admin Analytics & Reporting                          │
└────────────┬────────────────────────────┬──────────────┘
             │                            │
             ▼ Async SQLAlchemy           ▼ In-Memory / Python Bridge
┌──────────────────────────┐  ┌──────────────────────────┐
│   POSTGRESQL DATABASE    │  │   AI ANALYSIS ENGINE     │
├──────────────────────────┤  ├──────────────────────────┤
│ • Users & Profiles       │  │ • OpenCV Preprocessing   │
│ • Categories & Products  │  │ • Face Landmark Detection │
│ • Ingredients & Concerns │  │ • TensorFlow/Keras Model │
│ • Orders, Items & Cart   │  │ • Rule-Based Matcher     │
│ • Skin Analysis History  │  │ • Recommendation Engine  │
└──────────────────────────┘  └──────────────────────────┘
```

## 2. Core Entities & Data Relationships

1. **User**: Authentication credentials, customer metadata, skin profile preferences, user role (customer, admin).
2. **SkinProfile**: Associated with a user or guest session; stores skin type (oily, dry, combination, sensitive, normal), tone classification, primary concerns, and allergy tags.
3. **Product**: Title, slug, brand, description, category_id, price, stock_quantity, images, ingredients list, target skin types, target skin concerns.
4. **Category**: Skincare, makeup, sun protection, cleansers, serums, moisturizers.
5. **Ingredient**: Scientific name, common name, safety rating, beneficial properties (e.g., niacinamide, hyaluronic acid, retinol, salicylic acid).
6. **SkinAnalysisLog**: Uploaded image metadata (hashes/ephemeral identifiers, no raw sensitive face leaks), detection outputs, confidence scores, generated product recommendations.
7. **Order & OrderItem**: Customer reference, order status (pending, processing, shipped, delivered, cancelled), payment method (cash on delivery, mobile money), pricing breakdown, items snapshot.

## 3. Client Interaction & API Protocol

- **Transport**: RESTful over HTTPS.
- **Payloads**: Structured JSON formatted using Pydantic schemas.
- **Authentication**: Bearer tokens (`Authorization: Bearer <jwt_access_token>`).
- **File Uploads**: `multipart/form-data` with strict MIME-type and image size validation.
- **AI Recommendation Contract**:
  - Request: `POST /api/v1/skin-analysis/analyze` (image file + optional user preferences)
  - Response: Identified skin characteristics, confidence metrics, recommended routine steps (Cleanse, Treat, Hydrate, Protect), and matched products with explanation tags.
