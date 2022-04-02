const { body, validationResult } = require('express-validator');
const { AppError } = require('../util/appError');
const { catchAsync } = require('../util/catchAsync');

//User validations
exports.createUserValidations = [
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .notEmpty()
    .withMessage('Must provide a valid username'),
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .notEmpty()
    .withMessage('Must provide a valid email'),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .notEmpty()
    .withMessage('Must provide a valid password')
];

//Product Validations
exports.createProductValidations = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Must provide a valid title'),
  body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Must provide a valid description'),
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => value > 0)
    .withMessage('Quantity must be greater than 0'),
  body('price')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => value > 0)
    .withMessage('Quantity must be greater than 0')
];

//Cart Validations
exports.addProductToCartValidations = [
  body('productId')
    .isNumeric()
    .withMessage('Product id must be a number')
    .custom((value) => value > 0)
    .withMessage('Must provide a valid id'),
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => value > 0)
    .withMessage('Quantity must be greater than 0')
];

exports.validateResult = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMsg = errors
      .array()
      .map(({ msg }) => msg)
      .join('. ');

    return next(new AppError(400, errorMsg));
  }

  next();
});
