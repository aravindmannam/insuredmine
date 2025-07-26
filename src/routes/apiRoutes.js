const express = require('express');
const multer = require('multer');
const path = require('path');
const { Worker } = require('worker_threads');
const User = require('../models/user');
const ScheduledMessage = require('../models/scheduledMessage');
const router = express.Router();
const cron = require('node-cron');
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

router.post('/', async (req, res) => {
  const { message, day, time } = req.body;
  const scheduleAt = new Date(`${day}T${time}:00`);
  await ScheduledMessage.create({ message, scheduleAt });
  res.send('Message scheduled');
});

router.post('/schedule-message', async (req, res) => {
  try {
    const { message, day, time } = req.body;

    if (!message || !day || !time) {
      return res.status(400).json({ error: 'Message, day, and time are required' });
    }

    // Parse day (e.g., "Monday") and time (e.g., "14:30")
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) {
      return res.status(400).json({ error: 'Invalid day' });
    }

    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return res.status(400).json({ error: 'Invalid time format (use HH:MM)' });
    }

    // Calculate next occurrence of the specified day and time
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setDate(now.getDate() + ((dayIndex + 7 - now.getDay()) % 7));
    scheduledDate.setHours(hours, minutes, 0, 0);

    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 7); // Schedule for next week if time has passed
    }

    const newMessage = new ScheduledMessage({
      message,
      scheduledTime: scheduledDate
    });
    await newMessage.save();

    // Schedule the insertion task
    const cronTime = `${minutes} ${hours} * * ${dayIndex}`;
    cron.schedule(cronTime, async () => {
      try {
        await Message.updateOne(
          { _id: newMessage._id, inserted: false },
          { $set: { inserted: true } }
        );
        console.log(`Message "${message}" inserted into DB at ${scheduledDate}`);
      } catch (error) {
        console.error('Error inserting message:', error);
      }
    });

    res.status(200).json({ message: 'Message scheduled successfully', scheduledTime: scheduledDate });
  } catch (error) {
    console.error('Error scheduling message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;
