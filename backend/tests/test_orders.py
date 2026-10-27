from fastapi import status


def test_create_order_success(client):
    payload = {
        "customer_name": "Gloria Mbilinyi",
        "customer_phone": "+1-555-0199",
        "delivery_address": "123 Sunset Boulevard",
        "city": "Dar es Salaam",
        "postal_code": "14111",
        "payment_method": "Cash on Delivery",
        "items": [
            {
                "product_id": "sg-serum-01",  # $48.00
                "quantity": 2,                 # subtotal = $96.00 (qualifies for free shipping)
            }
        ],
    }

    response = client.post("/api/v1/orders/", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["order_number"].startswith("SG-")
    assert data["customer_name"] == "Gloria Mbilinyi"
    assert data["subtotal"] == 96.0
    assert data["shipping_cost"] == 0.0  # Free delivery over $60
    assert data["total_amount"] == 96.0
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2


def test_create_order_with_shipping_fee(client):
    payload = {
        "customer_name": "Test Customer",
        "customer_phone": "+1-555-0100",
        "delivery_address": "45 Ocean Way",
        "city": "Arusha",
        "postal_code": "23100",
        "payment_method": "Cash on Delivery",
        "items": [
            {
                "product_id": "sg-cleanse-01",  # $26.00 < $60 threshold
                "quantity": 1,
            }
        ],
    }

    response = client.post("/api/v1/orders/", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["subtotal"] == 26.0
    assert data["shipping_cost"] == 6.0  # Standard shipping applied
    assert data["total_amount"] == 32.0


def test_create_order_insufficient_stock(client):
    payload = {
        "customer_name": "Test Customer",
        "customer_phone": "+1-555-0100",
        "delivery_address": "45 Ocean Way",
        "city": "Arusha",
        "postal_code": "23100",
        "payment_method": "Cash on Delivery",
        "items": [
            {
                "product_id": "sg-serum-01",
                "quantity": 99999,  # exceeds available stock
            }
        ],
    }

    response = client.post("/api/v1/orders/", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Insufficient inventory" in response.json()["detail"]


def test_create_order_nonexistent_product(client):
    payload = {
        "customer_name": "Test Customer",
        "customer_phone": "+1-555-0100",
        "delivery_address": "45 Ocean Way",
        "city": "Arusha",
        "postal_code": "23100",
        "payment_method": "Cash on Delivery",
        "items": [
            {
                "product_id": "does-not-exist",
                "quantity": 1,
            }
        ],
    }

    response = client.post("/api/v1/orders/", json=payload)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_order_by_number(client):
    # First place an order
    order_payload = {
        "customer_name": "Track Test",
        "customer_phone": "+1-555-0200",
        "delivery_address": "12 Track St",
        "city": "Dodoma",
        "postal_code": "41101",
        "payment_method": "Cash on Delivery",
        "items": [{"product_id": "sg-sun-01", "quantity": 1}],
    }
    create_resp = client.post("/api/v1/orders/", json=order_payload)
    order_data = create_resp.json()
    order_number = order_data["order_number"]

    # Now retrieve it
    get_resp = client.get(f"/api/v1/orders/{order_number}")
    assert get_resp.status_code == status.HTTP_200_OK
    assert get_resp.json()["order_number"] == order_number
