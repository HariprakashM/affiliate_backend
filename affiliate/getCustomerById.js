var axios = require("axios");
async function getCustomerById(req) {
  var config = {
    method: "get",
    url: `https://woocommerce-585793-1896812.cloudwaysapps.com/wp-json/wc/v3/customers/${req.body.customer_id}`,
    headers: {
      Authorization:
        "Basic Y2tfZGY0MDgyZjI0ZWVlYWVlZWQ3MTU3MWJhNjE1NTEzNDQzZTEzNzlmZTpjc185NzAwZGUwOTMwZmFmNmNjYzczOGNhZWUxM2JlMjJlNzA0MTRlMGI0",
      Cookie: "PHPSESSID=b8p083hotvf0m2voidot3rc8gg",
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
module.exports = getCustomerById;
