import { useStocks, useStocksDispatch } from "../context/StockContext";
import { Input, ListStocks } from "../Components/PortfolioComp";
import { MyThemeContext } from "../context/MyThemeContext";
import { useContext } from "react";
import "../styles/Portfolio.scss";
const Portfolio = () => {
  const theme = useContext(MyThemeContext);
  const stocks = useStocks();
  const stockDispatch = useStocksDispatch();
  return (
    <>
      <Input stocks={stocks} stockDispatch={stockDispatch} theme={theme} />

      <ListStocks stocks={stocks} theme={theme} />
    </>
  );
};

export default Portfolio;
