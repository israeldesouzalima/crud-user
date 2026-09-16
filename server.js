const express = require('express');
const path = require('path');
require("./instrument.js");

const Sentry = require("@sentry/node");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let nextId = 1;
const users = [];

const requiredFields = ['first_name', 'last_name', 'phone', 'email', 'password'];

function findUserIndexById(id) {
  return users.findIndex((user) => user.id === id);
}

function validateUserPayload(payload) {
  const missing = requiredFields.filter((field) => {
    const value = payload[field];
    return typeof value !== 'string' || value.trim() === '';
  });

  return missing;
}

app.get('/api/users', (_req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((item) => item.id === id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(user);
});

app.post('/api/users', (req, res) => {
  const missingFields = validateUserPayload(req.body);

  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Missing or invalid fields: ${missingFields.join(', ')}` });
  }

  const user = {
    id: nextId++,
    first_name: req.body.first_name.trim(),
    last_name: req.body.last_name.trim(),
    phone: req.body.phone.trim(),
    email: req.body.email.trim(),
    password: req.body.password.trim(),
  };

  users.push(user);
  return res.status(201).json(user);
});

app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const userIndex = findUserIndexById(id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const missingFields = validateUserPayload(req.body);

  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Missing or invalid fields: ${missingFields.join(', ')}` });
  }

  const updatedUser = {
    id,
    first_name: req.body.first_name.trim(),
    last_name: req.body.last_name.trim(),
    phone: req.body.phone.trim(),
    email: req.body.email.trim(),
    password: req.body.password.trim(),
  };

  users[userIndex] = updatedUser;
  return res.json(updatedUser);
});

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const userIndex = findUserIndexById(id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users.splice(userIndex, 1);
  return res.status(204).send();
});

Sentry.setupExpressErrorHandler(app);

app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
