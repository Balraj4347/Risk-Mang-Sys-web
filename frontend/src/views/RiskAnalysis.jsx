import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/charts.scss";
import Plot from "react-plotly.js";
import axios from "axios";
import VARanalysis from "../Components/RiskAnalysis/VARanalysis";

export const RiskAnalysis = () => {
  const authState = useAuth();
  const [respData, setRespData] = useState(false);
  const [gained95, setGained95] = useState(undefined);
  const [lost5, setLost5] = useState(undefined);
  const [marketCompData, setMarketCompData] = useState(undefined);
  const [sharpeData, setSharpeData] = useState(undefined);
  const [marketBoxPlot, setMarketBoxPlot] = useState(undefined);
  const [stockRiskBoxPlot, setStockRiskBoxPlot] = useState(undefined);
  const [riskVsReturnPlot, setRiskVsReturnPlot] = useState(undefined);
  const [riskOverTime, setRiskOverTime] = useState(undefined);

  useEffect(() => {
    get_risk_analysis_result();
    //eslint-disable-next-line
  }, []);
  const get_risk_analysis_result = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: authState.token,
      },
    };
    try {
      let resp = await axios.get("/api/v1/risk/result", config);
      // console.log(resp.data);
      setRespData(resp.data.dataReceived);
      setGained95(resp.data.best_gained_95);
      setLost5(resp.data.lost_worst_5);
      setMarketCompData(resp.data.MarketComparision);
      setSharpeData(resp.data.SharpeRatioData);
      setStockRiskBoxPlot(resp.data.StockRiskBoxPlot);
      setRiskVsReturnPlot(resp.data.RiskVsReturnPlot);
      setMarketBoxPlot(resp.data.MarketBoxPlot);
      setRiskOverTime(resp.data.RiskOverTime);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      {respData ? (
        <>
          <div className='continer-block'>
            <div className='cards-wrapper'>
              <div className='card-container'>
                <h3> Amount of Value gained by stock in the best 5% returns</h3>
                {Object.entries(gained95).map((ele, key) => {
                  return <ListHtml ele={ele} k={key} />;
                })}
              </div>
              <div className='card-container'>
                <h3> Amount of Value Lost by stock in the worst 5% returns</h3>
                {Object.entries(lost5).map((ele, key) => {
                  return <ListHtml ele={ele} k={key} />;
                })}
              </div>
            </div>
            <div className='cards-wrapper'>
              <div className='card-container'>
                <h2>Risk Comparision of Portfolio to Market</h2>
                {Object.entries(marketCompData).map((ele, key) => {
                  return <ListHtml ele={ele} k={key} />;
                })}
              </div>
              <div className='card-container'>
                <h2>Sharpe Ratio of Portfolio and Market</h2>
                {Object.entries(sharpeData).map((ele, key) => {
                  return <ListHtml ele={ele} k={key} />;
                })}
              </div>
            </div>
            <PlotlyPlot
              Data={marketBoxPlot}
              heading={
                "Volotality Comparision : Spread of Portfolio vs Market returns"
              }
            />
            <PlotlyPlot
              Data={stockRiskBoxPlot}
              heading={"Box Plot : spread of Stocks returns"}
            />
            <PlotlyPlot
              Data={riskVsReturnPlot}
              heading={"Risk Vs Return : Scatter Plot"}
            />
            <PlotlyPlot
              Data={riskOverTime}
              heading={"Comparing Risk Over Time of Market and Portfolio"}
            />
            <VARanalysis authState={authState} />
          </div>
        </>
      ) : (
        <>Loading....</>
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
        {ele[1]}
      </h4>
    </>
  );
};
