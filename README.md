# SmartGlow — AI-Powered Cosmetics & Personalized Skincare E-Commerce Platform

SmartGlow is an intelligent cosmetics and beauty e-commerce ecosystem that combines dermatological skin analysis, AI-driven personalized product recommendations, and a modern shopping experience.

---

## 🌟 Key Highlights

- **AI Skin Analysis**: Computer vision pipeline evaluating skin attributes, tone, texture, and concerns.
- **Personalized Recommendations**: Context-aware recommendation engine matching skincare ingredients to individual skin profiles and sensitivities.
- **Omnichannel Architecture**: Unified backend and AI service powering Responsive Web (React + TypeScript) and Mobile (Flutter for iOS & Android).
- **E-Commerce & Orders**: Product catalog, multi-category filtering, shopping cart, cash-on-delivery & mobile-money checkout, and customer order management.
- **Admin Dashboard**: Real-time inventory tracking, catalog updates, order fulfillment, and analytics.

---

## 🏗️ Repository Architecture

SmartGlow is organized as a unified monorepo sharing a single FastAPI backend, PostgreSQL database, and AI service:

```
smartglow/
├── web/ (or src/)      # React + TypeScript responsive web storefront
├── mobile/             # Flutter & Dart cross-platform mobile app (iOS & Android)
├── backend/            # Python FastAPI REST API server & database layer
├── ai/                 # TensorFlow / Keras skin analysis & OpenCV preprocessing
├── docs/               # Architecture specifications, diagrams & API docs
├── tests/              # Multi-tier test suites (unit, integration, end-to-end)
├── README.md           # Project master documentation
├── .gitignore          # Multi-language Git ignore configuration
└── .env.example        # Environment variable definitions
```

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Web Storefront** | React 19, TypeScript, Tailwind CSS, Vite | Responsive customer shopping & admin portal |
| **Mobile App** | Flutter 3.x, Dart | Native iOS & Android client applications |
| **API Backend** | Python 3.11+, FastAPI, Pydantic | High-performance asynchronous REST API |
| **Database & ORM** | PostgreSQL, SQLAlchemy / Alembic | Relational data persistence & migrations |
| **AI / ML Engine** | TensorFlow / Keras, OpenCV, NumPy | Image preprocessing & skin diagnostic models |
| **Authentication** | JWT (JSON Web Tokens), OAuth2 | Secure customer & administrator authorization |
| **Testing** | pytest (Python), Vitest/Jest (React), Flutter test | Automated test suites |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ & npm/bun
- **Python**: v3.11+ & pip/virtualenv
- **Flutter SDK**: v3.19+ (for mobile development)
- **PostgreSQL**: v15+ (local or Cloud SQL instance)

### 1. Web Storefront Setup

```bash
# Install dependencies
npm install

# Run the local development server
npm run dev
# Web application available at http://localhost:3000
```

### 2. Backend API Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
# API docs available at http://localhost:8000/docs
```

### 3. Mobile Setup (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

---

## 📐 Implementation Roadmap

- [x] **Phase 1: Foundation & Monorepo Initialization** (Docs, Architecture, Configs)
- [ ] **Phase 2: Web Storefront** (Responsive Catalog, Filter, Product Detail, Cart)
- [ ] **Phase 3: Backend & Database** (FastAPI, PostgreSQL Models, Product Endpoints)
- [ ] **Phase 4: Mobile Application** (Flutter iOS/Android Storefront & Auth)
- [ ] **Phase 5: E-Commerce & Checkout** (User Accounts, Orders, Inventory, Admin)
- [ ] **Phase 6: AI Skin Analysis** (Image Preprocessing, Quality Check, Diagnostics)
- [ ] **Phase 7: Personalized Recommendations** (Ingredient Matching & Explanations)
- [ ] **Phase 8: Testing & Production Deployment** (CI/CD, Builds, APKs)

---

## 🛡️ Ethics, Privacy & Safety

SmartGlow's skin analysis service is designed strictly for **cosmetic enhancement and beauty recommendations**. It does not perform clinical diagnoses or medical treatment. User photos are processed with strict consent, encrypted in transit, and never permanently retained without explicit user permission.
