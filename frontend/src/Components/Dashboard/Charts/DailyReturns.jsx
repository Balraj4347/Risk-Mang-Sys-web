import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import ReactApexChart from "react-apexcharts";
import getOptions from "../../../Utils/ApexChartAreaOptions";

const DailyReturns = () => {
  const authState = useAuth();
  const [returnData, setReturnData] = useState(undefined);

  useEffect(() => {
    getReturnsData();
    //eslint-disable-next-line
  }, []);

  const getReturnsData = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: authState.token,
      },
    };
    try {
      let resp = await axios.get("/api/v1/analysis/dailyreturns", config);
      // console.log(resp.data.daily_returns_data);
      setReturnData(resp.data.daily_returns_data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {returnData && (
        <>
          <h3> Returns For the Stocks </h3>
          <div className='card-container'>
            <ReactApexChart
              options={getOptions(returnData, " <-- Returns  -->", " Time ")}
              series={getSeries(returnData)}
              type='area'
              height={400}
            />
          </div>
        </>
      )}
    </>
  );
};

const getSeries = (returnData) => {
  let seriesObj = [];
  Object.keys(returnData).forEach((ticker) => {
    // console.log(Object.values(returnData[ticker]));
    seriesObj.push({
      name: ticker,
      data: Object.values(returnData[ticker]),
    });
  });
  return seriesObj;
};

export default DailyReturns;
