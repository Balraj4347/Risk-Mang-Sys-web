import ReactApexChart from "react-apexcharts";
import { getAreaOptions } from "../../../Utils/ApexChartOptions";
const LineChart = ({ data, xtitle, ytitle, plotTitle }) => {
  return (
    <>
      {data && (
        <>
          <div className='card-container'>
            <ReactApexChart
              options={getAreaOptions(data, ytitle, xtitle, plotTitle)}
              series={getSeries(data)}
              type='area'
              height={450}
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

export default LineChart;
