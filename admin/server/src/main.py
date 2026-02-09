from fastapi import FastAPI
from database.core import Base, engine
from api import register_routes

Base.metadata.create_all(bind=engine)

app = FastAPI()
register_routes(app)
