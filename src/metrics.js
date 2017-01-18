'use strict';
var measured = require('measured');
var stats = measured.createCollection();
var gc = (require('gc-stats'))();
var eventLoopStats = require("event-loop-stats");
var memwatch = require('memwatch-next');
var schedule = require('node-schedule');
var usage = require('pidusage');
var metricsFactory = require('./factory');
var trackedMetrics = {};
var interval = 1000; // how often to refresh our measurement
var cpuUsage;
var gcLastRun;

var customMetrics = {};
var customMetersMetrics = new Set();
var endpointsLastResponseTime = {};

var CATEGORIES = {
  all: 'global.all',
  statuses: 'statuses',
  methods: 'methods',
  endpoints: 'endpoints'
};

var NAMESPACES = {
  process: 'process',
  internalMetrics: 'internalMetrics',
  apiMetrics: 'apiMetrics',
  endpoints: 'endpoints'
}

var cpuUsageScheduleJob;

module.exports.incrementCustomMetric = function (metricName) {
  let counter = addMetric(metricName, "Counter");
  counter.inc();
}

module.exports.decrementCustomMetric = function (metricName) {
  let counter = addMetric(metricName, "Counter");
  counter.dec();
}

module.exports.addCustomGaugeMetric = function (metricName, metricValue) {
  customMetrics[metricName] = metricValue;

  let gaugeFunction;
  if (typeof metricValue === 'function') {
    gaugeFunction = function () {
      return customMetrics[metricName]();
    }
  } else {
    gaugeFunction = function () {
      return customMetrics[metricName];
    }
  }

  addMetric(metricName, "Gauge", gaugeFunction);
}

module.exports.addCustomMeterMetric = function (metricName) {
  customMetersMetrics.add(metricName);
  let meter = addMetric(metricName, "Meter");
  meter.mark();
}

module.exports.getAll = function (reset) {
  var metricsAsJson = JSON.stringify(trackedMetrics);
  if (reset) {
    resetAll();
  }
  return metricsAsJson;
}

module.exports.processMetrics = function (reset) {
  var metricsAsJson = JSON.stringify(trackedMetrics[NAMESPACES.process]);
  if (reset)
    resetProcessMetrics();
  return metricsAsJson;
}

module.exports.apiMetrics = function (reset) {
  var metricsAsJson = JSON.stringify(trackedMetrics[NAMESPACES.apiMetrics]);
  if (reset)
    resetMetric(NAMESPACES.apiMetrics);
  return metricsAsJson;
}

module.exports.endPointMetrics = function (reset) {
  var metricsAsJson = JSON.stringify(trackedMetrics[NAMESPACES.endpoints]);
  if (reset) {
    resetMetric(NAMESPACES.endpoints);
  }
  return metricsAsJson;
}

module.exports.internalMetrics = function (reset) {
  var metricsAsJson = JSON.stringify(trackedMetrics[NAMESPACES.internalMetrics]);
  if (reset)
    resetMetric(NAMESPACES.internalMetrics);
  return metricsAsJson;
}

module.exports.logInternalMetric = function (info, err) {
  var status = "success";

  if (err) {
    status = "failure";
  }

  addInnerIO({
    destination: info.source,
    method: info.methodName,
    status: status,
    elapsedTime: Date.now() - info.startTime
  });
}

module.exports.addApiData = function (message) {
  var metricName = getMetricName(message.route, message.method);
  // var path = message.route ? message.route.path : undefined;

  updateMetric(NAMESPACES.apiMetrics + '.' + CATEGORIES.all, message.time);
  updateMetric(NAMESPACES.apiMetrics + '.' + CATEGORIES.statuses + '.' + message.status, message.time);
  updateMetric(NAMESPACES.apiMetrics + '.' + CATEGORIES.methods + '.' + message.method, message.time);
  updateMetric(NAMESPACES.apiMetrics + '.' + CATEGORIES.endpoints + '.' + metricName, message.time);
  updateMetric(NAMESPACES.endpoints + '.' + metricName + '.' + message.status, message.time);
  endpointsLastResponseTime[metricName] = message.time;
  addMetric(NAMESPACES.endpoints + '.' + metricName + '.lastResponseTime', "Gauge", apiMetric(metricName));
}

function apiMetric(metricName) {
  return function () {
    return endpointsLastResponseTime[metricName];
  }
}

function getMetricName(route, methodName) {
  return route + '|' + methodName.toLowerCase();
};

function addInnerIO(message) {
  updateMetric(NAMESPACES.internalMetrics + '.' + message.destination + '.' + CATEGORIES.all, message.elapsedTime);
  updateMetric(NAMESPACES.internalMetrics + '.' + message.destination + '.' + CATEGORIES.statuses + '.' + message.status, message.elapsedTime);
  updateMetric(NAMESPACES.internalMetrics + '.' + message.destination + '.' + CATEGORIES.methods + '.' + message.method, message.elapsedTime)
}

function _evtparse(eventName) {
  var namespaces = eventName.split('.');

  var name1;
  var levels = namespaces.length;
  var name = namespaces.pop(),
    category = namespaces.pop(),
    namespace = namespaces.pop();

  if (levels == 4) {
    name1 = name;
    name = category;
    category = namespace;
    namespace = namespaces.pop();
  }

  return {
    ns: namespace,
    name: name,
    name1: name1,
    category: category
  }
}

function addMetric(eventName, metricType, func) {
  var parts = _evtparse(eventName);
  var metricsPath;

  if (!trackedMetrics[parts.ns]) {
    trackedMetrics[parts.ns] = {};
  }
  if (!trackedMetrics[parts.ns][parts.category]) {
    trackedMetrics[parts.ns][parts.category] = {};
  }
  if (!trackedMetrics[parts.ns][parts.category][parts.name]) {
    if (parts.name1) {
      trackedMetrics[parts.ns][parts.category][parts.name] = {}
    }
    else {
      trackedMetrics[parts.ns][parts.category][parts.name] = metricsFactory.createMetric(metricType, func);
    }
  }

  if ((parts.name1) && (!trackedMetrics[parts.ns][parts.category][parts.name][parts.name1])) {
    trackedMetrics[parts.ns][parts.category][parts.name][parts.name1] = metricsFactory.createMetric(metricType, func);
  }

  if (parts.name1) {
    return trackedMetrics[parts.ns][parts.category][parts.name][parts.name1];
  }
  else {
    return trackedMetrics[parts.ns][parts.category][parts.name];
  }
}

function updateMetric(name, elapsedTime) {
  var metric = addMetric(name, "Timer");
  metric.update(elapsedTime);
}

function addProcessMetrics() {
  memwatch.on('leak', function (info) {
    trackedMetrics[NAMESPACES.process]["memory"]["leak"] = info;
  });

  gc.on('stats', function (stats) {
    gcLastRun = new Date().getTime();
    updateMetric(NAMESPACES.process + ".gc.time", stats.pauseMS);
    //in bytes
    updateMetric(NAMESPACES.process + ".gc.releasedMem", stats.diff.usedHeapSize);

    addMetric(NAMESPACES.process + ".gc.lastRun", "Gauge", gcLastRunMetric);
  });

  addMetric(NAMESPACES.process + ".cpu.usage", "Gauge", cpuUsageMetric)

  addMetric(NAMESPACES.process + ".memory.usage", "Gauge", memoryUsageMetric);

  addMetric(NAMESPACES.process + ".eventLoop.latency", "Gauge", eventLoopLatencyMetric);

  addMetric(NAMESPACES.process + ".run.uptime", "Gauge", processUpTimeMetric);

  setCpuUsageScheduleJob();
}

function processUpTimeMetric() {
  //in ms
  return process.uptime() * 1000;
}

function eventLoopLatencyMetric() {
  return eventLoopStats.sense();
}

function memoryUsageMetric() {
  //in bytes
  return process.memoryUsage();
}

function cpuUsageMetric() {
  return cpuUsage;
}

function gcLastRunMetric() {
  return gcLastRun;
}

function setCpuUsageScheduleJob() {
  if (cpuUsageScheduleJob) {
    cpuUsageScheduleJob.cancel();
  }
  cpuUsageScheduleJob = schedule.scheduleJob('*/1 * * * *', function () {
    var pid = process.pid;
    usage.stat(pid, function (err, result) {
      cpuUsage = result.cpu;
    });
  });
}

function resetAll() {
  resetProcessMetrics();
  resetMetric(NAMESPACES.apiMetrics);
  resetMetric(NAMESPACES.internalMetrics);
  resetMetric(NAMESPACES.endpoints);
  resetCustomMetrics();
  resetCustomMetersMetrics();

}

function resetCustomMetrics() {
  for (var customMetricName in customMetrics) {
    if (customMetrics.hasOwnProperty(customMetricName)) {
      let customNamespace = customMetricName.substring(0, customMetricName.indexOf("."));
      resetMetric(customNamespace);
    }
  }
  customMetrics = {};
}

function resetCustomMetersMetrics() {
  for (var customMetricName of customMetersMetrics) {
    var metric = addMetric(customMetricName);
    let customNamespace = customMetricName.substring(0, customMetricName.indexOf("."));
    resetMetric(customNamespace);
  }
}

function resetProcessMetrics() {
  memwatch.removeAllListeners('leak');
  gc.removeAllListeners('stats');
  resetMetric(NAMESPACES.process);
  addProcessMetrics();
}

function resetMetric(namespaceToReset) {
  delete trackedMetrics[namespaceToReset];
}

addProcessMetrics();