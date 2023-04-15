import {
  usePortfolio,
  usePortfolioDispatch,
} from "../context/PortfolioContext";
import { Input, ListStocks } from "../Components/PortfolioComp";
import { MyThemeContext } from "../context/MyThemeContext";
import React, { useContext } from "react";
import "../styles/Portfolio.scss";
import "../styles/charts.scss";
import ReactApexChart from "react-apexcharts";

const Portfolio = () => {
  const theme = useContext(MyThemeContext);
  const { stocks } = usePortfolio();
  const stockDispatch = usePortfolioDispatch();

  const getOptions = () => {
    return {
      chart: {
        width: 380,
        height: 300,
        type: "pie",
      },
      labels: stocks.map((ele) => ele["ticker"]),
      responsive: [
        {
          breakpoint: 500,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "top",
            },
          },
        },
      ],
    };
  };

  const getSeries = () => {
    return Object.values(stocks).map((ele) => {
      return Number(ele.quantity * ele.price);
    });
  };
  return (
    <>
      <Input stocks={stocks} stockDispatch={stockDispatch} theme={theme} />

      <ListStocks theme={theme} />
      {stocks && (
        <div className='card-container pie-chart-container'>
          <h3> Portfolio Stocks Composition (Invested Amount)</h3>
          <ReactApexChart
            id={"portfolio-pie-chart"}
            options={getOptions()}
            series={getSeries()}
            type='pie'
          />
        </div>
      )}
    </>
  );
};

export default Portfolio;
