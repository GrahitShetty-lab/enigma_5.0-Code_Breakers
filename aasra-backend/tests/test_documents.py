import io

def test_document_upload_and_get(client, auth_headers):
    # Create case first
    case_res = client.post(
        "/api/cases",
        json={
            "deceased_name": "Rajesh Patil",
            "date_of_death": "2024-05-15",
            "relationship_to_deceased": "Father",
            "state": "Maharashtra"
        },
        headers=auth_headers
    )
    case_id = case_res.json()["id"]

    # 1. Happy path: Upload valid PNG
    fake_png = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")
    upload_res = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("salary_slip.png", fake_png, "image/png")},
        data={"document_type": "Salary Slip"},
        headers=auth_headers
    )
    assert upload_res.status_code == 201
    doc = upload_res.json()
    assert doc["document_type"] == "Salary Slip"
    assert doc["case_id"] == case_id
    doc_id = doc["id"]

    # 2. Get Document by ID
    get_res = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == doc_id

    # 3. List Case Documents
    list_res = client.get(f"/api/cases/{case_id}/documents", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

def test_document_upload_rejected_file_type(client, auth_headers):
    case_res = client.post(
        "/api/cases",
        json={
            "deceased_name": "Rajesh Patil",
            "date_of_death": "2024-05-15",
            "relationship_to_deceased": "Father",
            "state": "Maharashtra"
        },
        headers=auth_headers
    )
    case_id = case_res.json()["id"]

    # Attempt to upload disallowed type (text/plain or exe)
    invalid_file = io.BytesIO(b"malicious script or invalid format")
    upload_res = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("script.sh", invalid_file, "text/plain")},
        data={"document_type": "Other"},
        headers=auth_headers
    )
    assert upload_res.status_code == 400
    assert "not allowed" in upload_res.json()["detail"].lower()
