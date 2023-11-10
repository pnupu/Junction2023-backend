const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const dataFile = 'scores.json';

// Helper function to read the data file
function readData() {
  const data = fs.readFileSync(dataFile);
  return JSON.parse(data);
}

// Helper function to write to the data file
function writeData(data) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(dataFile, jsonData);
}

// Route to get the high scores
app.get('/highscores', (req, res) => {
  const data = readData();
  data.users.sort((a, b) => b.highScore - a.highScore);
  res.json(data.users);
});

// Route to create a user
app.post('/users', (req, res) => {
  const data = readData();
  const newUser = {
    id: uuidv4(),
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    highScore: req.body.highScore
  };
  data.users.push(newUser);
  writeData(data);
  res.status(201).send(newUser);
});

// Route to update a user's high score
app.put('/users/:id/score', (req, res) => {
  const data = readData();
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).send('User not found.');
  }
  user.highScore = Math.max(user.highScore, req.body.highScore);
  writeData(data);
  res.send(user);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});