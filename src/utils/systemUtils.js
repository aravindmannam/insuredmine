const os = require('os');

// Function to get average CPU idle and total time across all cores
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  // Return average idle and total CPU time across all cores
  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length
  };
}

module.exports = {
  getCpuUsage
};
