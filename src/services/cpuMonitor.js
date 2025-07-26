/**const os = require('os-utils');
const { exec } = require('child_process');

module.exports = function monitorCPU() {
  setInterval(() => {
    os.cpuUsage(function(v) {
      console.log('CPU Usage (%): ' + v * 100);
      if (v > 0.7) {
        console.log('High CPU detected, restarting...');
        exec('pm2 restart all');
      }
    });
  }, 10000);
};*/

const util = require('util');
const { exec } = require('child_process');
const { getCpuUsage } = require('../utils/systemUtils');

const execPromise = util.promisify(exec);

async function checkCpuAndRestart() {
  try {
    const startUsage = getCpuUsage();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const endUsage = getCpuUsage();

    const idleDiff = endUsage.idle - startUsage.idle;
    const totalDiff = endUsage.total - startUsage.total;
    const cpuUsage = 100 - ((100 * idleDiff) / totalDiff);

    console.log(`CPU Usage: ${cpuUsage.toFixed(2)}%`);

    if (cpuUsage > 70) {
      console.log('CPU exceeds 70%, restarting...');
      await execPromise('pm2 restart all');
      console.log('Server restarted.');
    }
  } catch (error) {
    console.error('Error in CPU monitor:', error);
  }
}

function startCPUMonitor(interval = 10000) {
  checkCpuAndRestart(); // initial check
  setInterval(checkCpuAndRestart, interval);
}

module.exports = startCPUMonitor;
