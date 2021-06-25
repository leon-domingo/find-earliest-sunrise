#!/usr/bin/env node
// const findEarliestSunrise = require('./lib/find-earliest-sunrise');
// require('dotenv').config();
//
// const API_URL = process.env.API_URL;
// if (!API_URL) {
//   console.error('Please, define an API URL!');
//   process.exit(1);
// }
// const MAX_CONCURRENT_FETCH = process.env.MAX_CONCURRENT_FETCH || 5;
// const NUMBER_OF_POINTS = process.env.NUMBER_OF_POINTS || 100;
// findEarliestSunrise({
//   apiURL: API_URL,
//   maxConcurrentFetch: MAX_CONCURRENT_FETCH,
//   numberOfPoints: NUMBER_OF_POINTS,
// });

async function createAPromise(value, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });

  // return new Promise(async (resolve) => {
  //   await fetch('http://api.tol.io/api/tol/payment_failed/');
  //   resolve(value);
  // });
}

const TASK_STATUS = {
  WAITING: 'WAITING',
  SELECTED: 'SELECTED',
  RUNNING: 'RUNNING',
  FINISHED: 'FINISHED',
};

const NUMBER_OF_TASKS = 100;
const TIME_PER_TASK = 2000;
const totalTasks = [];
for (let n = 1; n <= NUMBER_OF_TASKS; n++) {
  const id = `P${n}`;
  totalTasks.push({
    id,
    data: {},
    status: TASK_STATUS.WAITING,
  });
}

const MAX_CONCURRENT_TASKS = 5;
const totalTasksLength = totalTasks.length;
function getTasksByStatus(tasks, taskStatus) {
  return () => tasks.filter(({ status }) => status === taskStatus);
}
const getWaitingTasks = getTasksByStatus(totalTasks, TASK_STATUS.WAITING);
const getSelectedTasks = getTasksByStatus(totalTasks, TASK_STATUS.SELECTED);
const getRunningTasks = getTasksByStatus(totalTasks, TASK_STATUS.RUNNING);
const getFinishedTasks = getTasksByStatus(totalTasks, TASK_STATUS.FINISHED);

const poolingIntervalTime = 500;
const startTime = Date.now();
const poolingInterval = setInterval(async () => {
  if (getFinishedTasks().length === totalTasksLength) {
    const expectedTime = TIME_PER_TASK * totalTasksLength / MAX_CONCURRENT_TASKS;
    const actualTime = Date.now() - startTime;
    console.log(`Expected time ${expectedTime}ms / Actual time ${actualTime}ms`);
    clearInterval(poolingInterval);
    console.log('<EXIT>');
  }

  console.log(
    'Waiting:', getWaitingTasks().length,
    'Selected (to be executed):', getSelectedTasks().length,
    'Running:', getRunningTasks().length,
    'Finished:', getFinishedTasks().length,
  );
  console.log(totalTasks.map(task => `${task.id}-${task.status}`).join(' | '));

  if (getWaitingTasks().length > 0) {
    while (getSelectedTasks().length < MAX_CONCURRENT_TASKS) {
      const waitingTask = getWaitingTasks()[0];
      console.log(`Adding task ${waitingTask.id}...`);
      waitingTask.status = TASK_STATUS.SELECTED;
    }
  }

  const selectedTasks = getSelectedTasks();
  if (selectedTasks.length > 0 && getRunningTasks().length < MAX_CONCURRENT_TASKS) {
    for (let selectedTask of selectedTasks) {
      console.log(`Running task ${selectedTask.id}...`);
      selectedTask.status = TASK_STATUS.RUNNING;
      // TODO: pass callback and data from "selectedTask"
      createAPromise(selectedTask.id, TIME_PER_TASK)
        .then(() => {
          console.log(`${selectedTask.id} done!`);
          selectedTask.status = TASK_STATUS.FINISHED; // XXX: this status is never really used
        })
        .catch(err => console.error(err));
    }
  }
}, poolingIntervalTime);
console.log(
  getWaitingTasks().length,
  getSelectedTasks().length,
  getRunningTasks().length,
  getFinishedTasks().length,
);
