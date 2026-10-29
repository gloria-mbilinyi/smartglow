import pytest
from fastapi import status


def get_customer_token(client) -> str:
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@smartglow.com", "password": "Password123!"},
    )
    return login_resp.json()["access_token"]


def get_admin_token(client) -> str:
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@smartglow-admin.internal", "password": "AdminPassword123!"},
    )
    return login_resp.json()["access_token"]


def test_update_profile_success(client):
    token = get_customer_token(client)
    payload = {"full_name": "Gloria Updated", "phone": "+1-555-7777"}
    response = client.put(
        "/api/v1/users/me/profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["full_name"] == "Gloria Updated"
    assert data["phone"] == "+1-555-7777"


def test_update_skin_preferences(client):
    token = get_customer_token(client)
    payload = {
        "skin_type": "Sensitive",
        "skin_concerns": ["Redness", "Dehydration"],
        "sensitivity_level": "High",
        "known_allergens": ["Fragrance"],
        "preferred_routine": "Minimal Barrier Care",
    }
    response = client.put(
        "/api/v1/users/me/skin-preferences",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["skin_type"] == "Sensitive"
    assert "Redness" in data["skin_concerns"]
    assert data["sensitivity_level"] == "High"
    assert "Fragrance" in data["known_allergens"]


def test_personalized_recommendations(client):
    token = get_customer_token(client)
    # Set skin preference to Sensitive
    client.put(
        "/api/v1/users/me/skin-preferences",
        json={"skin_type": "Sensitive", "skin_concerns": ["Redness"]},
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get(
        "/api/v1/users/me/recommendations",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    items = response.json()
    assert len(items) > 0
    # The top recommended product should be suitable for Sensitive skin
    assert "Sensitive" in items[0]["skin_types"] or "All" in items[0]["skin_types"]


def test_authenticated_order_links_user_id(client):
    token = get_customer_token(client)
    order_payload = {
        "customer_name": "Gloria Mbilinyi",
        "customer_phone": "+1 (555) 234-5678",
        "delivery_address": "450 Sunset Blvd",
        "city": "Dar es Salaam",
        "postal_code": "14111",
        "payment_method": "Cash on Delivery",
        "items": [{"product_id": "sg-cleanse-01", "quantity": 1}],
    }
    create_resp = client.post(
        "/api/v1/orders/",
        json=order_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_resp.status_code == status.HTTP_201_CREATED
    order_data = create_resp.json()
    assert order_data["user_id"] is not None

    # Retrieve customer's my-orders
    my_orders_resp = client.get(
        "/api/v1/orders/my-orders",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert my_orders_resp.status_code == status.HTTP_200_OK
    my_orders = my_orders_resp.json()
    assert any(o["order_number"] == order_data["order_number"] for o in my_orders)


def test_admin_inventory_overview_requires_admin(client):
    customer_token = get_customer_token(client)
    response = client.get(
        "/api/v1/admin/inventory",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_inventory_overview_success(client):
    admin_token = get_admin_token(client)
    response = client.get(
        "/api/v1/admin/inventory",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_products"] == 10
    assert len(data["items"]) == 10
    assert "low_stock_count" in data


def test_admin_update_product_stock(client):
    admin_token = get_admin_token(client)
    payload = {"stock_count": 80, "price": 49.99}
    response = client.patch(
        "/api/v1/admin/products/sg-serum-01/stock",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["stock_count"] == 80
    assert data["price"] == 49.99
    assert data["is_low_stock"] is False


def test_admin_update_order_status(client):
    admin_token = get_admin_token(client)
    # Create an order
    order_payload = {
        "customer_name": "Lifecycle Test",
        "customer_phone": "+1-555-8888",
        "delivery_address": "88 Track Blvd",
        "city": "Nairobi",
        "postal_code": "00100",
        "payment_method": "Cash on Delivery",
        "items": [{"product_id": "sg-serum-01", "quantity": 1}],
    }
    create_resp = client.post("/api/v1/orders/", json=order_payload)
    order_id = create_resp.json()["id"]

    # Update to shipped
    status_resp = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "shipped"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert status_resp.status_code == status.HTTP_200_OK
    assert status_resp.json()["status"] == "shipped"
