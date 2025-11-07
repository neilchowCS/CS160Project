const Log = require('../models/Log');

function transportationFootprintCalc(mode, distance) {
  // emission factors in kg CO2e per mile
  const CAR = 0.21;
  const RIDESHARE = 0.29;
  const BUS = 0.12;
  const TRAIN = 0.08;
  const SUBWAY = 0.10;
  const ESCOOTER = 0.02;

  if (!mode || distance == null) return 0;
  const dist = Number(distance);
  if (Number.isNaN(dist) || dist <= 0) return 0;

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

function electricityFootprintCalc(mode, hours) {
  // emission factors in kg CO2e per hour
  const LIGHT = 0.02;
  const DEVICE = 0.05;

  if (!mode || hours == null) return 0;
  const hrs = Number(hours);
  if (Number.isNaN(hrs) || hrs <= 0 ) return 0;
  let factor;
  switch (mode) {
    case 'device':
      factor = DEVICE;
      break;
    case 'light':
      factor = LIGHT;
      break;
  }
  return factor * hrs;
}

async function createLog(userId, body) {
  const { category } = body;
  const docBody = { userId, ...body };
  let footprint = 0
  if (category === 'Transportation') {
    const { transportMode, transportDistance } = body;
    footprint = transportationFootprintCalc(transportMode, transportDistance);
    docBody.amount = footprint;
  }
  else if (category === 'Electricity') {
    const { electricityCategory, electricityDuration } = body;
    footprint = electricityFootprintCalc(electricityCategory, electricityDuration);
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
