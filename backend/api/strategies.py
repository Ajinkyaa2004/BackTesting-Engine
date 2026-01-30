"""
Strategy API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from models.strategy import Strategy
from models.backtest import Backtest
from models.user import User
from auth.dependencies import get_current_user
from strategies.schemas import (
    StrategyUpload,
    StrategyResponse,
    BacktestRequest,
    BacktestResponse,
    BacktestResultResponse
)
from strategies.loader import StrategyLoader
from engine.backtest import BacktestingEngine


router = APIRouter(prefix="/strategies", tags=["Strategies"])


@router.post("/upload", response_model=StrategyResponse, status_code=status.HTTP_201_CREATED)
async def upload_strategy(
    strategy_data: StrategyUpload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a new strategy.
    
    Args:
        strategy_data: Strategy upload data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created strategy
    """
    # Validate strategy code by trying to load it
    try:
        StrategyLoader.load_strategy_class(strategy_data.code, strategy_data.class_name)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid strategy code: {str(e)}"
        )
    
    # Create strategy
    strategy = Strategy(
        name=strategy_data.name,
        description=strategy_data.description,
        code=strategy_data.code,
        class_name=strategy_data.class_name,
        user_id=current_user.id
    )
    
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    
    return strategy


@router.get("", response_model=List[StrategyResponse])
async def list_strategies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all strategies for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of strategies
    """
    strategies = db.query(Strategy).filter(Strategy.user_id == current_user.id).all()
    return strategies


@router.get("/{strategy_id}", response_model=StrategyResponse)
async def get_strategy(
    strategy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific strategy by ID.
    
    Args:
        strategy_id: Strategy ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Strategy details
    """
    strategy = db.query(Strategy).filter(
        Strategy.id == strategy_id,
        Strategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Strategy not found"
        )
    
    return strategy


@router.delete("/{strategy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_strategy(
    strategy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a strategy.
    
    Args:
        strategy_id: Strategy ID
        current_user: Current authenticated user
        db: Database session
    """
    strategy = db.query(Strategy).filter(
        Strategy.id == strategy_id,
        Strategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Strategy not found"
        )
    
    db.delete(strategy)
    db.commit()
    
    return None


@router.post("/backtest/run", response_model=BacktestResponse)
async def run_backtest(
    backtest_request: BacktestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run a backtest on historical data.
    
    Args:
        backtest_request: Backtest request parameters
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Backtest results
    """
    # Get strategy
    strategy = db.query(Strategy).filter(
        Strategy.id == backtest_request.strategy_id,
        Strategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Strategy not found"
        )
    
    # Run backtest
    try:
        engine = BacktestingEngine(
            initial_capital=backtest_request.initial_capital,
            max_positions=backtest_request.max_positions or 1
        )
        
        # Prepare strategy config
        strategy_config = {
            "max_positions": backtest_request.max_positions or 1,
            "initial_capital": backtest_request.initial_capital,
            "risk_per_trade": backtest_request.risk_per_trade or 0.02
        }
        
        results = engine.run_backtest(
            strategy_code=strategy.code,
            class_name=strategy.class_name,
            broker_name=backtest_request.broker,
            symbol=backtest_request.symbol,
            interval=backtest_request.interval,
            start_time=backtest_request.start_time,
            end_time=backtest_request.end_time,
            limit=backtest_request.limit,
            config=strategy_config
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running backtest: {str(e)}"
        )
    
    # Save backtest results to database
    backtest = Backtest(
        strategy_id=strategy.id,
        user_id=current_user.id,
        symbol=backtest_request.symbol,
        interval=backtest_request.interval,
        start_time=backtest_request.start_time or 0,
        end_time=backtest_request.end_time or 0,
        initial_capital=backtest_request.initial_capital,
        final_capital=results["final_capital"],
        total_return=results["metrics"]["total_return"],
        sharpe_ratio=results["metrics"]["sharpe_ratio"],
        max_drawdown=results["metrics"]["max_drawdown"],
        win_rate=results["metrics"]["win_rate"],
        total_trades=results["total_trades"],
        winning_trades=results["winning_trades"],
        losing_trades=results["losing_trades"],
        trades_json=results["trades"]
    )
    
    db.add(backtest)
    db.commit()
    db.refresh(backtest)
    
    # Format response
    return BacktestResponse(
        backtest_id=backtest.id,
        strategy_name=strategy.name,
        symbol=backtest_request.symbol,
        interval=backtest_request.interval,
        initial_capital=results["initial_capital"],
        final_capital=results["final_capital"],
        metrics=results["metrics"],
        total_trades=results["total_trades"],
        winning_trades=results["winning_trades"],
        losing_trades=results["losing_trades"],
        trades=results["trades"],
        equity_curve=results["equity_curve"],
        created_at=backtest.created_at
    )


@router.get("/backtest/results", response_model=List[BacktestResultResponse])
async def list_backtest_results(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    strategy_id: Optional[int] = Query(None, description="Filter by strategy ID")
):
    """
    List backtest results for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        strategy_id: Optional strategy ID to filter by
        
    Returns:
        List of backtest results
    """
    query = db.query(Backtest).filter(Backtest.user_id == current_user.id)
    
    if strategy_id:
        query = query.filter(Backtest.strategy_id == strategy_id)
    
    backtests = query.order_by(Backtest.created_at.desc()).all()
    
    # Add strategy name to each result
    results = []
    for backtest in backtests:
        strategy = db.query(Strategy).filter(Strategy.id == backtest.strategy_id).first()
        result_dict = {
            "id": backtest.id,
            "strategy_id": backtest.strategy_id,
            "strategy_name": strategy.name if strategy else "Unknown",
            "symbol": backtest.symbol,
            "interval": backtest.interval,
            "start_time": backtest.start_time,
            "end_time": backtest.end_time,
            "initial_capital": backtest.initial_capital,
            "final_capital": backtest.final_capital,
            "total_return": backtest.total_return,
            "sharpe_ratio": backtest.sharpe_ratio,
            "max_drawdown": backtest.max_drawdown,
            "win_rate": backtest.win_rate,
            "total_trades": backtest.total_trades,
            "winning_trades": backtest.winning_trades,
            "losing_trades": backtest.losing_trades,
            "created_at": backtest.created_at
        }
        results.append(BacktestResultResponse(**result_dict))
    
    return results


@router.get("/backtest/results/{result_id}", response_model=BacktestResponse)
async def get_backtest_result(
    result_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed backtest result by ID.
    
    Args:
        result_id: Backtest result ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Detailed backtest result
    """
    backtest = db.query(Backtest).filter(
        Backtest.id == result_id,
        Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backtest result not found"
        )
    
    strategy = db.query(Strategy).filter(Strategy.id == backtest.strategy_id).first()
    
    return BacktestResponse(
        backtest_id=backtest.id,
        strategy_name=strategy.name if strategy else "Unknown",
        symbol=backtest.symbol,
        interval=backtest.interval,
        initial_capital=backtest.initial_capital,
        final_capital=backtest.final_capital,
        metrics={
            "total_return": backtest.total_return,
            "sharpe_ratio": backtest.sharpe_ratio or 0.0,
            "max_drawdown": backtest.max_drawdown,
            "win_rate": backtest.win_rate or 0.0,
            "avg_win": 0.0,  # Not stored in DB
            "avg_loss": 0.0,  # Not stored in DB
            "profit_factor": 0.0  # Not stored in DB
        },
        total_trades=backtest.total_trades,
        winning_trades=backtest.winning_trades,
        losing_trades=backtest.losing_trades,
        trades=backtest.trades_json or [],
        equity_curve=[],  # Not stored in DB
        created_at=backtest.created_at
    )
