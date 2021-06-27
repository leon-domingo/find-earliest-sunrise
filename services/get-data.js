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
        if (Math.random() > failThreshold) {
          resolve({
            '__MOCKUP__': {
              apiURL,
              latitude,
              longitude,
              date,
            },
            'sunrise': '9:44:20 AM',
            'sunset': '9:33:08 PM',
            'solar_noon': '5:19:14 PM',
            'day_length': '15:09:48',
            'civil_twilight_begin': '9:10:26 AM',
            'civil_twilight_end': '1:28:03 AM',
            'nautical_twilight_begin': '8:26:51 AM',
            'nautical_twilight_end': '2:11:38 AM',
            'astronomical_twilight_begin': '7:34:44 AM',
            'astronomical_twilight_end': '3:03:45 AM',
          });
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
