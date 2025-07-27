const User = require('../models/user');
const Policy= require('../models/policy');

// Search all policies linked to a user by their first name
exports.searchPolicyByUsername = async (req, res) => {
  try {
    const { name } = req.params;

    const user = await User.findOne({ firstName: name });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const policies = await Policy.find({ userId: user._id });

    res.status(200).json({ user: user.firstName, policies });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// Aggregate total number of policies per user and list all policies per user
exports.aggregatePoliciesPerUser = async (req, res) => {
  try {
    const aggregation = await Policy.aggregate([
      {
        $group: {
          _id: '$userId',
          policyCount: { $sum: 1 },
          policies: {
            $push: {
              policyNumber: '$policyNumber',
              startDate: '$policyStartDate',
              endDate: '$policyEndDate',
              categoryId: '$policyCategoryId',
              companyId: '$companyId'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userName: '$user.firstName',
          policyCount: 1,
          policies: 1
        }
      }
    ]);

    res.status(200).json(aggregation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};