const { v4: uuidv4 } = require('uuid');

const getTaskId = () => uuidv4();

const TASK_STATUS = {
  WAITING: 'WAITING',
  SELECTED: 'SELECTED',
  RUNNING: 'RUNNING',
  FINISHED: 'FINISHED',
};

module.exports = {
  getTaskId,
  TASK_STATUS,
};
