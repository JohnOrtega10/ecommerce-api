//Models
const { Cart } = require('../models/cart.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Order } = require('../models/order.model');

//Utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');

exports.getUserCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const cart = await Cart.findOne({
    where: { status: 'active', userId: currentUser.id },
    include: [
      {
        model: Product,
        through: { where: { status: 'active' } }
      }
    ]
  });

  if (!cart) {
    return next(new AppError(404, 'This user does not have a cart yet'));
  }

  res.status(200).json({ status: 'success', data: { cart } });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { productId, quantity } = req.body;

  //Product Validations
  const product = await Product.findOne({
    where: { id: productId, status: 'active' }
  });

  if (!product) {
    return next(new AppError(404, 'Product not found with given id'));
  }

  if (quantity > product.quantity) {
    return next(
      new AppError(400, `This product only has ${product.quantity} items.`)
    );
  }

  //Cart validations
  const cart = await Cart.findOne({
    where: { userId: currentUser.id, status: 'active' }
  });

  if (!cart) {
    const newCart = await Cart.create({ userId: currentUser.id });

    await ProductInCart.create({ cartId: newCart.id, productId, quantity });
  } else {
    //Product in cart validations
    const productInCart = await ProductInCart.findOne({
      where: { cartId: cart.id, productId }
    });

    if (productInCart && productInCart.status === 'active') {
      return next(new AppError(400, 'This product is already in the cart'));
    }

    if (productInCart && productInCart.status === 'removed') {
      await productInCart.update({ status: 'active', quantity });
    }

    if (!productInCart) {
      await ProductInCart.create({ cartId: cart.id, productId, quantity });
    }
  }

  return res.status(201).json({ status: 'success' });
});

exports.updateProductCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { productId, newQty } = req.body;

  //Product validations
  const product = await Product.findOne({
    where: { id: productId, status: 'active' }
  });

  if (newQty > product.quantity) {
    return next(
      new AppError(400, `This product only has ${product.quantity} items.`)
    );
  }

  // Cart validations
  const cart = await Cart.findOne({
    where: { userId: currentUser.id, status: 'active' }
  });

  if (!cart) {
    return next(new AppError(404, 'This user does not have a cart yet'));
  }

  //Product in cart validations
  const productInCart = await ProductInCart.findOne({
    where: { status: 'active', cartId: cart.id, productId }
  });

  if (!productInCart) {
    return next(
      new AppError(404, `Can't update product, is not in the cart yet`)
    );
  }

  if (newQty === 0) {
    await productInCart.update({ quantity: 0, status: 'removed' });
  }

  if (newQty > 0) {
    await productInCart.update({ quantity: newQty });
  }

  res.status(204).json({ status: 'success' });
});

exports.deleteProductCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { productId } = req.params;

  const cart = await Cart.findOne({
    where: { userId: currentUser.id, status: 'active' }
  });

  if (!cart) {
    return next(new AppError(404, 'This user does not have a cart yet'));
  }

  const productInCart = await ProductInCart.findOne({
    where: { cartId: cart.id, productId }
  });

  if (!productInCart) {
    return next(new AppError(404, 'This product does not exist in this cart'));
  }

  await productInCart.update({ status: 'removed' });

  res.status(204).json({ status: 'success' });
});

exports.purchaseCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const cart = await Cart.findOne({
    where: { userId: currentUser.id, status: 'active' },
    include: [{ model: Product, through: { where: { status: 'active' } } }]
  });

  if (!cart) {
    return next(new AppError(404, 'This user does not have a cart yet'));
  }

  let totalPrice = 0;

  const cartPromises = cart.products.map(async (product) => {
    await product.productInCart.update({ status: 'purchased' });

    totalPrice += product.price * product.productInCart.quantity;

    return await product.update({
      quantity: product.quantity - product.productInCart.quantity
    });
  });

  await Promise.all(cartPromises);

  await cart.update({ status: 'purchased' });

  const newOrder = await Order.create({
    userId: currentUser.id,
    cartId: cart.id,
    issuedAt: Date.now().toLocaleString(),
    totalPrice
  });

  res.status(201).json({
    status: 'success',
    data: { newOrder }
  });
});
