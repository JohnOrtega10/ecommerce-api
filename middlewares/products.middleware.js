//Models
const { Product } = require('../models/product.model');
const { User } = require('../models/user.model');

//Utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');

exports.productExits = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({
    where: { id, status: 'active' },
    include: [{ model: User, attributes: { exclude: ['password'] } }]
  });

  if (!product) {
    return next(new AppError(404, 'Product not found with given id'));
  }

  req.product = product;

  next();
});

exports.protectProductOwner = catchAsync(async (req, res, next) => {
  const { currentUser, product } = req;

  if (currentUser.id !== product.userId) {
    return next(new AppError(403, 'You cant update other products'));
  }

  next();
});
