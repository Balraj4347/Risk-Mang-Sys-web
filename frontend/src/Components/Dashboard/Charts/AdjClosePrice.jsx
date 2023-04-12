import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import ReactApexChart from "react-apexcharts";
import getOptions from "../../../Utils/ApexChartAreaOptions";
const AdjClosePrice = () => {
  const authState = useAuth();
  const [adjCloseData, setAdjCloseData] = useState(undefined);
  useEffect(() => {
    getAdjClose();
    //eslint-disable-next-line
  }, []);

  const getAdjClose = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: authState.token,
      },
    };
    try {
      let resp = await axios.get("/api/v1/analysis/adjclose", config);
      console.log(resp.data);
      setAdjCloseData(resp.data.adj_close_data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {adjCloseData && (
        <>
          <h3> Adj Close Prices For the Stocks </h3>
          <div className='card-container'>
            <ReactApexChart
              options={getOptions(
                adjCloseData,
                " Adj Close Price ($)  ",
                " Time "
              )}
              series={getSeries(adjCloseData)}
              type='area'
              height={400}
            />
          </div>
        </>
      )}
    </>
  );
};

const getSeries = (adjCloseData) => {
  let seriesObj = [];
  Object.keys(adjCloseData).forEach((ticker) => {
    // console.log(Object.values(adjCloseData[ticker]));
    seriesObj.push({
      name: ticker,
      data: Object.values(adjCloseData[ticker]),
    });
  });
  return seriesObj;
};

export default AdjClosePrice;
