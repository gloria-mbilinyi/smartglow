import pytest
from fastapi import status


def test_register_customer_success(client):
    payload = {
        "email": "sarah.jenkins@example.com",
        "password": "SecurePassword123!",
        "full_name": "Sarah Jenkins",
        "phone": "+1-555-4321",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "sarah.jenkins@example.com"
    assert data["user"]["full_name"] == "Sarah Jenkins"
    assert data["user"]["role"] == "customer"


def test_register_duplicate_email_fails(client):
    payload = {
        "email": "customer@smartglow.com",  # Already seeded
        "password": "Password123!",
        "full_name": "Duplicate User",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


def test_login_customer_success(client):
    payload = {
        "email": "customer@smartglow.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "customer@smartglow.com"


def test_login_invalid_password_fails(client):
    payload = {
        "email": "customer@smartglow.com",
        "password": "WrongPassword999!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_email_fails(client):
    payload = {
        "email": "nobody@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_me_authenticated(client):
    # First login to obtain token
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@smartglow.com", "password": "Password123!"},
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    user = response.json()
    assert user["email"] == "customer@smartglow.com"
    assert user["full_name"] == "Gloria Mbilinyi"


def test_get_current_user_me_unauthenticated_fails(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
