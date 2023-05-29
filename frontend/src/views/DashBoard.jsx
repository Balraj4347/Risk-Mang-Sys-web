import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/charts.scss";
import Plot from "react-plotly.js";
import LineChart from "../Components/Dashboard/Charts/LineChart";
import { useAuth } from "../context/AuthContext";
import ReactApexChart from "react-apexcharts";

const DashBoard = () => {
  const authState = useAuth();
  const [analysis, setAnalysis] = useState(undefined);
  const [returnMetrics, setReturnMetrics] = useState(undefined);
  const [returnData, setReturnData] = useState(undefined);
  const [adjCloseData, setAdjCloseData] = useState(undefined);
  const [cummulativeReturnData, setCummulativeReturnData] = useState(undefined);
  const [plot, setPlot] = useState(0);
  useEffect(() => {
    get_analysis_resp();
    //eslint-disable-next-line
  }, []);

  const get_analysis_resp = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: authState.token,
      },
    };
    try {
      let resp = await axios.get("/api/v1/analysis/result", config);
      // console.log(resp.data.analysis["Current Holding"]);
      setAnalysis(resp.data.analysis);
      setAdjCloseData(resp.data.adj_close_data);
      setCummulativeReturnData(resp.data.cummulative_return_data);
      setReturnData(resp.data.returns_data);
      setReturnMetrics(resp.data.return_metric);
      setPlot(resp.data.hist_json);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      {analysis ? (
        <div className='container-block '>
          <div className='cards-wrapper'>
            {Object.entries(analysis).map((ele, i) => {
              if (ele[0] === "Current Holding") return <></>;

              return (
                <div className='card-container' key={i}>
                  <h2>{ele[0]}</h2>
                  <h4 style={{ fontSize: "2em" }}>$ {ele[1].toFixed(4)}</h4>
                </div>
              );
            })}
          </div>
          <div className='cards-wrapper'>
            <div className='card-container pie-chart-container'>
              <h2> Current Holdings Distribution</h2>
              <ReactApexChart
                id={"portfolio-pie-chart"}
                options={getPieOptions(analysis["Current Holding"])}
                series={getSeries(analysis["Current Holding"])}
                type='pie'
                height='100%'
              />
            </div>
          </div>
          <div className='cards-wrapper'>
            {Object.entries(returnMetrics).map((ele, k) => {
              return (
                <div
                  className='card-container'
                  style={{ minWidth: "250px" }}
                  key={k}
                >
                  <h2>{ele[0]}</h2>
                  {Object.entries(ele[1]).map((el, k) => {
                    return <ListHtml ele={el} k={k} />;
                  })}
                </div>
              );
            })}
          </div>
          <div className='chart-container container-block '>
            <div className='charts-wrapper'>
              {adjCloseData && (
                <>
                  <h2>Adj Close Prices</h2>
                  <LineChart
                    data={adjCloseData}
                    xtitle={"Time"}
                    ytitle={"<-----Adj Close Price--->"}
                    plotTitle={"Adj Close Prices of the stocks"}
                  />
                </>
              )}
              {returnData && (
                <>
                  <h2>Returns</h2>
                  <LineChart
                    data={returnData}
                    xtitle={"Time"}
                    ytitle={"<-----Returns--->"}
                    plotTitle={"Returns of the stocks"}
                  />
                </>
              )}
              <h2>Distribution of Returns of the stocks</h2>
              <div className='card-container chart-container'>
                <Plot
                  data={plot.data}
                  layout={plot.layout}
                  useResizeHandler
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {cummulativeReturnData && (
                <>
                  <h2>Cummulative Returns</h2>
                  <LineChart
                    data={cummulativeReturnData}
                    xtitle={"Time"}
                    ytitle={"<-----Cummulative Return--->"}
                    plotTitle={"Cummulative Returns of the stocks"}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>Loading....</div>
      )}
    </>
  );
};

const getPieOptions = (data) => {
  return {
    chart: {
      type: "pie",
    },
    labels: Object.keys(data),
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

const getSeries = (data) => {
  return Object.values(data);
};

export default DashBoard;
