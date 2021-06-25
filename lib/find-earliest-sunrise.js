const { getSunriseSunsetData } = require('../services/getData');

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

function TasksQueue(tasks) {
  let tasksToBeRun = [...tasks];
  while (tasksToBeRun.length > 0) {
    // TODO
  }
}

TasksQueue.prototype.runTask = async (task, data, next) => {
  await task(...data);
  next();
};

function ConcurrentTasksManager(task, data, maxConcurrentTasks) {
  // TODO
  const tasksInProgress = [];
  // await task(...data);
}

function findEarliestSunrise({ apiURL, maxConcurrentFetch, numberOfPoints }) {
  console.log('findEarliestSunrise:', apiURL, maxConcurrentFetch, numberOfPoints);
  const randomCoords = getRandomCoords(numberOfPoints);
  console.log(randomCoords);
  randomCoords.forEach(async ({ latitude, longitude }) => {
    const data = await getSunriseSunsetData(apiURL, latitude, longitude);
    console.log(data);
  });
}

module.exports = findEarliestSunrise;
