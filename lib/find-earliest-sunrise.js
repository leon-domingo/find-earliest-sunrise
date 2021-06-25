const { getSunriseSunsetData } = require('../services/get-data');
const { getRandomCoords } = require('./coords');
const ConcurrentTasksManager = require('./concurrent-task-manager');

function findEarliestSunrise({ apiURL, maxConcurrentFetch, numberOfPoints }) {
  console.log('findEarliestSunrise:', apiURL, maxConcurrentFetch, numberOfPoints);
  const tasksManager = new ConcurrentTasksManager({
    verbose: true,
    maxConcurrentTasks: maxConcurrentFetch,
    onStart(timestamp) {
      console.log(`[onStart] # of tasks = ${this.tasks.length} (startTime = ${timestamp})`);
    },
    onEnd(timestamp) {
      console.log(`[onEnd] ${timestamp} (successfullTasks = ${this.getSuccessfulTasks().length}) (failedTasks = ${this.getFailedTasks().length})`);
    },
    onSuccessfulTask(successfulTask) {
      console.log(`[onSuccessfulTask] ${JSON.stringify(successfulTask, null, 2)}`);
    },
    onFailedTask(failedTask) {
      console.log(`[ononFailedTask] ${failedTask.error}`);
    },
  });
  const randomCoords = getRandomCoords(numberOfPoints);
  randomCoords.forEach(({ latitude, longitude }) => {
    tasksManager.addSingleTask({
      // id: `Task-${index + 1}`,
      asyncFunc: getSunriseSunsetData,
      params: [apiURL, latitude, longitude],
    });
  });

  tasksManager.runTasks();
}

module.exports = {
  findEarliestSunrise,
};
