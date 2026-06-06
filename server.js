const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Sign up a new user
app.post('/api/auth/signup', (req, res) => {
  const { username, password, name, avatar } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required' });
  }

  // Check if username already exists
  db.get("SELECT id FROM users WHERE username = ?", [username.toLowerCase()], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const defaultAvatar = avatar || `https://i.pravatar.cc/150?u=${username}`;
    
    const sql = `INSERT INTO users (username, password, name, avatar, skillsOffered, skillsSought, hobbies, about, rating, score) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      username.toLowerCase(),
      hashedPassword,
      name,
      defaultAvatar,
      "", // skillsOffered
      "", // skillsSought
      "", // hobbies
      "New member of the Synapse community!", // about
      "Bronze", // rating
      5.0 // score
    ];

    db.run(sql, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        id: this.lastID,
        username: username.toLowerCase(),
        name,
        avatar: defaultAvatar,
        skillsOffered: [],
        skillsSought: [],
        hobbies: [],
        about: "New member of the Synapse community!",
        rating: "Bronze",
        score: 5.0
      });
    });
  });
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username.toLowerCase()], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatch = bcrypt.compareSync(password, row.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({
      id: row.id,
      username: row.username,
      name: row.name,
      avatar: row.avatar,
      skillsOffered: row.skillsOffered ? row.skillsOffered.split(',') : [],
      skillsSought: row.skillsSought ? row.skillsSought.split(',') : [],
      hobbies: row.hobbies ? row.hobbies.split(',') : [],
      about: row.about,
      rating: row.rating,
      score: row.score
    });
  });
});

// Update user skills (onboarding)
app.put('/api/users/:id/skills', (req, res) => {
  const { skillsOffered, skillsSought } = req.body;
  const offeredStr = Array.isArray(skillsOffered) ? skillsOffered.join(',') : '';
  const soughtStr = Array.isArray(skillsSought) ? skillsSought.join(',') : '';

  const sql = "UPDATE users SET skillsOffered = ?, skillsSought = ? WHERE id = ?";
  db.run(sql, [offeredStr, soughtStr, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Skills updated successfully' });
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parse the comma-separated strings back into arrays for the frontend
    // Never send the password hash to the frontend
    const users = rows.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      skillsOffered: u.skillsOffered ? u.skillsOffered.split(',').filter(Boolean) : [],
      skillsSought: u.skillsSought ? u.skillsSought.split(',').filter(Boolean) : [],
      hobbies: u.hobbies ? u.hobbies.split(',').filter(Boolean) : [],
      about: u.about,
      rating: u.rating,
      score: u.score
    }));
    res.json(users);
  });
});

// Get single user by id
app.get('/api/users/:id', (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = {
      ...row,
      skillsOffered: row.skillsOffered ? row.skillsOffered.split(',') : [],
      skillsSought: row.skillsSought ? row.skillsSought.split(',') : [],
      hobbies: row.hobbies ? row.hobbies.split(',') : []
    };
    res.json(user);
  });
});

// Get all communities
app.get('/api/communities', (req, res) => {
  db.all("SELECT * FROM communities", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const communities = rows.map(c => ({
      ...c,
      tags: c.tags ? c.tags.split(',') : []
    }));
    res.json(communities);
  });
});

// Get all posts (with author details)
app.get('/api/posts', (req, res) => {
  const query = `
    SELECT posts.*, users.name as authorName, users.avatar as authorAvatar
    FROM posts 
    JOIN users ON posts.authorId = users.id
    ORDER BY posts.id DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const posts = rows.map(p => ({
      id: p.id,
      content: p.content,
      type: p.type,
      likes: p.likes,
      date: p.date,
      author: {
        id: p.authorId,
        name: p.authorName,
        avatar: p.authorAvatar
      }
    }));
    res.json(posts);
  });
});

// Create a new post
app.post('/api/posts', (req, res) => {
  const { content, type, date, authorId } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  // Use a default user (id 1) if not provided
  const finalAuthorId = authorId || 1;
  const finalType = type || 'journey';
  const finalDate = date || 'Just now';

  const sql = "INSERT INTO posts (authorId, content, type, likes, date) VALUES (?, ?, ?, ?, ?)";
  db.run(sql, [finalAuthorId, content, finalType, 0, finalDate], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      id: this.lastID,
      message: 'Post created successfully'
    });
  });
});

// Fallback to index.html for SPA routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
