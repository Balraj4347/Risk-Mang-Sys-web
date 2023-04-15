import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/charts.scss";
import Plot from "react-plotly.js";
import LineChart from "../Components/Dashboard/Charts/LineChart";
import { useAuth } from "../context/AuthContext";

const SnpCompare = () => {
  const authState = useAuth();
  const [combReturnData, setcombReturnData] = useState(undefined);
  const [cummReturnData, setCummReturnData] = useState(undefined);
  const [returnMetrics, setReturnMetrics] = useState(undefined);
  const [plot, setPlot] = useState(undefined);
  useEffect(() => {
    get_snp500_comp_data();
    //eslint-disable-next-line
  }, []);

  const get_snp500_comp_data = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: authState.token,
      },
    };
    try {
      let resp = await axios.get("/api/v1/analysis/snp500", config);
      // console.log(resp.data);
      setcombReturnData(resp.data.combinedDf);
      setCummReturnData(resp.data.cummReturn);
      setReturnMetrics(resp.data.ReturnMetrics);
      setPlot(resp.data.histPlot);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {combReturnData ? (
        <div className='container-block'>
          <div className='cards-wrapper'>
            {Object.entries(returnMetrics).map((ele, key) => {
              return (
                <div
                  className='card-container'
                  style={{ minWidth: "250px" }}
                  key={key}
                >
                  <h2>{ele[0]}</h2>
                  {Object.entries(ele[1]).map((el, k) => {
                    return (
                      <h4>
                        {el[0]}
                        {" :  "} &emsp;
                        {el[1]}
                      </h4>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className='chart-container container-block '>
            <div className='charts-wrapper'>
              <>
                <h2>Returns</h2>
                <LineChart
                  data={combReturnData}
                  xtitle={"Time"}
                  ytitle={"<-----Returns--->"}
                  plotTitle={"Comparing Returns of the  Portfolio with snp500"}
                />
              </>
              <h2>Distribution of Returns of the portfolio vs Snp500</h2>
              <div className='card-container chart-container'>
                <Plot
                  data={plot.data}
                  layout={plot.layout}
                  useResizeHandler
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <>
                <h2>Cummulative Returns</h2>
                <LineChart
                  data={cummReturnData}
                  xtitle={"Time"}
                  ytitle={"<-----Returns--->"}
                  plotTitle={
                    "Comparing Cummulative Returns of the  Portfolio with snp500"
                  }
                />
              </>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading....</div>
      )}
    </>
  );
};

export default SnpCompare;
