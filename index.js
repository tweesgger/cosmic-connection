const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { User, PreviousEmployee } = require('./models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Cosmic Connection API!');
});

// Login route
app.post('/api/login', async (req, res) => {
  console.log('Login request received:', req.body);
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful');
    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
});

// Add a new user
app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, password, roles } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roles
    });
    res.json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
});

// Update user roles
app.put('/api/users/:id/roles', async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;
  
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.roles = roles;
    await user.save();
    res.json({ message: 'User roles updated successfully', user });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
});

// Remove user and archive
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await PreviousEmployee.create({
      email: user.email,
      roles: user.roles,
      removedAt: new Date()
    });

    await user.destroy();
    res.json({ message: 'User removed and archived successfully' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
});

// Get all previous employees
app.get('/api/previous-employees', async (req, res) => {
  try {
    const previousEmployees = await PreviousEmployee.findAll();
    res.json(previousEmployees);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
