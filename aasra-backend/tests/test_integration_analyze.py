from app.models.document import Document

def test_integration_mini_rajesh_analyze(client, auth_headers, db_session):
    # 1. Create Rajesh Patil case
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
    assert case_res.status_code == 201
    case_id = case_res.json()["id"]

    # 2. Add realistic evidence document directly to DB (Salary Slip with EPFO & LIC clues)
    salary_slip_text = """
    MAHARASHTRA ENGINEERING WORKS PVT LTD - SALARY SLIP
    Employee Name: Rajesh Patil   Emp Code: MEW-4019
    Month: April 2024
    ----------------------------------------------------
    Basic Pay:                 Rs. 62,000.00
    EPFO PF Deduction:         Rs.  3,600.00 (UAN: 100928374651)
    LIC Life Insurance Premium:Rs.  2,340.00 (Policy: 882910394)
    Net Salary:                Rs. 97,860.00
    """
    doc = Document(
        case_id=case_id,
        document_type="Salary Slip",
        file_url="uploads/test_salary_slip.png",
        extracted_text=salary_slip_text,
        verification_status="verified",
        uploaded_by=case_res.json()["user_id"],
    )
    db_session.add(doc)
    db_session.commit()

    # 3. Trigger Orchestrator: POST /api/cases/{case_id}/analyze
    analyze_res = client.post(f"/api/cases/{case_id}/analyze", headers=auth_headers)
    assert analyze_res.status_code == 200
    data = analyze_res.json()

    assert data["status"] == "success"
    assert data["case_id"] == case_id
    assert data["documents_analyzed"] == 1
    assert data["assets_found"] >= 2

    # Assert Insurance and EPF assets come back
    discovered = data["discovered_assets"]
    categories = {a["category"] for a in discovered}
    assert "Insurance" in categories, "Expected Insurance asset to be discovered"
    assert "EPF" in categories, "Expected EPF asset to be discovered"

    # Verify Insurance asset details
    lic_asset = next(a for a in discovered if a["category"] == "Insurance")
    assert "LIC" in lic_asset["institution"]
    assert lic_asset["masked_identifier"] is not None
    assert lic_asset["confidence"] > 0.0
    assert "detected" in lic_asset["explanation"].lower() or "possible" in lic_asset["explanation"].lower()

    # Verify EPF asset details
    epf_asset = next(a for a in discovered if a["category"] == "EPF")
    assert "EPFO" in epf_asset["institution"]
    assert epf_asset["masked_identifier"] is not None
    assert epf_asset["confidence"] > 0.0

    # Assert generated tasks exist
    tasks = data["generated_tasks"]
    assert len(tasks) >= 2
    task_titles = [t["title"].lower() for t in tasks]
    assert any("epfo" in t for t in task_titles)
    assert any("insurance" in t for t in task_titles)

    # 4. Check Dashboard metrics reflect discoveries
    dash_res = client.get(f"/api/cases/{case_id}/dashboard", headers=auth_headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["assets_found"] >= 2
    assert dash["high_priority_tasks"] >= 2
    assert 0 <= dash["closure_percentage"] <= 100
