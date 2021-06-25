const { getTaskId, TASK_STATUS } = require('./utils');

function ConcurrentTasksManager({ maxConcurrentTasks }) {
  this.tasks = [];
  this.maxConcurrentTasks = maxConcurrentTasks;
}

async function _createAPromise(asyncFunc, params) {
  return new Promise((resolve, reject) => {
    asyncFunc(...params)
      .then(asyncData => resolve(asyncData))
      .catch(err => reject(err));
  });
}

ConcurrentTasksManager.prototype.addSingleTask = function(task) {
  this.tasks.push({
    id: task.id || getTaskId(),
    asynFunc: task.asyncFunc,
    params: task.params,
    result: null,
    status: TASK_STATUS.WAITING,
  });
};

ConcurrentTasksManager.prototype.addMultipleTasks = function(tasks) {
  for (let task of tasks) {
    task.asyncFunc && this.addSingleTask(task);
  }
};

ConcurrentTasksManager.prototype.prepareTask = function(selectedTask) {
  console.log('selectedTask.asynFunc =', selectedTask.asyncFunc);
  _createAPromise(selectedTask.asyncFunc, selectedTask.params)
    .then((result) => {
      selectedTask.status = TASK_STATUS.FINISHED;
      selectedTask.result = result;
    })
    .catch(err => {
      console.log(`${selectedTask.id} failed - ${err}`);
      selectedTask.status = TASK_STATUS.FINISHED;
      selectedTask.error = err;
    });
};

function _getTasksByStatus(tasks, taskStatus) {
  return () => tasks.filter(({ status }) => status === taskStatus);
}

ConcurrentTasksManager.prototype.runTasks = function(runForever = false) {
  const getWaitingTasks = _getTasksByStatus(this.tasks, TASK_STATUS.WAITING);
  const getSelectedTasks = _getTasksByStatus(this.tasks, TASK_STATUS.SELECTED);
  const getRunningTasks = _getTasksByStatus(this.tasks, TASK_STATUS.RUNNING);
  const getFinishedTasks = _getTasksByStatus(this.tasks, TASK_STATUS.FINISHED);

  const showCurrentStatus = () => {
    console.log(
      `[Waiting = ${getWaitingTasks().length}]`,
      '|',
      `[Selected (to be executed) = ${getSelectedTasks().length}]`,
      '|',
      `[Running = ${getRunningTasks().length}]`,
      '|',
      `[Finished = ${getFinishedTasks().length}]`,
    );
  };

  const startTime = Date.now();
  const pollingIntervalTime = 500;
  const pollingInterval = setInterval(() => {
    if (getFinishedTasks().length === this.tasks.length && !runForever) {
      const elapsedTime = Date.now() - startTime;
      console.log(`Elapsed time ${elapsedTime}ms`);
      clearInterval(pollingInterval);
      console.log('<EXIT>');
    }

    showCurrentStatus();

    if (getWaitingTasks().length > 0) {
      while (getSelectedTasks().length < this.maxConcurrentTasks) {
        // console.log('getWaitingTasks =', getWaitingTasks());
        // console.log('getSelectedTasks =', getSelectedTasks());
        const waitingTask = getWaitingTasks()[0];
        console.log(waitingTask);
        console.log(`Seleccting task ${waitingTask.id}...`);
        waitingTask.status = TASK_STATUS.SELECTED;
      }
    }

    const selectedTasks = getSelectedTasks();
    if (selectedTasks.length > 0 && getRunningTasks().length < this.maxConcurrentTasks) {
      for (let selectedTask of selectedTasks) {
        console.log(`Running task ${selectedTask.id}...`);
        selectedTask.status = TASK_STATUS.RUNNING;
        this.prepareTask(selectedTask);
      }
    }
  }, pollingIntervalTime);
  showCurrentStatus();
};

module.exports = ConcurrentTasksManager;
