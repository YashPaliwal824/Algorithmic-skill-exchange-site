const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create tables
    db.serialize(() => {
      // Users Table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        name TEXT NOT NULL,
        avatar TEXT,
        skillsOffered TEXT,
        skillsSought TEXT,
        hobbies TEXT,
        about TEXT,
        rating TEXT,
        score REAL
      )`, () => {
        // Check if username/password columns exist (in case DB existed before migration)
        db.all("PRAGMA table_info(users)", (err, columns) => {
          if (!err && columns) {
            const hasUsername = columns.some(c => c.name === 'username');
            const hasPassword = columns.some(c => c.name === 'password');
            if (!hasUsername) {
              db.run("ALTER TABLE users ADD COLUMN username TEXT", (err) => {
                if (!err) db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)");
              });
            }
            if (!hasPassword) {
              db.run("ALTER TABLE users ADD COLUMN password TEXT");
            }
          }
        });
      });

      // Posts Table
      db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        authorId INTEGER,
        content TEXT,
        type TEXT,
        likes INTEGER DEFAULT 0,
        date TEXT,
        FOREIGN KEY (authorId) REFERENCES users (id)
      )`);

      // Communities Table
      db.run(`CREATE TABLE IF NOT EXISTS communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        members INTEGER,
        activeSessions INTEGER,
        tags TEXT
      )`, () => {
        // Seed initial data if empty
        db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
          if (row && row.count === 0) {
            console.log("Seeding mock data...");
            
            // Insert Users
            const users = [
              { username: "elena", password: bcrypt.hashSync("password123", 10), name: "Elena Rojas", avatar: "https://i.pravatar.cc/150?u=elena", offered: "Spanish,Guitar", sought: "Python,Machine Learning", hobbies: "Reading", about: "I love learning.", rating: "Platinum", score: 4.9 },
              { username: "david", password: bcrypt.hashSync("password123", 10), name: "David Kim", avatar: "https://i.pravatar.cc/150?u=david", offered: "Data Science,Python", sought: "Spanish,Cooking", hobbies: "Chess", about: "Data is beautiful.", rating: "Gold", score: 4.7 },
              { username: "sarah", password: bcrypt.hashSync("password123", 10), name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=sarah", offered: "UI/UX Design,Figma", sought: "React,JavaScript", hobbies: "Painting", about: "Design is thinking made visual.", rating: "Gold", score: 4.8 },
              { username: "michael", password: bcrypt.hashSync("password123", 10), name: "Michael Chen", avatar: "https://i.pravatar.cc/150?u=michael", offered: "React,Node.js", sought: "UI/UX Design,Marketing", hobbies: "Running", about: "Full stack enthusiast.", rating: "Bronze", score: 4.2 },
              { username: "you", password: bcrypt.hashSync("password123", 10), name: "You", avatar: "https://i.pravatar.cc/150?u=you", offered: "JavaScript,React", sought: "UI/UX Design,Python", hobbies: "Photography,Traveling,Gaming,Yoga", about: "I'm a passionate frontend developer looking to branch out into design and backend technologies. Let's build something cool together!", rating: "Platinum", score: 4.9 }
            ];
            
            const insertUser = db.prepare("INSERT INTO users (username, password, name, avatar, skillsOffered, skillsSought, hobbies, about, rating, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            users.forEach(u => insertUser.run(u.username, u.password, u.name, u.avatar, u.offered, u.sought, u.hobbies, u.about, u.rating, u.score));
            insertUser.finalize();

            // Insert Communities
            const communities = [
              { name: "Language Exchange", icon: "ph ph-translate", members: 1240, activeSessions: 42, tags: "Spanish,French,Japanese" },
              { name: "Fitness Enthusiasts", icon: "ph ph-person-simple-run", members: 856, activeSessions: 15, tags: "Yoga,Calisthenics,MMA" },
              { name: "Code Mentorship", icon: "ph ph-code", members: 3200, activeSessions: 128, tags: "React,Python,Node.js" },
              { name: "Design Thinkers", icon: "ph ph-paint-brush-broad", members: 920, activeSessions: 24, tags: "UI/UX,Figma,Sketch" }
            ];
            
            const insertComm = db.prepare("INSERT INTO communities (name, icon, members, activeSessions, tags) VALUES (?, ?, ?, ?, ?)");
            communities.forEach(c => insertComm.run(c.name, c.icon, c.members, c.activeSessions, c.tags));
            insertComm.finalize();

            // Insert Posts
            const posts = [
              { authorId: 1, content: "Just had an amazing session with David learning Python loops! In exchange, we practiced conversational Spanish. I love this community.", type: "journey", likes: 24, date: "2 hours ago" },
              { authorId: 3, content: "Looking for a React expert to help me bridge the gap between my Figma designs and live code. Anyone up for an exchange?", type: "request", likes: 12, date: "5 hours ago" },
              { authorId: 2, content: "Finally achieved Gold rating in Python mentorship! Big thanks to all my exchange partners for the honest feedback.", type: "milestone", likes: 56, date: "1 day ago" }
            ];

            const insertPost = db.prepare("INSERT INTO posts (authorId, content, type, likes, date) VALUES (?, ?, ?, ?, ?)");
            posts.forEach(p => insertPost.run(p.authorId, p.content, p.type, p.likes, p.date));
            insertPost.finalize();
          }
        });
      });
    });
  }
});

module.exports = db;
