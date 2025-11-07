const Joi = require('joi');

// common fields for all logs
const baseCommon = {
  category: Joi.string().valid('Electricity','Natural Gas','Transportation','Other').required(),
  notes:    Joi.string().allow(''),
  date:     Joi.date().iso().required(),
  amount:   Joi.number().allow(null).optional(),
};

// transport-only fields
const transportFields = {
  transportMode: Joi.string().valid('car','bus','train','subway','rideshare','bike','walk','e-scooter','other').required(),
  transportDistance: Joi.number().required(),
  electricityCategory: Joi.forbidden(),
  electricityDuration: Joi.forbidden(),
};

// electricity-only fields
const electricityFields = {
  transportMode: Joi.forbidden(),
  transportDistance: Joi.forbidden(),
  electricityCategory: Joi.string().valid('light','device').required(),
  electricityDuration: Joi.number().min(0).required(),
};

// neither transport nor electricity (other categories)
const neitherFields = {
  transportMode: Joi.forbidden(),
  transportDistance: Joi.forbidden(),
  electricityCategory: Joi.forbidden(),
  electricityDuration: Joi.forbidden(),
};

// Build the conditional schema based on the category value
const createLogSchema = Joi.object(baseCommon)
  .when(Joi.object({ category: Joi.valid('Transportation') }).unknown(), {
    then: Joi.object(transportFields),
  })
  .when(Joi.object({ category: Joi.valid('Electricity') }).unknown(), {
    then: Joi.object(electricityFields),
  })
  .when(Joi.object({ category: Joi.valid('Natural Gas','Other') }).unknown(), {
    then: Joi.object(neitherFields),
  });

module.exports = { createLogSchema };
