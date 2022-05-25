const express = require('express');
const mongoose = require('mongoose');
const HealthRoute = require('./config/health');
const { connectionString } = require('./config/database');
const clientRoutes = require('./clients/clients-routes');
const clientRoutesNotAuth = require('./clients/client-routes-notauth');
const productRoutes = require('./products/products-routes');
const wishListRoutes = require('./wishlists/wishlists-routes');
const sessionRoute = require('./session/session-routes');
const authMiddleware = require('./auth');

const configRoutesNotProtected = (app) => {
  HealthRoute(app);
  sessionRoute(app);
  clientRoutesNotAuth(app);
};

const configRoutesProtected = (app) => {
  clientRoutes(app);
  productRoutes(app);
  wishListRoutes(app);
};

const configServer = (app) => {
  app.use(express.json());
  mongoose.connect(connectionString);
  configRoutesNotProtected(app);

  // REQUIRE A TOKEN FOR REQUEST
  app.use(authMiddleware);
  configRoutesProtected(app);
};

const createServer = () => {
  const app = express();
  configServer(app);
  return app;
};

const initServer = (app, port = 3000) => {
  app.listen(port);
  console.log(`Running! Port: ${port}`);
};

module.exports = {
  createServer,
  initServer,
  configServer,
  configRoutesNotProtected,
  configRoutesProtected,
};
