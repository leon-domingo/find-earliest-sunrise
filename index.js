#!/usr/bin/env node
const { getSunriseSunsetData } = require('./services/getData');
const { getRandomLatitude, getRandomLongitude } = require('./lib/find-earliest-sunrise');
// const { findEarliestSunrise } = require('./lib/find-earliest-sunrise');

require('dotenv').config();

const API_URL = process.env.API_URL;
if (!API_URL) {
  console.error('Please, define an API URL!');
  process.exit(1);
}
const MAX_CONCURRENT_FETCH = process.env.MAX_CONCURRENT_FETCH || 5;
const NUMBER_OF_POINTS = +process.env.NUMBER_OF_POINTS || 100;
// findEarliestSunrise({
//   apiURL: API_URL,
//   maxConcurrentFetch: MAX_CONCURRENT_FETCH,
//   numberOfPoints: NUMBER_OF_POINTS,
// });

async function createAPromise(asyncFunc, data) {
  return new Promise((resolve, reject) => {
    asyncFunc(...data)
      .then(asyncData => resolve(asyncData))
      .catch(err => reject(err));
  });
}

const TASK_STATUS = {
  WAITING: 'WAITING',
  SELECTED: 'SELECTED',
  RUNNING: 'RUNNING',
  FINISHED: 'FINISHED',
};

// const TIME_PER_TASK = 2000;
const totalTasks = [];
for (let n = 1; n <= NUMBER_OF_POINTS; n++) {
  const id = `Task-${n}`;
  totalTasks.push({
    id,
    data: [API_URL, getRandomLatitude(), getRandomLongitude()],
    resultData: null,
    status: TASK_STATUS.WAITING,
  });
}

const totalTasksLength = totalTasks.length;
function getTasksByStatus(tasks, taskStatus) {
  return () => tasks.filter(({ status }) => status === taskStatus);
}
const getWaitingTasks = getTasksByStatus(totalTasks, TASK_STATUS.WAITING);
const getSelectedTasks = getTasksByStatus(totalTasks, TASK_STATUS.SELECTED);
const getRunningTasks = getTasksByStatus(totalTasks, TASK_STATUS.RUNNING);
const getFinishedTasks = getTasksByStatus(totalTasks, TASK_STATUS.FINISHED);

const polingIntervalTime = 500;
const startTime = Date.now();
const polingInterval = setInterval(async () => {
  if (getFinishedTasks().length === totalTasksLength) {
    const elapsedTime = Date.now() - startTime;
    console.log(`Elapsed time ${elapsedTime}ms`);
    clearInterval(polingInterval);
    console.log('<EXIT>');
  }

  console.log(
    'Waiting:', getWaitingTasks().length,
    'Selected (to be executed):', getSelectedTasks().length,
    'Running:', getRunningTasks().length,
    'Finished:', getFinishedTasks().length,
  );
  // console.log(totalTasks.map(task => `${task.id}-${task.status}`).join(' | '));

  if (getWaitingTasks().length > 0) {
    while (getSelectedTasks().length < MAX_CONCURRENT_FETCH) {
      const waitingTask = getWaitingTasks()[0];
      console.log(`Adding task ${waitingTask.id}...`);
      waitingTask.status = TASK_STATUS.SELECTED;
    }
  }

  const selectedTasks = getSelectedTasks();
  if (selectedTasks.length > 0 && getRunningTasks().length < MAX_CONCURRENT_FETCH) {
    for (let selectedTask of selectedTasks) {
      console.log(`Running task ${selectedTask.id}...`);
      selectedTask.status = TASK_STATUS.RUNNING;
      createAPromise(getSunriseSunsetData, selectedTask.data)
        .then((data) => {
          selectedTask.status = TASK_STATUS.FINISHED;
          selectedTask.resultData = data;
        })
        .catch(err => {
          console.log(`${selectedTask.id} failed - ${err}`);
          selectedTask.status = TASK_STATUS.FINISHED;
          selectedTask.error = err;
        });
    }
  }
}, polingIntervalTime);
console.log(
  getWaitingTasks().length,
  getSelectedTasks().length,
  getRunningTasks().length,
  getFinishedTasks().length,
);
