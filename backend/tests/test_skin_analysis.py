import io
import base64
import pytest
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

from app.main import app
from app.models.product import Product
from app.models.category import Category
from app.models.user import User


@pytest.fixture
def sample_clear_face_image_b64() -> str:
    """Generate a clean synthetic photographic canvas fixture with distinct facial ROIs and sharp edges."""
    img = Image.new("RGB", (400, 400), color=(225, 195, 175))
    draw = ImageDraw.Draw(img)

    # Forehead (slight shine)
    draw.rectangle([120, 60, 280, 140], fill=(230, 200, 180))
    # T-Zone / Nose (high specular shine)
    draw.rectangle([160, 140, 240, 260], fill=(245, 220, 205))
    # Left Cheek (moderate redness)
    draw.rectangle([60, 180, 150, 300], fill=(235, 160, 160))
    # Right Cheek (moderate redness)
    draw.rectangle([250, 180, 340, 300], fill=(235, 160, 160))
    # Chin
    draw.rectangle([140, 300, 260, 370], fill=(220, 190, 170))

    # Add sharp high-frequency edge gradients across the face to establish clear focus
    for i in range(50, 350, 6):
        draw.line([(i, 60), (i, 340)], fill=(130, 100, 85) if (i // 6) % 2 == 0 else (240, 215, 195), width=2)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")


@pytest.fixture
def sample_blurry_image_b64() -> str:
    """Generate a uniform blurry/flat image that fails the Laplacian sharpness threshold."""
    img = Image.new("RGB", (400, 400), color=(140, 140, 140))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=30)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")


@pytest.fixture
def sample_dark_image_b64() -> str:
    """Generate an underexposed image that fails the minimum luminance threshold."""
    img = Image.new("RGB", (400, 400), color=(15, 15, 15))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=70)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")


def test_get_diagnostic_presets(client: TestClient):
    """Verify diagnostic test presets endpoint returns synthetic diverse test samples."""
    res = client.get("/api/v1/skin-analysis/presets")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    preset_ids = [p["id"] for p in data]
    assert "preset_balanced" in preset_ids
    assert "preset_reactive_redness" in preset_ids
    assert "preset_tzone_shine" in preset_ids


def test_insufficient_quality_blurred_image(client: TestClient, sample_blurry_image_b64: str):
    """Verify blurry capture is caught with non-clinical feedback without forcing classification."""
    payload = {"image_base64": sample_blurry_image_b64}
    res = client.post("/api/v1/skin-analysis/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["quality"]["is_acceptable"] is False
    assert "Motion blur" in data["quality"]["feedback_message"]
    assert data["observable_metrics"]["is_reliable"] is False
    assert "Insufficient Image Quality" in data["observable_metrics"]["estimated_skin_tendency"]
    # Does not force unvalidated recommendations on corrupted capture
    assert len(data["recommendations"]) == 0
    assert "exclusively designed for cosmetic" in data["disclaimer"]


def test_insufficient_quality_underexposed_image(client: TestClient, sample_dark_image_b64: str):
    """Verify underexposed capture triggers lighting feedback."""
    payload = {"image_base64": sample_dark_image_b64}
    res = client.post("/api/v1/skin-analysis/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["quality"]["is_sufficient_lighting"] is False
    assert data["quality"]["is_acceptable"] is False
    assert "Low lighting detected" in data["quality"]["feedback_message"]


def test_successful_facial_skin_analysis(client: TestClient, sample_clear_face_image_b64: str, db_session):
    """Verify clean image yields 5 facial regions, observable metrics, and non-clinical disclaimer."""
    # Ensure test product exists in DB
    cat = db_session.query(Category).first()
    if not cat:
        cat = Category(name="Serums", slug="serums-test-cat", description="Botanical serums")
        db_session.add(cat)
        db_session.commit()

    test_prod = db_session.query(Product).filter(Product.id == "sg-test-soothing").first()
    if not test_prod:
        test_prod = Product(
            id="sg-test-soothing",
            name="Centella Calming Elixir",
            subtitle="Soothing Barrier Restorative",
            slug="centella-calming-elixir",
            category_id=cat.id,
            price=45.0,
            rating=4.9,
            reviews_count=80,
            skin_types=["All", "Sensitive"],
            skin_concerns=["Redness", "Sensitivity"],
            key_ingredients_list=["Centella Asiatica", "Ceramides"],
            all_ingredients="Aqua, Glycerin, Centella Asiatica Extract, Ceramide NP, Panthenol.",
            description="Calms facial surface redness and reinforces fragile lipid barriers.",
            stock_count=50,
            image_url="/test.jpg",
            is_active=True,
        )
        db_session.add(test_prod)
        db_session.commit()

    payload = {
        "image_base64": sample_clear_face_image_b64,
        "user_skin_type": "Sensitive",
        "user_concerns": ["Redness"],
    }
    res = client.post("/api/v1/skin-analysis/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["quality"]["is_acceptable"] is True
    assert data["observable_metrics"]["is_reliable"] is True
    assert data["observable_metrics"]["overall_confidence"] >= 50.0

    # 5 facial regions mapped
    regions = data["regions"]
    assert len(regions) == 5
    region_names = [r["region_name"] for r in regions]
    assert "Forehead" in region_names
    assert "Nose & T-Zone" in region_names
    assert "Left Cheek" in region_names
    assert "Right Cheek" in region_names
    assert "Chin" in region_names

    # Explainable recommendations
    recommendations = data["recommendations"]
    assert len(recommendations) > 0
    first_rec = recommendations[0]
    assert "why_it_matches" in first_rec
    assert "allergen_safety_status" in first_rec
    assert "target_trait" in first_rec


def test_strict_allergen_exclusion_in_recommendations(client: TestClient, db_session):
    """Verify that formulations containing a customer's known allergen are strictly excluded."""
    cat = db_session.query(Category).first()
    if not cat:
        cat = Category(name="Serums", slug="serums-allergen-cat", description="Botanical serums")
        db_session.add(cat)
        db_session.commit()

    # Product with Niacinamide
    p1 = Product(
        id="sg-allergen-test-niacinamide",
        name="Niacinamide Clarifying Fluid",
        slug="niacinamide-clarifying-fluid",
        category_id=cat.id,
        price=38.0,
        rating=4.7,
        skin_types=["Oily", "Combination"],
        skin_concerns=["Acne", "Dullness"],
        key_ingredients_list=["10% Niacinamide", "Zinc PCA"],
        all_ingredients="Aqua, Niacinamide, Zinc PCA, Phenoxyethanol.",
        description="Clarifying active fluid.",
        stock_count=40,
        image_url="/test2.jpg",
        is_active=True,
    )
    # Product without Niacinamide
    p2 = Product(
        id="sg-safe-test-squalane",
        name="Pure Plant Squalane Oil",
        slug="pure-plant-squalane-oil",
        category_id=cat.id,
        price=42.0,
        rating=4.9,
        skin_types=["All", "Dry"],
        skin_concerns=["Dehydration"],
        key_ingredients_list=["100% Plant Squalane"],
        all_ingredients="Squalane.",
        description="Pure biomimetic squalane.",
        stock_count=40,
        image_url="/test3.jpg",
        is_active=True,
    )
    db_session.add_all([p1, p2])
    db_session.commit()

    # Request with Niacinamide declared as an allergen
    payload = {
        "manual_optical_measurements": {"redness": 30.0, "shine": 70.0, "texture": 30.0, "pores": 60.0},
        "known_allergens": ["Niacinamide"],
    }
    res = client.post("/api/v1/skin-analysis/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()

    rec_ids = [r["product_id"] for r in data["recommendations"]]
    # Must NOT recommend the product with Niacinamide
    assert "sg-allergen-test-niacinamide" not in rec_ids
    for rec in data["recommendations"]:
        assert "niacinamide" not in " ".join(rec["key_active_ingredients"]).lower()
        assert "Verified Safe" in rec["allergen_safety_status"]


def test_authenticated_customer_auto_inherits_saved_allergens(client: TestClient, db_session):
    """Verify authenticated customer's saved allergen profile is automatically merged."""
    from app.core.security import create_access_token, get_password_hash

    # Create customer with allergen 'Fragrance'
    customer = User(
        email="fragrance_sensitive@smartglow.com",
        hashed_password=get_password_hash("Password123!"),
        full_name="Alex Rivera",
        role="customer",
        is_active=True,
        skin_type="Sensitive",
        skin_concerns=["Redness"],
        known_allergens=["Fragrance"],
    )
    db_session.add(customer)
    db_session.commit()
    token = create_access_token(subject=customer.email)

    # Product with fragrance
    cat = db_session.query(Category).first()
    fragrant_prod = Product(
        id="sg-perfumed-lotion",
        name="Scented Floral Mist",
        slug="scented-floral-mist",
        category_id=cat.id,
        price=29.0,
        rating=4.5,
        skin_types=["All"],
        skin_concerns=["Redness"],
        key_ingredients_list=["Rose Extract", "Fragrance"],
        all_ingredients="Aqua, Glycerin, Rosa Damascena, Fragrance (Parfum).",
        description="Lightly perfumed face mist.",
        stock_count=20,
        image_url="/test4.jpg",
        is_active=True,
    )
    db_session.add(fragrant_prod)
    db_session.commit()

    # Call endpoint without specifying known_allergens in body — should inherit from token
    payload = {
        "manual_optical_measurements": {"redness": 60.0, "shine": 20.0, "texture": 30.0, "pores": 20.0},
    }
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/v1/skin-analysis/analyze", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()

    rec_ids = [r["product_id"] for r in data["recommendations"]]
    assert "sg-perfumed-lotion" not in rec_ids
