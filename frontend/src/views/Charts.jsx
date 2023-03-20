import "../styles/charts.scss";

import DailyReturns from "../Components/Charts/DailyReturns";
const Charts = () => {
  return (
    <>
      <div className='chart-container container-block '>
        <h3>Daily Returns For the Stocks </h3>
        <div className='cards-wrapper'>
          <DailyReturns />
        </div>
      </div>
    </>
  );
};

export default Charts;
