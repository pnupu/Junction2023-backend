const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(cors()); // use cors middleware with default options, allowing all origins
app.use(bodyParser.json());

const dataFile = 'scores.json';

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/server.getpawlie.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/server.getpawlie.com/fullchain.pem')
};

console.log(options)
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


// Helper function to update high scores for a user
function updateHighScores(userScores, newScores) {
    const updatedScores = { ...userScores };
    Object.keys(newScores).forEach(game => {
      updatedScores[game] = Math.max(updatedScores[game] || 0, newScores[game]);
    });
    return updatedScores;
  }
  
  // Route to get the high scores
  app.get('/highscores', (req, res) => {
    const data = readData();
    const highScoresPerGame = data.users.map(u => {
      const totalScore = Object.values(u.highScores).reduce((acc, score) => acc + score, 0);
      return {
        username: u.username,
        highScores: u.highScores,
        totalScore: totalScore,
        localimageurl: u.localimageurl
      };
    }).filter(u => u.totalScore > 0); // Add a filter to exclude users with a total score of 0
  
    highScoresPerGame.sort((a, b) => b.totalScore - a.totalScore);
    res.json(highScoresPerGame);
  });
  
  
  // Route to create a user with initial high scores for each game
  app.post('/users', (req, res) => {
    const data = readData();
    const newUser = {
      id: uuidv4(),
      username: req.body.username,
      phoneNumber: req.body.phoneNumber,
      localimageurl: req.body.localimageurl,
      highScores: req.body.highScores || { game1: 0, game2: 0, game3: 0 }
    };
    data.users.push(newUser);
    writeData(data);
    res.status(201).send(newUser);
  });
  
  // Route to update a user's high score for a specific game
  app.put('/users/:id/score', (req, res) => {
    const data = readData();
    const user = data.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).send('User not found.');
    }
    user.highScores = updateHighScores(user.highScores, req.body.highScores);
    writeData(data);
    res.send(user);
  });
  
  app.get('/users/phone/:phoneNumber', (req, res) => {
    const data = readData();
    const user = data.users.find(u => u.phoneNumber === req.params.phoneNumber);
    if (!user) {
      return res.status(404).send('User not found.');
    }
    res.json(user);
  });


https.createServer(options, app).listen(443, () => {
    console.log('Express server listening on port 443');
});
