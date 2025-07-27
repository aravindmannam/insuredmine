// Import the ScheduledMessage Mongoose model
const ScheduledMessage = require('../models/scheduledMessage');
// Import the node-cron package to schedule jobs
const cron = require('node-cron');

exports.scheduleMessage = async (req, res) => {
  try {
    const { message, day, time } = req.body;

    if (!message || !day || !time) {
      return res.status(400).json({ error: 'Message, day, and time are required' });
    }
     // List of valid days to check and convert into cron-compatible format
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return res.status(400).json({ error: 'Invalid day' });
    // Parse and validate time in HH:MM format
    const [hours, minutes] = time.split(':').map(Number);
    if (
      isNaN(hours) || isNaN(minutes) ||
      hours < 0 || hours > 23 || minutes < 0 || minutes > 59
    ) {
      return res.status(400).json({ error: 'Invalid time format (use HH:MM)' });
    }

    // Calculate the next scheduled date and time
    const now = new Date();
    const scheduledDate = new Date();

    // Set the date to the correct day of the week
    scheduledDate.setDate(now.getDate() + ((dayIndex + 7 - now.getDay()) % 7));
    scheduledDate.setHours(hours, minutes, 0, 0);

    // If the scheduled time is in the past, shift to the following week's day
    if (scheduledDate <= now) scheduledDate.setDate(scheduledDate.getDate() + 7);

    // Save the scheduled message to the database
    const newMessage = new ScheduledMessage({ message, scheduledTime: scheduledDate });
    await newMessage.save();

    // Build cron expression
    const cronTime = `${minutes} ${hours} * * ${dayIndex}`;

    // Schedule the cron job
    cron.schedule(cronTime, async () => {
    // Update only if message has not been previously inserted
      const updated = await ScheduledMessage.updateOne(
        { _id: newMessage._id, inserted: false },
        { $set: { inserted: true } }
      );

       // Log if the message was marked as inserted
      if (updated.modifiedCount) {
        console.log(`Message inserted: "${message}" at ${new Date()}`);
      }
    });

    res.status(200).json({ message: 'Message scheduled', scheduledTime: scheduledDate });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
