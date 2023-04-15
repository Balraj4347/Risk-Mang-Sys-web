import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/charts.scss";
import Plot from "react-plotly.js";
import { useAuth } from "../context/AuthContext";

const SentimentView = () => {
  const authState = useAuth();
  const [dataRecieved, setDataRecieved] = useState(false);
  const [totalSentiPlot, setTotalSentiPlot] = useState(false);
  const [companySentiData, setCompanySentiData] = useState(false);
  const [compHistPlot, setCompHistPlot] = useState(false);
  const [compSentiHistTimePlot, setCompSentiHistTimePlot] = useState(false);
  const [compSentiTimePlot, setCompSentiTimePlot] = useState(false);
  const [adjSentiPlot, setAdjSentiPlot] = useState(false);

  useEffect(() => {
    get_sentiment_resp();
    //eslint-disable-next-line
  }, []);

  const get_sentiment_resp = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        AccessToken: authState.token,
      },
    };
    try {
      let resp = await axios.get("/api/v1/senti/result", config);
      // console.log(resp.data);
      setDataRecieved(resp.data.DataRecieved);
      setTotalSentiPlot(resp.data.TotalSentiPlot);
      setCompanySentiData(resp.data.CompanySentiData);
      setCompHistPlot(resp.data.CompHistPlot);
      setCompSentiHistTimePlot(resp.data.CompSentiHistTimePlot);
      setCompSentiTimePlot(resp.data.CompSentiTimePlot);
      setAdjSentiPlot(resp.data.AdjSentiPlot);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      {dataRecieved ? (
        <>
          <div className='container-block'>
            <a
              href='https://finviz.com/'
              target='_blank'
              rel='noopener noreferrer'
              id='news-wesite-link'
            >
              Webiste used: FinViz
            </a>
            <PlotlyPlot
              Data={totalSentiPlot}
              heading={"Portfolio Sentiment Composition"}
            />
            <div className='cards-wrapper'>
              <div className='card-container' style={{ columnCount: "4" }}>
                {Object.entries(companySentiData).map((ele, k) => {
                  return (
                    <>
                      <h2 style={{ fontSize: "15px" }}>
                        Sentiment Composition {ele[0]}{" "}
                      </h2>
                      {Object.entries(ele[1]).map((el, k) => {
                        return (
                          <h4>
                            {el[0]}
                            &emsp;{":"}&emsp;
                            {el[1]}
                          </h4>
                        );
                      })}
                    </>
                  );
                })}
              </div>
            </div>
            <PlotlyPlot
              Data={compHistPlot}
              heading={"Frequency of sentiment for each Company "}
            />
            <PlotlyPlot
              Data={compSentiHistTimePlot}
              heading={"Sentiment score for each Company Over Time(Histogram)"}
            />
            <PlotlyPlot
              Data={compSentiTimePlot}
              heading={"Sentiment for each Company Over Time"}
            />
            <PlotlyPlot
              Data={adjSentiPlot}
              heading={"Sentiment Vs Close Price for each Company Over Time"}
            />
          </div>
        </>
      ) : (
        <div>Loading...</div>
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

export default SentimentView;
