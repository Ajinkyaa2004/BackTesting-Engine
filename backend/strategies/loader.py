"""
Dynamic strategy loader - loads strategy classes from code strings.
"""
import importlib.util
import sys
from typing import Type, Optional, Dict, Any
from strategies.base import BaseStrategy


class StrategyLoader:
    """
    Utility class for dynamically loading strategy classes from code.
    """
    
    @staticmethod
    def load_strategy_class(code: str, class_name: str) -> Type[BaseStrategy]:
        """
        Load a strategy class from Python code string.
        
        Args:
            code: Python code as string
            class_name: Name of the class to load
            
        Returns:
            Strategy class (not instance)
            
        Raises:
            ValueError: If class not found or doesn't inherit from BaseStrategy
        """
        # Create a unique module name based on code hash
        module_name = f"strategy_{abs(hash(code)) % 1000000}"
        
        # Check if module already exists in sys.modules
        if module_name in sys.modules:
            del sys.modules[module_name]
        
        # Create module spec
        spec = importlib.util.spec_from_loader(module_name, loader=None)
        if spec is None:
            raise ValueError(f"Failed to create module spec for strategy")
        
        module = importlib.util.module_from_spec(spec)
        
        # Add necessary imports to module namespace so strategies can use them
        import strategies.base
        import strategies.indicators
        import core.candle
        import brokers.base
        
        # Prepare module namespace with required imports
        module.__dict__.update({
            'BaseStrategy': strategies.base.BaseStrategy,
            'Candle': core.candle.Candle,
            'BrokerBase': brokers.base.BrokerBase,
            'indicators': strategies.indicators,
        })
        
        # Execute code in module namespace
        try:
            exec(code, module.__dict__)
        except Exception as e:
            raise ValueError(f"Error executing strategy code: {str(e)}")
        
        # Get the class
        if not hasattr(module, class_name):
            raise ValueError(f"Class '{class_name}' not found in strategy code")
        
        strategy_class = getattr(module, class_name)
        
        # Verify it inherits from BaseStrategy
        if not issubclass(strategy_class, BaseStrategy):
            raise ValueError(
                f"Class '{class_name}' must inherit from BaseStrategy"
            )
        
        return strategy_class
    
    @staticmethod
    def create_strategy_instance(
        code: str,
        class_name: str,
        broker,
        config: Optional[Dict[str, Any]] = None
    ) -> BaseStrategy:
        """
        Create a strategy instance from code.
        
        Args:
            code: Python code as string
            class_name: Name of the class to instantiate
            broker: Broker instance to pass to strategy
            config: Optional configuration dictionary
            
        Returns:
            Strategy instance
            
        Raises:
            ValueError: If class cannot be loaded or instantiated
        """
        try:
            strategy_class = StrategyLoader.load_strategy_class(code, class_name)
            # Try with config first, fallback to broker-only for backward compatibility
            try:
                return strategy_class(broker, config)
            except TypeError:
                # Old strategy format (broker only) - backward compatible
                return strategy_class(broker)
        except Exception as e:
            raise ValueError(f"Failed to create strategy instance: {str(e)}")
