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

const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;

  cpus.forEach(cpu => {
    for (type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

async function checkCpuAndRestart() {
  try {
    const startUsage = getCpuUsage();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    const endUsage = getCpuUsage();

    const idleDifference = endUsage.idle - startUsage.idle;
    const totalDifference = endUsage.total - startUsage.total;
    const cpuUsagePercent = 100 - ((100 * idleDifference) / totalDifference);

    console.log(`CPU Usage: ${cpuUsagePercent.toFixed(2)}%`);

    if (cpuUsagePercent > 70) {
      console.log('CPU usage exceeds 70%. Restarting server...');
      await execPromise('pm2 restart all');
      console.log('Server restarted successfully.');
    }
  } catch (error) {
    console.error('Error in CPU monitoring or server restart:', error);
  }
}

// Run every 10 seconds
setInterval(checkCpuAndRestart, 10000);

// Initial check
checkCpuAndRestart();