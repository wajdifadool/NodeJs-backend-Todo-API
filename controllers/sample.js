const asyncHandler = require('../middleware/async');

exports.getSample = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Sample endpoint working!' });
});
