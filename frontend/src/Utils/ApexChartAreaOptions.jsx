const getOptions = (Data, yaxisTitle, xaxisTitle) => {
  return {
    chart: {
      type: "area",
      stacked: false,
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
    annotations: {
      yaxis: [{ y: 0, borderColor: "black", width: "100%" }],
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      labels: {
        colors: "white",
      },
    },
    markers: {
      size: 0,
    },
    title: {
      text: `Adj Close Prices For the Stocks in Portfolio`,
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
    yaxis: {
      title: {
        text: yaxisTitle,
      },
    },
    xaxis: {
      categories: Object.keys(Data[Object.keys(Data)[0]]),
      title: {
        text: xaxisTitle,
      },
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

export default getOptions;
