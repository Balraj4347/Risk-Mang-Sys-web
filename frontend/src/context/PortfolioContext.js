import { createContext, useContext, useReducer } from "react";
import { useEffect } from "react";
import axios from "axios";
import { hashCode, generatePayload } from "../Utils/tools";
import { useAuth } from "./AuthContext";
//Creating the Context to map to the Current Stocks state
// and to dispatch changes
const PortfolioContext = createContext(null);
const PortfolioDispatchContext = createContext(null);

async function getPortfolioStocks(token) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: token,
      },
    };
    const { data } = await axios.get("/api/v1/portfolio", config);

    Object.entries(data.stocks).forEach((ele) => {
      initialStocks.push({
        id: hashCode(ele[0]),
        ticker: ele[0],
        name: ele[1].name,
        quantity: ele[1].quantity,
        price: ele[1].price,
      });
    });
  } catch (error) {
    console.log(error);
  }
}

// Wrapper funciton
export function PortfolioProvider({ children }) {
  const authState = useAuth();

  useEffect(() => {
    if (authState.isLoggedin()) getPortfolioStocks(authState.token);
    // eslint-disable-next-line
  }, [authState.token]);

  const [stocks, dispatch] = useReducer(PortfolioReducer, initialStocks);

  const updatePortfolio = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          AccessToken: authState.token,
        },
      };
      const payload = generatePayload(stocks);
      const { data } = await axios.post(
        "/api/v1/portfolio/updatestocks",
        payload,
        config
      );
      if (data) return { msg: "Stock Portfolio Updates", variant: "success" };
    } catch (error) {
      console.log(error);
      return { msg: "Stock Portfolio Update Failes", variant: "error" };
    }
  };
  return (
    <PortfolioContext.Provider value={{ stocks, updatePortfolio }}>
      <PortfolioDispatchContext.Provider value={dispatch}>
        {children}
      </PortfolioDispatchContext.Provider>
    </PortfolioContext.Provider>
  );
}

//Function to import to get the context in a component
export function usePortfolio() {
  return useContext(PortfolioContext);
}
export function usePortfolioDispatch() {
  return useContext(PortfolioDispatchContext);
}

//Reducer Function to update the stocks list depending on the action initiated
function PortfolioReducer(stocks, action) {
  switch (action.type) {
    case "added": {
      return [
        ...stocks,
        {
          id: action.id,
          ticker: action.ticker,
          name: action.name,
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
