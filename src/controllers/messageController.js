const ScheduledMessage = require('../models/scheduledMessage');
const cron = require('node-cron');

exports.scheduleMessage = async (req, res) => {
  try {
    const { message, day, time } = req.body;

    if (!message || !day || !time) {
      return res.status(400).json({ error: 'Message, day, and time are required' });
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return res.status(400).json({ error: 'Invalid day' });

    const [hours, minutes] = time.split(':').map(Number);
    if (
      isNaN(hours) || isNaN(minutes) ||
      hours < 0 || hours > 23 || minutes < 0 || minutes > 59
    ) {
      return res.status(400).json({ error: 'Invalid time format (use HH:MM)' });
    }

    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setDate(now.getDate() + ((dayIndex + 7 - now.getDay()) % 7));
    scheduledDate.setHours(hours, minutes, 0, 0);
    if (scheduledDate <= now) scheduledDate.setDate(scheduledDate.getDate() + 7);

    const newMessage = new ScheduledMessage({ message, scheduledTime: scheduledDate });
    await newMessage.save();

    const cronTime = `${minutes} ${hours} * * ${dayIndex}`;
    cron.schedule(cronTime, async () => {
      const updated = await ScheduledMessage.updateOne(
        { _id: newMessage._id, inserted: false },
        { $set: { inserted: true } }
      );
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
