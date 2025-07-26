const schedule = require('node-schedule');
const ScheduledMessage = require('./models/scheduledMessage');
const PublishedMessage = require('./models/publishedMessage');

module.exports = () => {
  schedule.scheduleJob('* * * * *', async () => {
    const now = new Date();
    const messages = await ScheduledMessage.find({ scheduleAt: { $lte: now } });
    for (let msg of messages) {
      await PublishedMessage.create({ message: msg.message });
      await ScheduledMessage.findByIdAndDelete(msg._id);
    }
  });
};