import { createContext, useContext, useReducer } from "react";

//Creating the Context to map to the Current Stocks state
// and to dispatch changes
const StockContext = createContext(null);
const StockDispatchContext = createContext(null);

// Wrapper funciton
export function StockProvider({ children }) {
  const [stocks, dispatch] = useReducer(StockReducer, initialStocks);

  return (
    <StockContext.Provider value={stocks}>
      <StockDispatchContext.Provider value={dispatch}>
        {children}
      </StockDispatchContext.Provider>
    </StockContext.Provider>
  );
}

//Function to import to get the context in a component
export function useStocks() {
  return useContext(StockContext);
}
export function useStocksDispatch() {
  return useContext(StockDispatchContext);
}

//Reducer Function to update the stocks list depending on the action initiated
function StockReducer(stocks, action) {
  switch (action.type) {
    case "added": {
      return [
        ...stocks,
        {
          id: action.id,
          text: action.text,
          quantity: action.quantity,
          price: action.price,
        },
      ];
    }
    case "deleted": {
      return stocks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

//Initial Stock List
// LocalStorage can be used to save in browser
const initialStocks = [];
