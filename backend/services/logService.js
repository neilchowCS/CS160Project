const Log = require('../models/Log');

async function createLog(userId, body) {
  const doc = await Log.create({ userId, ...body });
  return [201, doc];
}

async function listLogs(userId) {
  const rows = await Log.find({ userId }).sort({ date: -1 });
  return [200, rows];
}

async function updateLog(userId, id, patch) {
  const doc = await Log.findOneAndUpdate({ _id: id, userId }, patch, { new: true });
  if (!doc) return [404, { error: 'Not found' }];
  return [200, doc];
}

async function deleteLog(userId, id) {
  const out = await Log.deleteOne({ _id: id, userId });
  if (!out.deletedCount) return [404, { error: 'Not found' }];
  return [204, null];
}

module.exports = { createLog, listLogs, updateLog, deleteLog };
