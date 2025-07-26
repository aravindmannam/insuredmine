// Import individual route modules
const express = require('express');
const router = express.Router();
const uploadRoutes = require('./uploadRoutes');
const policyRoutes = require('./policyRoutes');
const cpuRoutes = require('./cpuRoutes');
const messageRoutes = require('./messageRoutes');

// Mount all routes with their base paths
router.use('/upload', uploadRoutes);
router.use('/policy', policyRoutes);
router.use('/cpu', cpuRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
