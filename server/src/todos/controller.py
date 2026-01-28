from fastapi import APIRouter

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/")
def get_todos():
    """Get all todos"""
    return {"todos": []}

@router.post("/")
def create_todo(title: str, description: str = ""):
    """Create a new todo"""
    return {"title": title, "created": True}

@router.put("/{todo_id}")
def update_todo(todo_id: int, title: str):
    """Update a todo"""
    return {"id": todo_id, "updated": True}

@router.delete("/{todo_id}")
def delete_todo(todo_id: int):
    """Delete a todo"""
    return {"id": todo_id, "deleted": True}
