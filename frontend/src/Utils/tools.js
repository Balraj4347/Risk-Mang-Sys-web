/**
 * Utility Funciton to create a unique Hash ID provided a string(Stock Ticker)
 * @param {String} str Stock Ticker
 * @returns A unique HashId to map to the stock ticker
 */
function hashCode(str) {
  var hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function generatePayload(stocks) {
  let ans = {};
  Object.values(stocks).forEach((ele) => {
    ans[ele.ticker] = {
      name: ele.name,
      quantity: ele.quantity,
      price: ele.price,
    };
  });
  return ans;
}
export { hashCode, generatePayload };
