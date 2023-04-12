import { Button } from "@mui/material";
import { AiFillCloseCircle } from "react-icons/ai";
import {
  usePortfolio,
  usePortfolioDispatch,
} from "../../context/PortfolioContext";
import { useSnackbar } from "notistack";

const ListStocks = ({ theme }) => {
  const { stocks, updateStocks } = usePortfolio();
  const stockDispatch = usePortfolioDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const UpdateStockDb = () => {
    updateStocks().then((data) => {
      enqueueSnackbar(data.msg, { variant: data.variant });
    });
  };
  return (
    <div className='card-container StockList-container'>
      <h3>Stock List</h3>
      <table>
        <thead className={theme.dark ? "dark-cont" : "light-cont"}>
          <tr>
            <th>Stock Ticker</th>
            <th>Stock Name</th>
            <th>Stock Quantity</th>
            <th>Stock Price</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((item) => {
            return (
              <tr key={item.id}>
                <td> {item.ticker}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>
                  <AiFillCloseCircle
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      stockDispatch({
                        type: "deleted",
                        id: item.id,
                        ticker: item.ticker,
                      });
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        <Button variant='contained' onClick={UpdateStockDb} size='small'>
          Update Portfolio
        </Button>
      </div>
    </div>
  );
};

export default ListStocks;
