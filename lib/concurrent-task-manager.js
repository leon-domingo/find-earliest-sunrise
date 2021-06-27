const { getTaskId, TASK_STATUS } = require('./utils');

async function _createAPromise(asyncFunc, params) {
  return new Promise((resolve, reject) => {
    asyncFunc(...params)
      .then(resData => resolve(resData))
      .catch(err => reject(err));
  });
}

function _getTasksByStatus(tasks, taskStatus) {
  return () => tasks.filter(({ status }) => status === taskStatus);
}
function ConcurrentTasksManager({
  maxConcurrentTasks,
  onStart = null,
  onEnd = null,
  onSuccessfulTask = null,
  onFailedTask = null,
  verbose = false,
}) {
  this.verbose = verbose;
  this.tasks = [];
  this.maxConcurrentTasks = maxConcurrentTasks;
  this.onStart = onStart && onStart.bind(this);
  this.onEnd = onEnd && onEnd.bind(this);
  this.onSuccessfulTask = onSuccessfulTask && onSuccessfulTask.bind(this);
  this.onFailedTask = onFailedTask && onFailedTask.bind(this);

  this.getWaitingTasks = _getTasksByStatus(this.tasks, TASK_STATUS.WAITING);
  this.getSelectedTasks = _getTasksByStatus(this.tasks, TASK_STATUS.SELECTED);
  this.getRunningTasks = _getTasksByStatus(this.tasks, TASK_STATUS.RUNNING);
  this.getFinishedTasks = _getTasksByStatus(this.tasks, TASK_STATUS.FINISHED);
  this.getSuccessfulTasks = () => this.getFinishedTasks().filter(successfulTask => !successfulTask.error);
  this.getFailedTasks = () => this.getFinishedTasks().filter(finishedTask => finishedTask.error);
}

ConcurrentTasksManager.prototype.consoleLog = function(...args) {
  this.verbose && console.log(...args);
};

ConcurrentTasksManager.prototype.addSingleTask = function(task) {
  this.tasks.push({
    id: task.id || getTaskId(),
    asyncFunc: task.asyncFunc,
    params: task.params,
    status: TASK_STATUS.WAITING,
    result: null,
    error: null,
    addedAt: new Date(),
    preparedAt: null,
    succeedAt: null,
    failedAt: null,
  });
};

ConcurrentTasksManager.prototype.addMultipleTasks = function(tasks) {
  for (let task of tasks) {
    task.asyncFunc && this.addSingleTask(task);
  }
};

ConcurrentTasksManager.prototype.prepareTask = function(selectedTask) {
  selectedTask.preparedAt = new Date();
  _createAPromise(selectedTask.asyncFunc, selectedTask.params)
    .then((result) => {
      selectedTask.status = TASK_STATUS.FINISHED;
      selectedTask.result = result;
      selectedTask.succeedAt = new Date();
      this.consoleLog(`[${selectedTask.id}] => ${JSON.stringify(result, null, 2)}`);
      this.onSuccessfulTask && this.onSuccessfulTask(selectedTask);
    })
    .catch(err => {
      this.consoleLog(`[${selectedTask.id}] failed - ${err}`);
      selectedTask.status = TASK_STATUS.FINISHED;
      selectedTask.error = err;
      selectedTask.failedAt = new Date();
      this.onFailedTask && this.onFailedTask(selectedTask);
    });
};

ConcurrentTasksManager.prototype.runTasks = function(runForever = false) {
  const showCurrentStatus = () => {
    const statusOutput = [
      `[Waiting = ${this.getWaitingTasks().length}]`,
      `[Selected (to be executed) = ${this.getSelectedTasks().length}]`,
      `[Running = ${this.getRunningTasks().length}]`,
      `[Finished = ${this.getFinishedTasks().length}]`,
      `[Successful = ${this.getSuccessfulTasks().length}]`,
      `[Failed = ${this.getFailedTasks().length}]`,
    ];
    this.consoleLog(statusOutput.join(' | '));
  };

  const startTime = Date.now();
  this.onStart && this.onStart(startTime);
  const pollingIntervalTime = 500;
  const pollingInterval = setInterval(() => {
    if (this.getFinishedTasks().length === this.tasks.length && !runForever) {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      this.consoleLog(`Elapsed time ${elapsedTime}ms`);
      clearInterval(pollingInterval);
      this.onEnd && this.onEnd(startTime, endTime);
      return;
    }

    showCurrentStatus();

    while (
      this.getWaitingTasks().length > 0 &&
      this.getSelectedTasks().length < this.maxConcurrentTasks
    ) {
      const waitingTask = this.getWaitingTasks()[0];
      if (waitingTask) {
        this.consoleLog(`Seleccting task ${waitingTask.id}...`);
        waitingTask.status = TASK_STATUS.SELECTED;
      }
    }

    const selectedTasks = this.getSelectedTasks();
    if (selectedTasks.length > 0 && this.getRunningTasks().length < this.maxConcurrentTasks) {
      for (let selectedTask of selectedTasks) {
        if (selectedTask.asyncFunc) {
          this.consoleLog(`Running task ${selectedTask.id}...`);
          selectedTask.status = TASK_STATUS.RUNNING;
          this.prepareTask(selectedTask);
        } else {
          selectedTask.status = TASK_STATUS.FINISHED;
          selectedTask.error = new Error('Missing "asyncFunc"');
          selectedTask.failedAt = new Date();
          this.onFailedTask && this.onFailedTask(selectedTask);
        }
      }
    }
  }, pollingIntervalTime);
};

module.exports = ConcurrentTasksManager;
