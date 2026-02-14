"""
Main FastAPI application entry point.
"""
import os
import traceback
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from db.database import engine, Base
from api import health
from api import brokers as broker_routes
from api import strategies as strategy_routes
from auth import routes as auth_routes

# Import models to ensure they are registered with SQLAlchemy
from models import user  # noqa: F401
from models import strategy  # noqa: F401
from models import backtest  # noqa: F401

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Backtesting Platform API",
    description="Professional algorithmic trading backtesting platform with strategy management and broker integration",
    version="1.0.0"
)

# CORS middleware configuration
# In production, set CORS_ORIGINS environment variable to your frontend URL
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in CORS_ORIGINS.split(",")] if CORS_ORIGINS != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions."""
    traceback_str = traceback.format_exc()
    print(f"Unhandled exception: {traceback_str}")  # Print to console
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": str(exc),
            "type": type(exc).__name__,
            "traceback": traceback_str
        }
    )


# Include routers
app.include_router(health.router, prefix="/health")
app.include_router(auth_routes.router)
app.include_router(broker_routes.router)
app.include_router(strategy_routes.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Algo Trading Backend API", "version": "1.0.0"}
