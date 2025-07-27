const util = require('util');
//to run shell commands
const { exec } = require('child_process');

//custom function to check stats
const { getCpuUsage } = require('../utils/systemUtils');

const execPromise = util.promisify(exec);

// Function to check CPU usage and restart server if usage > 70%
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
// Start monitoring CPU at a fixed interval (default every 10 seconds)
function startCPUMonitor(interval = 10000) {
  checkCpuAndRestart(); // initial check
  setInterval(checkCpuAndRestart, interval);
}

module.exports = startCPUMonitor;
