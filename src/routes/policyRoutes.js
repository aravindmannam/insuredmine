const express = require('express');
const router = express.Router();

const { searchPolicyByUsername,aggregatePoliciesPerUser } = require('../controllers/policyController');


// GET /api/policy/search/:name
router.get('/search/:name', searchPolicyByUsername);

// GET /api/policy/policies/aggregate
router.get('/policies/aggregate', aggregatePoliciesPerUser);

module.exports = router;
