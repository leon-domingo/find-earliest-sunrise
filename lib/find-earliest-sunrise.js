const parse = require('date-fns/parse');
const differenceInSeconds = require('date-fns/differenceInSeconds');
const addDays = require('date-fns/addDays');
const { getSunriseSunsetData } = require('../services/get-data');
// const { getSunriseSunsetDataMock } = require('../services/get-data');
const { getRandomCoords } = require('./coords');
const ConcurrentTasksManager = require('./concurrent-task-manager');

function findEarliestSunrise({ apiURL, maxConcurrentFetch, numberOfPoints }) {
  let taskWithEarliestSunrise = {
    sunrise: null,
  };
  const tasksManager = new ConcurrentTasksManager({
    verbose: true,
    maxConcurrentTasks: maxConcurrentFetch,
    onStart(timestamp) {
      console.log(`[onStart] # of tasks = ${this.tasks.length} (startTime = ${timestamp})`);
    },
    onEnd() {
      if (this.getSuccessfulTasks().length > 0) {
        const [latitude, longitude] = taskWithEarliestSunrise.params.slice(1);
        let { sunrise, sunset } = taskWithEarliestSunrise.result;
        console.log(`The earliest sunrise is at ${sunrise} (lat = ${latitude}, lng = ${longitude})`);

        const timeFormat = 'h:mm:ss a';
        const parsedSunrise = parse(sunrise, timeFormat, new Date());
        let parsedSunset = parse(sunset, timeFormat, new Date());

        let dayLength = differenceInSeconds(parsedSunset, parsedSunrise);
        if (dayLength < 0) {
          parsedSunset = addDays(parsedSunset, 1);
          dayLength = differenceInSeconds(parsedSunset, parsedSunset);
        }
        const dayLengthInHours = dayLength / 3600;

        console.log(`The length for that day is ${dayLength} seconds / ${dayLengthInHours.toFixed(2)} hours. From ${parsedSunrise.toISOString()} to ${parsedSunset.toISOString()}`);
      } else {
        console.error(`[ERROR] There are not successful tasks to compute the earliest sunrise`);
      }
    },
    onSuccessfulTask(successfulTask) {
      console.log(`[onSuccessfulTask] ${JSON.stringify(successfulTask, null, 2)}`);
      if (
        taskWithEarliestSunrise.sunrise === null ||
        successfulTask.result.sunrise < taskWithEarliestSunrise.sunrise
      ) {
        taskWithEarliestSunrise = {
          ...successfulTask,
        };
      }
    },
    onFailedTask(failedTask) {
      console.log(`[onFailedTask] ${failedTask.error}`);
    },
  });

  const randomCoords = getRandomCoords(numberOfPoints);
  randomCoords.forEach(({ latitude, longitude }) => {
    tasksManager.addSingleTask({
      asyncFunc: getSunriseSunsetData,
      // asyncFunc: getSunriseSunsetDataMock(.25, 1000),
      params: [apiURL, latitude, longitude],
    });
  });
  tasksManager.runTasks();
}

module.exports = {
  findEarliestSunrise,
};
