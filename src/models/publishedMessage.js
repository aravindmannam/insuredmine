const mongoose = require('mongoose');

const PublishedMessageSchema = new mongoose.Schema({
  message: String,
  publishedAt: { type: Date, default: Date.now },
});

const PublishedMessage = mongoose.model('PublishedMessage', PublishedMessageSchema);

module.exports=PublishedMessage;