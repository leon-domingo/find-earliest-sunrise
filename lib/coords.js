// N: Helsinki: Latitude 60.192059, Longitude is 24.945831
// S: Cape Town: Latitude -33.918861, Longitude 18.423300
// E: Seatle: Latitude 47.608013, Longitude	-122.335167
// W: Tokyo: Latitude 35.652832, Longitude 139.839478

const getRandomLatitude = () => {
  const minLatitude = -30;
  const maxLatitude = 60;
  return Math.random() * (maxLatitude - minLatitude) + minLatitude;
};

const getRandomLongitude = () => {
  const minLongitude = -120;
  const maxLongitude = 140;
  return Math.random() * (maxLongitude - minLongitude) + minLongitude;
};

const getRandomCoords = numberOfCoords => {
  const randomCoords = [];
  for (let i = 1; i <= numberOfCoords; i++) {
    const coordinates = {
      latitude: getRandomLatitude(),
      longitude: getRandomLongitude(),
    };
    randomCoords.push(coordinates);
  }
  return randomCoords;
};

module.exports = {
  getRandomLatitude,
  getRandomLongitude,
  getRandomCoords,
};
