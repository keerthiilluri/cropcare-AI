import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(tags=["Disease Knowledge Base & Tips"])

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

def load_kb():
    kb_path = DATA_DIR / "disease_kb.json"
    if kb_path.exists():
        with open(kb_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def load_tips():
    tips_path = DATA_DIR / "farming_tips.json"
    if tips_path.exists():
        with open(tips_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/diseases")
def get_all_diseases(
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    category: Optional[str] = Query(None, description="Filter by category (Fungal, Bacterial, Viral, etc.)"),
    search: Optional[str] = Query(None, description="Search query")
):
    items = load_kb()
    if crop:
        items = [i for i in items if i["crop"].lower() == crop.lower()]
    if category:
        items = [i for i in items if i.get("category", "").lower() == category.lower()]
    if search:
        s = search.lower()
        items = [
            i for i in items
            if s in i["crop"].lower() or s in i["disease"].lower() or s in i.get("description", "").lower()
        ]
    return items

@router.get("/diseases/crops")
def get_crops():
    items = load_kb()
    crops = sorted(list(set(i["crop"] for i in items)))
    return crops

@router.get("/diseases/{id}")
def get_disease_by_id(id: str):
    items = load_kb()
    for item in items:
        if item["id"].lower() == id.lower():
            return item
    raise HTTPException(status_code=404, detail="Disease entry not found in library")

@router.get("/tips")
def get_farming_tips():
    return load_tips()
