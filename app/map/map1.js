const axios = require('axios')

// const response = await axios(`https:api.geoapify.com/v1/routing?waypoints=12.9767936,77.590082|13.1367201,78.1337246|13.0070817,76.0992703&mode=drive&apiKey=YOUR_API_KEY`);
// const data = await response.json();      

// console.log(data);


const apiKey = '659802a9ecc6a876797382jag35e1f0';

// Specify waypoints as latitude and longitude pairs
// const waypoints = '12.9767936,77.590082|13.1367201,78.1337246|13.0070817,76.0992703';
// https://api.geoapify.com/v1/routing?waypoints=50.96209827745463%2C4.414458883409225%7C50.429137079078345%2C5.00088081232559&mode=drive&apiKey=c0f37928f6714be7b9dcac0a3d9696e9
const data='hassan'
// Construct the API request URL
// const apiUrl = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${apiKey}`;
const apiUrl=`https://geocode.maps.co/search?q=${data}&api_key=${apiKey}`

// Make the API request using fetch
const fetchData = async () => {
  try {
    const response = await axios(apiUrl);

    // Check if the request was successful (HTTP status code 200)
    if (response.ok) {
      const data = await response.json();

      // Output the response data
      console.log(data);
    } else {
      console.error(`Error: ${response.status} - ${await response.text()}`);
    }
  } catch (error) {
    console.error(`Error making API request: ${error.message}`);
  }
};

// Call the fetchData function
fetchData();
