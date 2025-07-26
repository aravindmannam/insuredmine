const express = require('express');
const multer = require('multer');
const path = require('path');
const { Worker } = require('worker_threads');
const User = require('../models/user');
const Policy = require('../models/policy');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, '../../uploads', req.file.filename);

  const worker = new Worker(path.resolve(__dirname, '../workers/fileProcessor.js'), {
    workerData: filePath,
  });

  worker.on('message', (message) => {
    res.status(200).json({ message: 'Data uploaded successfully', data: message });
  });

  worker.on('error', (error) => {
    res.status(500).json({ error: 'Error processing file', details: error.message });
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });
});

router.get('/search/:name', async (req, res) => {
  const user = await User.findOne({ firstName: req.params.name });
  if (!user) return res.status(404).send('User not found');
  const policies = await Policy.find({ userId: user._id })
  res.json(policies);
});

// Aggregate policies by user
router.get('/policies/aggregate', async (req, res) => {
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
});

module.exports = router;
