const mongoose = require('mongoose');

const ScheduledMessageSchema=new mongoose.Schema({
  message: {type:String},
  scheduledTime: {type:Date},
  inserted: { type: Boolean, default: false }
});

const ScheduledMessage= mongoose.model('ScheduledMessage', ScheduledMessageSchema);

module.exports=ScheduledMessage;