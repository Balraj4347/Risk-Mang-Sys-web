import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/charts.scss";
import Plot from "react-plotly.js";
import { useAuth } from "../context/AuthContext";

const Diversification = () => {
  const authState = useAuth();
  const [dataRecieved, setDataRecieved] = useState(false);
  const [sectorDistPlot, setSectorDistPlot] = useState(false);
  const [adjCloseCorrPlot, setAdjCloseCorrPlot] = useState(false);
  const [weightSimulationData, setWeightSimulationData] = useState(false);
  const [simulWeightPlot, setSimulWeightPlot] = useState(false);
  const [betasMetricData, setBetasMetricData] = useState(false);
  const [betasHistPlot, setBetasHistPlot] = useState(false);

  useEffect(() => {
    get_diversification_resp();
    //eslint-disable-next-line
  }, []);

  const get_diversification_resp = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: authState.token,
      },
    };
    try {
      let resp = await axios.get("/api/v1/diversify/result", config);
      // console.log(resp.data);
      setDataRecieved(resp.data.DataRecieved);
      setSectorDistPlot(resp.data.SectorDistPlot);
      setAdjCloseCorrPlot(resp.data.AdjCloseCorrPlot);
      setWeightSimulationData(resp.data.WeightSimulationData);
      setSimulWeightPlot(resp.data.SimulWeightPlot);
      setBetasMetricData(resp.data.BetasMetricData);
      setBetasHistPlot(resp.data.BetasHistPlot);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      {dataRecieved ? (
        <>
          <div className='container-block'>
            <PlotlyPlot
              Data={sectorDistPlot}
              heading={"Sector Wise Composition of Portfolio"}
            />
            <PlotlyPlot
              Data={adjCloseCorrPlot}
              heading={
                "Correlation Between Adj Close Price of Portfolio Stocks"
              }
            />
            <h2>{"Weight Simulation Result"}</h2>
            <div className='cards-wrapper'>
              <div className='card-container'>
                <h2>Maximizing Sharpe</h2>
                <h4>
                  {"Maxmum Sharpe Ratio"}&emsp;{":"}&emsp;
                  {weightSimulationData["MaxSharpe Value"].toFixed(5)}
                </h4>
                <h4>{"Weight Distibution"}</h4>
                {Object.entries(
                  weightSimulationData["MinVolatility Weight Dist"]
                ).map((ele, k) => {
                  return (
                    <h4>
                      {ele[0]}&emsp;{":"}&emsp;{ele[1].toFixed(5)}
                    </h4>
                  );
                })}
              </div>
              <div className='card-container'>
                <h2>Minimizing Volatility</h2>
                <h4>
                  {"Minimum Volatility"}&emsp;{":"}&emsp;
                  {weightSimulationData["Min volatility"].toFixed(5)}
                </h4>
                <h4>{"Weight Distibution"}</h4>
                {Object.entries(
                  weightSimulationData["MaxSharpe Weight Dist"]
                ).map((ele, k) => {
                  return (
                    <h4>
                      {ele[0]}&emsp;{":"}&emsp;{ele[1].toFixed(5)}
                    </h4>
                  );
                })}
              </div>
            </div>
            <PlotlyPlot
              Data={simulWeightPlot}
              heading={
                "Correlation b/w Returns and Volatility for simulated weights"
              }
            />
            <h2>{"Betas Value for Stocks in Portfolio"}</h2>
            <ul>
              <li>
                Beta is a concept that measures the expected move in a stock
                relative to movements in the overall market.{" "}
              </li>
              <li>
                A beta greater than 1.0 suggests that the stock is more volatile
                than the broader market, and a beta less than 1.0 indicates a
                stock with lower volatility.
              </li>
            </ul>
            <div className='cards-wrapper'>
              {Object.entries(betasMetricData).map((el, k) => {
                return (
                  <div className='card-container' key={k}>
                    <h2>{el[0]}</h2>
                    {Object.entries(el[1]).map((ele, key) => {
                      return <ListHtml ele={ele} k={key} />;
                    })}
                  </div>
                );
              })}
            </div>

            <div className='card-container'>
              <Plot
                data={betasHistPlot.data}
                layout={betasHistPlot.layout}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

const PlotlyPlot = ({ Data, heading }) => {
  return (
    <>
      <h2>{heading}</h2>
      <div className='card-container'>
        <Plot
          data={Data.data}
          layout={Data.layout}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </>
  );
};

const ListHtml = ({ ele, k }) => {
  return (
    <>
      <h4 key={k}>
        <span
          style={{
            textTransform: "uppercase",
          }}
        >
          {ele[0]}
        </span>
        &emsp;{":"} &emsp;
        {ele[1].toFixed(5)}
      </h4>
    </>
  );
};

export default Diversification;
