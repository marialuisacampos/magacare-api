const { createWishList, updateWishList } = require('./wishlists-controller');
const { WishListSchemaController } = require('../validate/schema-controller');
const validator = require('../validate/validate');

module.exports = (app) => {
  const defaultRoute = '/wishlists';
  app.post(
    defaultRoute,
    validator.validateFields(WishListSchemaController),
    createWishList,
  );
  app.put(
    `${defaultRoute}/:id`,
    validator.validateFields(WishListSchemaController),
    updateWishList,
  );
};
