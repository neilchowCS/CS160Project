const Log = require('../models/Log');

function footprintCalc(mode, distance) {
  // emission factors in kg CO2e per mile (example values)
  const CAR = 0.21;
  const RIDESHARE = 0.29;
  const BUS = 0.12;
  const TRAIN = 0.08;
  const SUBWAY = 0.10;
  const ESCOOTER = 0.02;

  if (!mode || distance == null) return 0;
  const dist = Number(distance);
  if (Number.isNaN(dist) || dist < 0) return 0;

  let factor;
  switch (mode) {
    case 'car':
      factor = CAR;
      break;
    case 'rideshare':
      factor = RIDESHARE;
      break;
    case 'bus':
      factor = BUS;
      break;
    case 'train':
      factor = TRAIN;
      break;
    case 'subway':
      factor = SUBWAY;
      break;
    case 'bike':
    case 'walk':
      factor = 0;
      break;
    case 'e-scooter':
      factor = ESCOOTER;
      break;
  }

  return factor * dist;
}

async function createLog(userId, body) {
  const { category } = body;
  const docBody = { userId, ...body };
  let footprint = 0
  if (category === 'Transportation') {
    const { transportMode, transportDistance } = body;
    footprint = footprintCalc(transportMode, transportDistance);
    docBody.amount = footprint;
  }
  const doc = await Log.create(docBody);
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
