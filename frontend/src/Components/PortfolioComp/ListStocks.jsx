const ListStocks = ({ stocks, theme }) => {
  return (
    <div className='card-container StockList-container'>
      <h3>Stock List</h3>
      <table>
        <thead className={theme.dark ? "dark-cont" : "light-cont"}>
          <tr>
            <th>Stock Ticker</th>
            <th>Stock Quantity</th>
            <th>Stock Price</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((item) => {
            return (
              <tr key={item.id}>
                <td> {item.text}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListStocks;
