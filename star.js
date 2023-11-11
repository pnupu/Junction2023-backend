document.addEventListener('DOMContentLoaded', function() {
    // Your existing API call and other JavaScript code...
  
    // Function to generate stars based on the score
    function generateStars(score) {
      const maxScore = 548; // Assuming 548 is the top score for 3 stars
      const starRating = Math.ceil((score / maxScore) * 3);
      let stars = '';
      for (let i = 0; i < 3; i++) {
        stars += i < starRating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
      }
      return stars;
    }
  
    // Modify your existing data handling code to include the star generation:
    fetch('http://94.237.117.126:3000/highscores')
      .then(response => response.json())
      .then(data => {
        const highscoreList = document.getElementById('highscoreList');
        highscoreList.innerHTML = ''; // Clear existing entries
  
        data.forEach(player => {
          const entry = document.createElement('div');
          entry.className = 'highscore-entry';
          const stars = generateStars(player.highScore);
          entry.innerHTML = `
            <div class="username">${player.username}</div>
            <div class="stars">${stars}</div>
          `;
          highscoreList.appendChild(entry);
        });
      })
      .catch(error => {
        console.error('Error fetching high scores:', error);
      });
  });
  