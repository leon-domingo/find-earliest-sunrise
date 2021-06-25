const axios = require('axios');

const getSunriseSunsetData = async (apiURL, latitude, longitude) => {
  try {
    const res = await axios.get(apiURL, {
      params: {
        lat: latitude,
        lng: longitude,
      },
    });
    return res.data.results;
  } catch (err) {
    const { status, statusText } = err.response;
    throw new Error(`Request failed! ${status} ${statusText}`);
  }
};

module.exports = {
  getSunriseSunsetData,
};
