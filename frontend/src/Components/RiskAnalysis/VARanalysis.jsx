import { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
const VARanalysis = ({ authState }) => {
  const [receivedData, setRecievedData] = useState(false);
  const [covHeatMapPlot, setCovHeatMapPlot] = useState(undefined);
  const [varCovVarData, setVarCovVarData] = useState(undefined);
  const [varCovNormPlot, setVarCovNormPlot] = useState(undefined);
  const [varCovNdayPlot, setVarCovNdayPlot] = useState(undefined);
  const [monteCarloSimPlot, setMonteCarloSimPlot] = useState(undefined);
  const [monteCarloHistPlot, setMonteCarloHistPlot] = useState(undefined);
  const [monetCarloSimulationResult, setMonetCarloSimulationResult] =
    useState(undefined);
  useState(undefined);

  useEffect(() => {
    get_VAR_analysis_result();
    //eslint-disable-next-line
  }, []);

  const get_VAR_analysis_result = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: authState.token,
      },
    };
    try {
      let resp = await axios.get("/api/v1/risk/var", config);
      //   console.log(resp.data.CovHeatMapPlot);
      setRecievedData(resp.data.receivedData);
      setCovHeatMapPlot(resp.data.CovHeatmapPlot);
      setVarCovVarData(resp.data.CovVarMetricsData);
      setVarCovNormPlot(resp.data.VarCovNormPlot);
      setVarCovNdayPlot(resp.data.VarCovNdayPlot);
      setMonteCarloSimPlot(resp.data.MonteCarloSimPlot);
      setMonteCarloHistPlot(resp.data.MonteCarloHistPlot);
      setMonetCarloSimulationResult(resp.data.MonetCarloSimulationResult);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: "3vmax" }}>Value At Risk Analysis</h1>
      {receivedData ? (
        <>
          <div className='cards-wrapper'>
            <h1>Variance Covariance Var</h1>
          </div>
          <PlotlyPlot
            Data={covHeatMapPlot}
            heading={"Heatmap of Covariance b/w Stocks"}
          />
          {/* {Variance Covariance var} */}
          <div className='cards-wrapper'>
            {/* {console.log(varCovVarData)} */}
            <CovVarMetrics data={varCovVarData} />
          </div>
          <div className='card-container'>
            <PlotlyPlot
              Data={varCovNormPlot}
              heading={
                "Distribution Plot of Investment Value and left tail cutoff mark "
              }
            />
          </div>
          <div className='card-container'>
            <h2>Variance Cov VaR over 15 day period</h2>
            <div style={{ columnCount: "2" }}>
              {varCovVarData["ValueAtRisk_15days"].map((el, k) => {
                return (
                  <h4 key={k}>
                    {`${k + 1} Day Var @ 95% Confidence `}
                    &emsp;{":"} &emsp;
                    {el}
                  </h4>
                );
              })}
            </div>
          </div>
          <div className='card-container'>
            <PlotlyPlot
              Data={varCovNdayPlot}
              heading={"Var (Variance Covariance) over a period of 15 days"}
            />
          </div>
          {/* {MonteCarlo Method var} */}
          <div className='card-container'>
            <PlotlyPlot
              Data={monteCarloSimPlot}
              heading={"MonteCarlo Method Simulated Prices for each Stock"}
            />
          </div>
          <div className='card-container'>
            <h2>"Monetcarlo Var Results"</h2>
            {Object.entries(monetCarloSimulationResult).map((ele, key) => {
              return (
                <>
                  <h4 style={{ fontSize: "20px" }}>{ele[0]}</h4>
                  <h4>
                    {`STARTING PRICE : ${ele[1][0].toFixed(5)}`}&emsp;
                    {`MEAN PRICE : ${ele[1][1].toFixed(5)}`}&emsp;
                    {`VALUE AT RISK(99%) : ${ele[1][2].toFixed(5)}`}&emsp;
                    {`Z-SCORE(99% left tail) : ${ele[1][3].toFixed(5)}`}
                  </h4>
                </>
              );
            })}
          </div>
          <PlotlyPlot
            Data={monteCarloHistPlot}
            heading={"Distribution of Simulated Prices and Var Line"}
          />
        </>
      ) : (
        <div>Loading.....</div>
      )}
    </>
  );
};

const CovVarMetrics = ({ data }) => {
  return (
    <>
      <div className='card-container'>
        <h2>Average Returns of Stocks</h2>
        {Object.entries(data[["Average Returns"]]).map((el, key) => {
          return <ListHtml ele={el} k={key} />;
        })}
      </div>
      <div className='card-container'>
        <h2>Variance-Convariance Var Metrics</h2>
        <>
          <h4>
            {" INITIAL INVESTMENT"}
            &emsp;{":"} &emsp;
            {data["InitialInvst"]}
          </h4>
          <h4>
            {"INVESTMENT MEAN"}
            &emsp;{":"} &emsp;
            {data["Investment Mean"].toFixed(4)}
          </h4>
          <h4>
            {"INVESTMENT STD DEV"}
            &emsp;{":"} &emsp;
            {data["Investment Std"].toFixed(4)}
          </h4>
          <h4>
            {"Z-Score Left Tail(95%)"}
            &emsp;{":"} &emsp;
            {data["LeftTailCuttOff"].toFixed(4)}
          </h4>
          <h4>
            {"VALUE AT RISK(1DAY)"}
            &emsp;{":"} &emsp;
            {data["ValueAtRisk"].toFixed(4)}
          </h4>
        </>
      </div>
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
        {ele[1]}
      </h4>
    </>
  );
};

export default VARanalysis;
