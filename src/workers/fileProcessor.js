const { workerData, parentPort } = require('worker_threads');
const fs = require('fs');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');

require('../models/agent');
require('../models/user');
require('../models/userAccount');
require('../models/lob');
require('../models/Carrier');
require('../models/Policy');

const Agent = mongoose.model('Agent');
const User = mongoose.model('User');
const UserAccount = mongoose.model('UserAccount');
const LOB = mongoose.model('LOB');
const Carrier = mongoose.model('Carrier');
const Policy = mongoose.model('Policy');
// Replace with your actual MongoDB connection URI
const mongoURI = process.env.URI;

mongoose.connect(mongoURI).then(() => {
  console.log('Worker thread MongoDB connected');
  processFile(workerData)
    .then(() => mongoose.disconnect())
    .catch((error) => {
      parentPort.postMessage({ error: error.message });
      mongoose.disconnect();
    });
}).catch((error) => {
  parentPort.postMessage({ error: 'MongoDB connection failed: ' + error.message });
});

async function processFile(filePath) {
  const ext = path.extname(filePath);
  const data = [];

  try {
    if (ext === '.xlsx') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      data.push(...jsonData);
    } else if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => data.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
    }

    let inserted = 0;

    for (const row of data) {
      const agent = await Agent.create({
         agentName: row.agent
      }
      );

      const userAccount = await UserAccount.create({
        accountName: row.account_name
      }
      );

      const lob = await LOB.create(
        { category_name: row.category_name }
      );

      const carrier = await Carrier.create(
        { company_name: row.company_name }      
      );

      const user = await User.create(
        { email: row.email ,
          firstName: row.firstname,
          dob: row.dob,
          address: row.address,
          phone: row.phone,
          state: row.state,
          zip: row.zip,
          gender: row.gender,
          userType: row.userType,
        }
      );

      await Policy.create({
        policyNumber: row.policy_number,
        startDate: row.policy_start_date,
        endDate: row.policy_end_date,
        policy_type: row.policy_type,
        policy_mode: row.policy_mode,
        premium_amount: row.premium_amount,
        premium_amount_written: row.premium_amount_written,
        csr: row.csr,
        producer: row.producer,
        account_type: row.account_type,
        phone: row.phone,
        primary: row.primary,
        userId: user._id,                 
        policyCategoryId: lob._id,      
        companyId: carrier._id,
        userAccount: userAccount._id,
        
        agent: agent._id,
      });

      inserted++;
    }

    parentPort.postMessage({ success: true, inserted });
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
}

