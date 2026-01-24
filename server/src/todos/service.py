class TodoService:
    """Todo service"""
    
    def get_all_todos(self):
        """Get all todos"""
        return []
    
    def create_todo(self, title: str, description: str):
        """Create a new todo"""
        return {"title": title, "description": description}
    
    def update_todo(self, todo_id: int, title: str):
        """Update a todo"""
        return {"id": todo_id, "title": title}
    
    def delete_todo(self, todo_id: int):
        """Delete a todo"""
        return {"id": todo_id}
