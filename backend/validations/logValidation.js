const Joi = require('joi');

const base = {
  category: Joi.string().valid('Electricity','Natural Gas','Transportation','Other').required(),
  notes:    Joi.string().allow(''),
  date:     Joi.date().iso().required(),

  amount:   Joi.number().allow(null).optional(),

  transportMode: Joi.string()
  .valid('car','bus','train','subway','rideshare','bike','walk','e-scooter','other')
  .allow(null),
  transportDistance: Joi.number().allow(null),
};

const createLogSchema = Joi.object(base).custom((value, helpers) => {
  if (value.category === 'Transportation') {
    if (!value.transportMode) return helpers.error('any.custom', { message: 'transportMode required for Transportation' });
    if (value.transportDistance === undefined || value.transportDistance === null) {
      return helpers.error('any.custom', { message: 'transportDistance required for Transportation' });
    }
  } else {
    if (value.transportMode != null || value.transportDistance != null) {
      return helpers.error('any.custom', { message: 'transport fields only allowed for Transportation' });
    }
  }
  return value;
}, 'transport conditional requirements');

module.exports = { createLogSchema };
