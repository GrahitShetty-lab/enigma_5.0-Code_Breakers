def test_case_crud_flow(client, auth_headers):
    # 1. Create Case
    create_payload = {
        "deceased_name": "Rajesh Patil",
        "date_of_death": "2024-05-15",
        "relationship_to_deceased": "Father",
        "state": "Maharashtra"
    }
    res = client.post("/api/cases", json=create_payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["deceased_name"] == "Rajesh Patil"
    assert data["relationship_to_deceased"] == "Father"
    case_id = data["id"]

    # 2. List Cases
    list_res = client.get("/api/cases", headers=auth_headers)
    assert list_res.status_code == 200
    cases = list_res.json()
    assert len(cases) >= 1
    assert any(c["id"] == case_id for c in cases)

    # 3. Get Specific Case
    get_res = client.get(f"/api/cases/{case_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == case_id

    # 4. Update Case
    update_payload = {"state": "Goa", "status": "in_progress"}
    put_res = client.put(f"/api/cases/{case_id}", json=update_payload, headers=auth_headers)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["state"] == "Goa"
    assert updated["status"] == "in_progress"

def test_get_nonexistent_case(client, auth_headers):
    res = client.get("/api/cases/non-existent-uuid", headers=auth_headers)
    assert res.status_code == 404
