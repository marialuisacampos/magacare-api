const Products = require('./products-model');

const createProductOnDatabase = (product) => {
  const productCreated = Products(product);
  return productCreated.save();
};

const updateProductOnDatabase = async (code, product) => {
  const productUpdated = await Products.findOneAndUpdate(code, { $set: product }, { new: true });
  return productUpdated;
};

module.exports = {
  createProductOnDatabase,
  updateProductOnDatabase,
};
