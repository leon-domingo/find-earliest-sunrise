const axios = require('axios');

const getSunriseSunsetData = async (apiURL, latitude, longitude) => {
  try {
    const res = await axios.get(apiURL, {
      params: {
        lat: latitude,
        lng: longitude,
      },
    });
    // console.log(res.data.results);
    return res.data.results;
  } catch (err) {
    // console.error(err);
    // console.log(err.request);
    const { status, statusText } = err.response;
    console.log('The request has failed', status, statusText);
  }
};

module.exports = {
  getSunriseSunsetData,
};
