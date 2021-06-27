const axios = require('axios');

const getSunriseSunsetData = async (apiURL, latitude, longitude, date) => {
  try {
    const res = await axios.get(apiURL, {
      params: {
        lat: latitude,
        lng: longitude,
        date,
      },
    });
    return res.data.results;
  } catch (err) {
    const { status, statusText } = err.response;
    throw new Error(`Request failed! ${status} ${statusText}`);
  }
};

const getSunriseSunsetDataMock = (failThreshold = .75, delay = 2000) =>
  async function(apiURL, latitude, longitude, date = 'today') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < failThreshold) {
          resolve({ apiURL, latitude, longitude, date });
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
