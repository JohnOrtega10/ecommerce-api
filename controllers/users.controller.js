const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Models
const { User } = require('../models/user.model');
const { Order } = require('../models/order.model');
const { Product } = require('../models/product.model');
const { Cart } = require('../models/cart.model');

//Utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');
const { filterObj } = require('../util/filterObj');

exports.createUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword
  });

  newUser.password = undefined;

  res.status(200).json({
    status: 'success',
    data: { newUser }
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email, status: 'active' } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError(400, 'Credencials are invalid'));
  }

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(200).json({
    status: 'success',
    data: { token }
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { id } = req.currentUser;

  const products = await Product.findAll({
    where: { userId: id }
  });

  res.status(200).json({
    status: 'success',
    data: { products }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const data = filterObj(req.body, 'username', 'email');

  const { user } = req;

  await user.update({ ...data });

  res.status(204).json({ status: 'success' });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'delected' });

  res.status(204).json({ status: 'success' });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { id } = req.currentUser;

  const orders = await Order.findAll({
    where: { userId: id },
    include: [
      {
        model: Cart,
        include: [
          { model: Product, through: { where: { status: 'purchased' } } }
        ]
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: { orders }
  });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOne({
    where: { id },
    include: [
      {
        model: Cart,
        include: [
          { model: Product, through: { where: { status: 'purchased' } } }
        ]
      }
    ]
  });

  if (!order) {
    return next(new AppError(404, 'Order not found with given id'));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});
