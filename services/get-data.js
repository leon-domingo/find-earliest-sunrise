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

const getSunriseSunsetDataMock = (failThreshold = .75, delay = 2000) =>
  async function(a, b, c) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < failThreshold) {
          resolve({ a, b, c });
        } else {
          const error = new Error('REQUEST FAILED');
          reject(error);
        }
      }, delay);
    });
  };

module.exports = {
  getSunriseSunsetData,
  getSunriseSunsetDataMock,
};
