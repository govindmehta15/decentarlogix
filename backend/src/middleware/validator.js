import Joi from 'joi';

/**
 * Validation middleware
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    req.body = value;
    next();
  };
}

// Validation schemas
export const schemas = {
  createTrip: Joi.object({
    carrier: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    receiver: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    originLocation: Joi.string().required(),
    destinationLocation: Joi.string().required(),
    distance: Joi.number().integer().positive().required(),
    estimatedCarbonFootprint: Joi.number().integer().positive().required(),
    ipfsMetadataHash: Joi.string().allow('').optional(),
  }),

  endTrip: Joi.object({
    tripId: Joi.string().required(),
    actualCarbonFootprint: Joi.number().integer().positive().required(),
    ipfsProofHash: Joi.string().allow('').optional(),
  }),

  releasePayment: Joi.object({
    escrowId: Joi.string().required(),
    amount: Joi.string().required(),
    reason: Joi.string().allow('').optional(),
  }),
};

