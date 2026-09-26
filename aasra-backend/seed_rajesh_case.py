"""Seed script for Aasra demo: Rajesh Patil case.
Creates user Aniket Patil, the Rajesh Patil case, and 5 realistic evidence documents
with pre-extracted text so /analyze produces the 4 expected discoveries (LIC, EPFO, Loan, SIP)
even if live OCR is not configured.
"""
import os
from datetime import date
from passlib.context import CryptContext

from app.database import SessionLocal
from app.models.user import User
from app.models.case import Case
from app.models.document import Document
from app.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    settings = get_settings()
    db = SessionLocal()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    print("=== Seeding Rajesh Patil Test Case ===")

    # 1. Create User: Aniket Patil
    user = db.query(User).filter(User.phone == "+919876543210").first()
    if not user:
        user = User(
            name="Aniket Patil",
            phone="+919876543210",
            hashed_password=pwd_context.hash("demo123"),
            preferred_language="en",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created User: {user.name} ({user.phone}) - ID: {user.id}")
    else:
        print(f"Using existing User: {user.name} ({user.phone}) - ID: {user.id}")

    # 2. Create Case: Rajesh Patil
    case = db.query(Case).filter(Case.user_id == user.id, Case.deceased_name == "Rajesh Patil").first()
    if not case:
        case = Case(
            user_id=user.id,
            deceased_name="Rajesh Patil",
            date_of_death=date(2024, 5, 15),
            relationship_to_deceased="Father",
            state="Maharashtra",
            status="active",
        )
        db.add(case)
        db.commit()
        db.refresh(case)
        print(f"Created Case: {case.deceased_name} (52, deceased) - ID: {case.id}")
    else:
        print(f"Using existing Case: {case.deceased_name} - ID: {case.id}")

    # 3. Evidence Documents (5 items)
    evidence_items = [
        {
            "type": "Salary Slip",
            "filename": "rajesh_patil_salary_slip.png",
            "text": """MAHARASHTRA ENGINEERING WORKS PVT LTD - SALARY SLIP
Employee Name: Rajesh Patil   Emp Code: MEW-4019
Designation: Senior Works Supervisor
Month: April 2024
----------------------------------------------------
EARNINGS:
Basic Pay:                 Rs. 62,000.00
House Rent Allowance:      Rs. 24,000.00
Conveyance Allowance:      Rs.  8,000.00
Special Allowance:         Rs. 10,000.00
Gross Earnings:            Rs.1,04,000.00
----------------------------------------------------
DEDUCTIONS:
EPFO Employee Contribution:Rs.  3,600.00 (UAN: 100928374651)
LIC Life Insurance Premium:Rs.  2,340.00 (Policy: 882910394)
Professional Tax:          Rs.    200.00
Total Deductions:          Rs.  6,140.00
----------------------------------------------------
Net Pay Deposited:         Rs. 97,860.00
Bank: State Bank of India A/c: 30192847561"""
        },
        {
            "type": "Bank Statement",
            "filename": "rajesh_patil_sbi_statement.png",
            "text": """STATE BANK OF INDIA - ACCOUNT STATEMENT
Account Holder: Rajesh Patil
Account Number: 30192847561
IFSC: SBIN0001234  Branch: Shivaji Nagar, Pune
Statement Period: 01-Apr-2024 to 30-Apr-2024
----------------------------------------------------
01-Apr-2024  SALARY CR - MEW PVT LTD        +Rs.97,860.00  Bal: Rs.1,42,100.00
05-Apr-2024  ACH DR - HDFC BANK LOAN EMI    -Rs.14,250.00  Bal: Rs.1,27,850.00
10-Apr-2024  ACH DR - HDFC MUTUAL FUND SIP  -Rs. 5,000.00  Bal: Rs.1,22,850.00
15-Apr-2024  NACH DR - LIC OF INDIA PREMIUM -Rs. 2,340.00  Bal: Rs.1,20,510.00
----------------------------------------------------
Closing Balance: Rs.1,20,510.00"""
        },
        {
            "type": "SMS Screenshot",
            "filename": "sms_lic_premium.png",
            "text": "Dear Customer, your monthly premium payment of Rs. 2,340.00 for LIC Life Insurance Policy No. 882910394 has been received on 15-APR-2024 via NACH mandate. Life Insurance Corporation of India."
        },
        {
            "type": "SMS Screenshot",
            "filename": "sms_loan_emi.png",
            "text": "HDFC Bank Alert: Monthly EMI of Rs. 14,250.00 for Personal Loan Account 4509182374 has been debited from your A/c ending 7561 on 05-APR-2024. Available balance: Rs. 1,27,850.00."
        },
        {
            "type": "SMS Screenshot",
            "filename": "sms_sip_debit.png",
            "text": "Mutual Fund Alert: Monthly SIP debit of Rs. 5,000.00 for HDFC Mutual Fund Top 100 executed successfully under Folio 88129401. Units allotted at current NAV. CAMS."
        }
    ]

    for item in evidence_items:
        file_path = os.path.join(settings.UPLOAD_DIR, item["filename"])
        if not os.path.exists(file_path):
            with open(file_path, "wb") as f:
                f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")

        doc = db.query(Document).filter(Document.case_id == case.id, Document.document_type == item["type"], Document.file_url == file_path).first()
        if not doc:
            doc = Document(
                case_id=case.id,
                document_type=item["type"],
                file_url=file_path,
                extracted_text=item["text"],
                verification_status="verified",
                uploaded_by=user.id,
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)
            print(f"  + Added evidence doc: {item['type']} ({item['filename']})")
        else:
            setattr(doc, "extracted_text", item["text"])
            db.commit()
            print(f"  = Evidence doc exists: {item['type']} ({item['filename']})")

    case_id = case.id
    db.close()
    print("\nSeeding complete!")
    print(f"Case ID to analyze: {case_id}")
    print("Run: POST /api/cases/{case_id}/analyze")

if __name__ == "__main__":
    seed()
