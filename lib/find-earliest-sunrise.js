const { getSunriseSunsetData } = require('../services/getData');
const { getRandomCoords } = require('./coords');
const ConcurrentTasksManager = require('./concurrent-task-manager');

function findEarliestSunrise({ apiURL, maxConcurrentFetch, numberOfPoints }) {
  console.log('findEarliestSunrise:', apiURL, maxConcurrentFetch, numberOfPoints);
  const tasksManager = new ConcurrentTasksManager({
    maxConcurrentTasks: maxConcurrentFetch,
  });
  const randomCoords = getRandomCoords(numberOfPoints);
  // console.log(randomCoords);
  randomCoords.forEach(({ latitude, longitude }, index) => {
    // const data = await getSunriseSunsetData(apiURL, latitude, longitude);
    // console.log(data);
    tasksManager.addSingleTask({
      id: `Task-${index + 1}`,
      asyncFunc: getSunriseSunsetData,
      params: [apiURL, latitude, longitude],
    });
  });

  tasksManager.runTasks();
}

module.exports = {
  findEarliestSunrise,
};
