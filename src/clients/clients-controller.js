const bcryptpjs = require('bcryptjs');
const {
  verifyExistsClients,
  createClientOnDatabase,
  updateClientOnDatabase,
  searchOneClientByIdOnDatabase,
  searchOneClientByEmailonDatabase,
  searchAllClientsOnDatabase,
  searchClientsByFilterOnDatabase,
  deleteClientOnDatabase,
  searchWishlistByClientOnDatabase,
  deletehWishlistByClientOnDatabase,
} = require('./clients-service');

const checkPassword = require('../utils/checkPassword');

const createClient = async (req, res) => {
  try {
    const client = req.body;
    const { email, cpf, password } = client;

    const verifyEmailExists = await verifyExistsClients({ email });
    const verifyCpfExists = await verifyExistsClients({ cpf });

    if(verifyEmailExists) {
      return res.status(400).json({
        message: 'This email is already in use',
      });
    }

    if(verifyCpfExists) {
      return res.status(400).json({
        message: 'This cpf is already in use',
      });
    }

    const hashPassword = await bcryptpjs.hash(password, 8);

    const clientWithEncryptedPassword = {
      ...client,
      password: hashPassword,
    };

    createClientOnDatabase(clientWithEncryptedPassword);

    return res.status(201).json({
      message: 'Client registered',
    });
  } catch(error) {
    return res.status(500).json(error.message);
  }
};

const searchOneClientById = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await searchOneClientByIdOnDatabase(id);
    return res.status(200).json(client);
  } catch(error) {
    return res.status(500).json({ message: 'No client found.' });
  }
};

const searchOneClientByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const client = await searchOneClientByEmailonDatabase(email);
    if(client) {
      return res.status(200).json(client);
    } return res.status(400).json({ message: 'No client found.' });
  } catch(error) {
    return res.status(404).json({ message: 'Error finding client.' });
  }
};

const searchClientsByFilter = async (req, res) => {
  try {
    const {
      searchBy, filter, page = 1, limit = 5,
    } = req.query;
    const clients = await searchClientsByFilterOnDatabase(searchBy, filter, page, limit);
    if(clients.length !== 0) {
      return res.status(200).json(clients);
    } return res.status(400).json({ message: 'No client found.' });
  } catch(error) {
    return res.status(404).json({ message: 'Error finding client.' });
  }
};

const searchWishlistByClient = async (req, res) => {
  try {
    const { id } = req.params;
    const wishlists = await searchWishlistByClientOnDatabase(id);
    return res.status(200).json({
      message: 'This client has this wishlists ids:',
      wishlists,
    });
  } catch(error) {
    return res.status(404).json({ message: 'Error finding client.' });
  }
};

const searchAllClients = async (req, res) => {
  try {
    const clients = await searchAllClientsOnDatabase();
    return res.status(200).json(clients);
  } catch(error) {
    return res.status(404).json({ message: 'Error finding clients.' });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = req.body;

    const {
      email, cpf, password, confirmPassword, oldPassword,
    } = client;

    const verifyIdExists = await verifyExistsClients({ _id: id });
    const verifyEmailExists = await verifyExistsClients({ email });
    const verifyCpfExists = await verifyExistsClients({ cpf });

    if(verifyEmailExists) {
      return res.status(400).json({
        message: 'This email is already in use',
      });
    }

    if(verifyCpfExists) {
      return res.status(400).json({
        message: 'This cpf is already in use',
      });
    }

    const clientRegistered = verifyIdExists;

    if(clientRegistered) {
      if((!(oldPassword && confirmPassword) && password)) {
        return res
          .status(401)
          .json({ error: '"oldPassword" and "confirmPassword" are required to update password' });
      }

      if(oldPassword && !(await checkPassword(oldPassword, clientRegistered.password))) {
        return res
          .status(401)
          .json({ error: 'This password does not match' });
      }

      if(confirmPassword !== password) {
        return res
          .status(401)
          .json({ error: 'The password and the confirmation password do not match' });
      }

      const hashPassword = oldPassword && confirmPassword && password
        ? await bcryptpjs.hash(confirmPassword, 8)
        : clientRegistered.password;

      const newClient = {
        ...client,
        password: hashPassword,
      };

      const clientUpdated = await updateClientOnDatabase(id, newClient);
      return res.status(200).json({
        message: 'Client updated',
        client: clientUpdated,
      });
    }

    return res.status(404).json({
      message: 'Please, return a valid id',
    });
  } catch(error) {
    return res.status(404).json(error.message);
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const verifyClientExists = await verifyExistsClients({ _id: id });

    const wishlists = await searchWishlistByClientOnDatabase(id);

    if(!verifyClientExists) {
      return res.status(400).json({
        message: 'This client does not exist in the database',
      });
    }

    if(wishlists.length === 0) {
      const clientDeleted = await deleteClientOnDatabase({ _id: id });
      return res.status(200).json({
        message: 'Client deleted',
        client: clientDeleted,
      });
    }
    const wishlistDeleted = await deletehWishlistByClientOnDatabase({ _id: id });
    const clientWithWishlistDeleted = await deleteClientOnDatabase({ _id: id });
    return res.status(200).json({
      message: 'Client and wishlists have been deleted',
      client: [clientWithWishlistDeleted, wishlistDeleted],
    });
  } catch(error) {
    return res.status(404).json(error.message);
  }
};

module.exports = {
  createClient,
  updateClient,
  searchOneClientById,
  searchOneClientByEmail,
  searchAllClients,
  searchClientsByFilter,
  deleteClient,
  searchWishlistByClient,
};
