const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, '../../uploads', req.file.filename);

  // Spawn worker thread
  const worker = new Worker(path.resolve(__dirname, '../workers/fileProcessor.js'), {
    workerData: filePath,
  });

  // Handle messages from worker
  worker.on('message', (message) => {
    if (message.error) {
      return res.status(500).json({ error: message.error });
    }
    res.status(200).json({ message: 'File processed successfully', details: message });
  });

  // Handle errors from worker
  worker.on('error', (error) => {
    res.status(500).json({ error: 'Error processing file', details: error.message });
  });

  // Handle unexpected exit
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker exited with code ${code}`);
    }
  });
};
