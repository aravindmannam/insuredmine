const User = require('../models/user');

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
          from: 'users', // Collection name (must be lowercase plural)
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