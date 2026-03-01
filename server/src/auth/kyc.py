from fastapi import APIRouter, UploadFile, File, Form
import os, shutil
from src.database.core import SessionLocal
from src.models.user import IdentityDocument, AddressVerification

router = APIRouter()

os.makedirs("uploads/identity", exist_ok=True)
os.makedirs("uploads/address", exist_ok=True)

# PAGE 3 — IDENTITY VERIFICATION
@router.post("/identity")
def upload_identity(
    user_id: int = Form(...),
    file: UploadFile = File(...)
):
    path = f"uploads/identity/{user_id}_{file.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()
    db.add(IdentityDocument(user_id=user_id, file_path=path))
    db.commit()
    db.close()

    return {"message": "Identity document uploaded"}

# PAGE 4 — ADDRESS VERIFICATION
@router.post("/address")
def upload_address(
    user_id: int = Form(...),
    street: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    zip_code: str = Form(...),
    file: UploadFile = File(...)
):
    path = f"uploads/address/{user_id}_{file.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()
    db.add(AddressVerification(
        user_id=user_id,
        street=street,
        city=city,
        state=state,
        zip_code=zip_code,
        proof_file=path
    ))
    db.commit()
    db.close()

    return {"message": "Address verification completed"}
