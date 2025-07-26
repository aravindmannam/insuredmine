const express = require('express');
const router = express.Router();
const { getCpuUsage } = require('../utils/systemUtils');

router.get('/cpu-usage', async (req, res) => {
  const start = getCpuUsage();
  await new Promise(resolve => setTimeout(resolve, 1000));
  const end = getCpuUsage();

  const idleDiff = end.idle - start.idle;
  const totalDiff = end.total - start.total;
  const cpuUsage = 100 - ((100 * idleDiff) / totalDiff);

  res.json({ cpuUsage: `${cpuUsage.toFixed(2)}%` });
});

module.exports = router;
