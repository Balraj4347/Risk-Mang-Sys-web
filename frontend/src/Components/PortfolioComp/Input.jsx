import { useState } from "react";
import { hashCode } from "../../Utils/tools";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, IconButton } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NumbersIcon from "@mui/icons-material/Numbers";
import { useSnackbar } from "notistack";
import axios from "axios";

/**
 * Input field component to get the Stock Ticker and quantity . Add that to the Stock State
 * @param {StockContext} stocks  current state of stock list
 * @param {stockDispatchContext} stockDispatch dispatch the add action to update the state of stock list
 */
const Input = ({ stocks, stockDispatch, theme }) => {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [possibleTickers, setPossibleTickers] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  /**
   * Function to add the input stock and quantity to the Stock State in Stock context
   */
  const addStock = () => {
    //check if empty input
    if (ticker === "" || quantity === 0 || name === "" || price === 0) {
      enqueueSnackbar("Fill ALL the Fields", { variant: "warning" });
      return;
    }
    let StockId = hashCode(ticker);
    // check if already the stock is in the state
    if (stocks.some((e) => e.id === StockId)) {
      enqueueSnackbar("Stock Already Added to the List", {
        variant: "warning",
      });
      return;
    }
    //Dispatch action to add the stock to the state
    stockDispatch({
      type: "added",
      id: StockId,
      ticker: ticker.toUpperCase(),
      name: name.toUpperCase(),
      quantity: quantity,
      price: price,
    });
    // re-initialise the input values
    setTicker("");
    setName("");
    setQuantity(0);
    setPrice(0);
    setPossibleTickers([]);
  };

  const tickerChange = async (e) => {
    setTicker(e.target.value);
    if (e.target.value !== "") {
      let tickerResp = await axios.get(
        "https://ticker-2e1ica8b9.now.sh/keyword/" + e.target.value
      );
      setPossibleTickers(tickerResp.data);
    } else {
      setPossibleTickers([]);
    }
  };

  return (
    <div className='card-container portfolio-input-container'>
      <div className=' textInp '>
        <div>
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <ShowChartIcon sx={{ color: "red", mr: 0.5, my: 0.5 }} />
            <TextField
              autoComplete='off'
              id='stockTicker'
              label='Enter Stock Ticker'
              variant='standard'
              sx={{
                input: {
                  color: `${theme.dark ? "#ffffff" : "#000000"}`,
                },
              }}
              InputLabelProps={{
                style: { color: `${theme.dark ? "#ffffff" : "#000000"}` },
              }}
              value={ticker}
              onChange={tickerChange}
              onKeyDown={(e) => {
                if (e.keyCode === 13) addStock();
              }}
            />
          </Box>
          <div
            id={"auto-suggest-box"}
            className={`${
              possibleTickers.length > 0 && "activeBox"
            } autocomp-box `}
          >
            <ul>
              {possibleTickers.length > 0 &&
                possibleTickers.map((item, idx) => {
                  return (
                    <li
                      key={idx}
                      onClick={(e) => {
                        setTicker(item.symbol);
                        setName(item.name);
                        setPossibleTickers([]);
                      }}
                    >
                      {item.symbol + `, ` + item.name}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <ShowChartIcon sx={{ color: "red", mr: 0.5, my: 0.5 }} />
          <TextField
            autoComplete='off'
            id='stockName'
            label='Enter Stock Name'
            variant='standard'
            sx={{
              input: {
                color: `${theme.dark ? "#ffffff" : "#000000"}`,
              },
            }}
            InputLabelProps={{
              style: { color: `${theme.dark ? "#ffffff" : "#000000"}` },
            }}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.keyCode === 13) addStock();
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <NumbersIcon sx={{ color: "blue", mr: 1, my: 0.5 }} />
          <TextField
            autoComplete='off'
            id='stockQuantity'
            type='number'
            label='Enter Stock quantity'
            variant='standard'
            sx={{
              color: `${theme.dark && "#ffffff"}`,
              input: {
                color: `${theme.dark ? "#ffffff" : "#000000"}`,
              },
            }}
            InputLabelProps={{
              style: { color: `${theme.dark ? "#ffffff" : "#000000"}` },
            }}
            value={quantity === 0 ? "" : quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.keyCode === 13) addStock();
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <AttachMoneyIcon sx={{ color: "blue", mr: 1, my: 0.5 }} />
          <TextField
            autoComplete='off'
            id='stockPrice'
            type='number'
            label='Enter Stock Price'
            variant='standard'
            sx={{
              color: `${theme.dark && "#ffffff"}`,
              input: {
                color: `${theme.dark ? "#ffffff" : "#000000"}`,
              },
            }}
            InputLabelProps={{
              style: { color: `${theme.dark ? "#ffffff" : "#000000"}` },
            }}
            value={price === 0 ? "" : price}
            onChange={(e) => {
              setPrice(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.keyCode === 13) addStock();
            }}
          />
        </Box>

        <Button variant='contained' onClick={addStock} size='small'>
          ADD Stock
        </Button>
      </div>
      <CsvInputField
        theme={theme}
        enqueueSnackbar={enqueueSnackbar}
        stocks={stocks}
        stockDispatch={stockDispatch}
      />
    </div>
  );
};

const CsvInputField = ({ theme, stocks, enqueueSnackbar, stockDispatch }) => {
  const [selectedFile, setSelectedFile] = useState(0);

  const handleCsvInput = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  const parseCSV = (e) => {
    e.preventDefault();
    const fileReader = new FileReader();
    if (selectedFile) {
      fileReader.onload = function (event) {
        const csvOutput = event.target.result;
        if (csvOutput.length !== 0) {
          const data = csvOutput.split(",");

          for (let i = 0; i < data.length; i += 3) {
            let StockId = hashCode(data[i]);
            // check if already the stock is in the state
            if (stocks.some((e) => e.id === StockId)) {
              enqueueSnackbar("Stock Already Added to the List", {
                variant: "warning",
              });
              continue;
            }
            stockDispatch({
              type: "added",
              id: StockId,
              ticker: data[i].toUpperCase(),
              name: data[i + 1].toUpperCase(),
              quantity: data[i + 2],
            });
          }
        } else {
          enqueueSnackbar("empty CSV file", { variant: "error" });
        }
      };

      fileReader.readAsText(selectedFile);
      setSelectedFile();
    }
  };

  return (
    <div className=' CsvInputDiv'>
      <label htmlFor='csvInput'>
        {" Input CSV File "}
        <IconButton component='span'>
          <FileUploadIcon
            sx={{ color: theme.dark ? "white" : "black" }}
          ></FileUploadIcon>
        </IconButton>
      </label>
      <input
        onChange={handleCsvInput}
        id='csvInput'
        name='file'
        style={{ display: "none" }}
        type='File'
        accept='.csv'
      />
      {selectedFile ? (
        <>
          <p>{selectedFile.name}</p>
          <Button className='addStckBtn' variant='contained' onClick={parseCSV}>
            Upload CSV
          </Button>
        </>
      ) : (
        <p>Select a CSV File</p>
      )}
    </div>
  );
};

export default Input;
