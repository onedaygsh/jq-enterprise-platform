"""Enterprise Management Platform - FastAPI Application."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api import api_router
from app.services.tiangong import tiangong


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)



@app.get("/api/v1/dashboard/tiangong")
async def tiangong_dashboard():
    """Real-time dashboard from Tiangong-OS"""
    return tiangong.get_dashboard()


@app.get("/api/v1/products/tiangong")
async def tiangong_products(limit: int = 50, offset: int = 0):
    """List products from Tiangong-OS"""
    return tiangong.list_products(limit=limit, offset=offset)


@app.get("/api/v1/orders/tiangong")
async def tiangong_orders(limit: int = 50, offset: int = 0, status: str = None):
    """List orders from Tiangong-OS"""
    return tiangong.list_orders(limit=limit, offset=offset, status=status)


@app.get("/api/v1/suppliers/tiangong")
async def tiangong_suppliers(limit: int = 50):
    """List suppliers from Tiangong-OS"""
    return tiangong.list_suppliers(limit=limit)


@app.get("/")
async def root():
    return {"name": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
