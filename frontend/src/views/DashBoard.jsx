import React from "react";
import "../styles/charts.scss";
import { AdjClosePrice, DailyReturns } from "../Components/Dashboard/Charts";

const DashBoard = () => {
  return (
    <div className='container-block '>
      <div className='cards-wrapper'>
        <div className='card-container fake-height'> container-1</div>
        <div className='card-container fake-height'> container-2</div>
        <div className='card-container fake-height'> container-3</div>
      </div>
      <div className='cards-wrapper'>
        <div className='card-container fake-height'> container-1</div>
        <div className='card-container fake-height'> container-2</div>
      </div>
      <div className='cards-wrapper'>
        <div className='card-container fake-height'> container-1</div>
        <div className='card-container fake-height'> container-2</div>
        <div className='card-container fake-height'> container-3</div>
        <div className='card-container fake-height'> container-4</div>
        <div className='card-container fake-height'> container-5</div>
        <div className='card-container fake-height'> container-6</div>
      </div>
      <div className='chart-container container-block '>
        <div className='charts-wrapper'>
          <AdjClosePrice />
          <DailyReturns />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
