from fastapi import status


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"


def test_list_categories(client):
    response = client.get("/api/v1/categories/")
    assert response.status_code == status.HTTP_200_OK
    categories = response.json()
    assert len(categories) >= 5
    category_slugs = [c["slug"] for c in categories]
    assert "skincare" in category_slugs
    assert "serums" in category_slugs
    assert "cleansers" in category_slugs
    assert "sun-care" in category_slugs
    assert "makeup" in category_slugs


def test_list_products_returns_all_seed_products(client):
    response = client.get("/api/v1/products/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 10
    assert len(data["items"]) == 10


def test_filter_products_by_category(client):
    response = client.get("/api/v1/products/?category=serums")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 2
    for item in data["items"]:
        assert item["category"]["slug"] == "serums"


def test_filter_products_by_skin_type(client):
    response = client.get("/api/v1/products/?skin_type=Sensitive")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert "Sensitive" in item["skin_types"] or "All" in item["skin_types"]


def test_filter_products_by_skin_concern(client):
    response = client.get("/api/v1/products/?skin_concern=Dullness")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert "Dullness" in item["skin_concerns"] or "All" in item["skin_concerns"]


def test_search_products_by_keyword(client):
    response = client.get("/api/v1/products/?search=Vitamin%20C")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 1
    assert any("Vitamin C" in p["subtitle"] or "Vitamin C" in p["name"] for p in data["items"])


def test_sort_products_by_price_ascending(client):
    response = client.get("/api/v1/products/?sort_by=price-asc")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    prices = [p["price"] for p in data["items"]]
    assert prices == sorted(prices)


def test_get_single_product_success(client):
    response = client.get("/api/v1/products/sg-serum-01")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == "sg-serum-01"
    assert data["name"] == "Botanical Radiance Serum"
    assert data["price"] == 48.0


def test_get_single_product_not_found(client):
    response = client.get("/api/v1/products/non-existent-id")
    assert response.status_code == status.HTTP_404_NOT_FOUND
