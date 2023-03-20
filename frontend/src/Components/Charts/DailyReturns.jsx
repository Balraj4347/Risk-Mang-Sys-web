import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ReactApexChart from "react-apexcharts";

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
      let resp = await axios.get("/api/v1/portfolio/dailyreturns", config);
      // console.log(resp.data.daily_returns_data);
      setReturnData(resp.data.daily_returns_data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSeries = (ticker) => {
    return [
      {
        name: `Daily Return Prices ${ticker}`,
        data: Object.values(returnData[ticker]),
      },
    ];
  };

  const getOptions = (ticker) => {
    return {
      chart: {
        type: "area",
        stacked: false,
        height: 350,
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          autoSelected: "zoom",
          tools: {
            pan: true,
            download: false,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      title: {
        text: `Time Series graph ${ticker}`,
        align: "center",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          color: "#ffffff",
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories: Object.keys(returnData[ticker]),
        labels: {
          datetimeFormatter: {
            year: "yyyy",
            month: "MMM 'yy",
            day: "dd MMM",
          },
          style: {
            fontSize: "10px",
            fontFamily: "Helvetica, Arial, sans-serif",
            cssClass: "apexcharts-xaxis-label",
          },
        },
      },
      tooltip: {
        x: {
          format: "dd/MM/yy",
        },
        dataLabels: {
          colors: "#000000",
        },
      },
    };
  };

  return (
    <>
      {returnData &&
        Object.keys(returnData).map((ticker) => (
          <div className='card-container' key={ticker}>
            <ReactApexChart
              options={getOptions(ticker)}
              series={getSeries(ticker)}
              type='area'
              height={300}
            />
          </div>
        ))}
    </>
  );
};

export default DailyReturns;
