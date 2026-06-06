const db = require('./database');
const bcrypt = require('bcryptjs');

const MOCK_USERS = [
  { id: 1, username: "elena", password: bcrypt.hashSync("password123", 10), name: "Elena Rojas", avatar: "https://i.pravatar.cc/150?u=elena", skillsOffered: "Spanish,Guitar", skillsSought: "Python,Machine Learning", hobbies: "Reading,Traveling", about: "I'm a language enthusiast looking to get into tech.", rating: "Platinum", score: 4.9 },
  { id: 2, username: "david", password: bcrypt.hashSync("password123", 10), name: "David Kim", avatar: "https://i.pravatar.cc/150?u=david", skillsOffered: "Data Science,Python", skillsSought: "Spanish,Cooking", hobbies: "Chess,Cycling", about: "Data scientist by day, amateur chef by night.", rating: "Gold", score: 4.7 },
  { id: 3, username: "sarah", password: bcrypt.hashSync("password123", 10), name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=sarah", skillsOffered: "UI/UX Design,Figma", skillsSought: "React,JavaScript", hobbies: "Painting,Photography", about: "Designer who wants to build her own ideas.", rating: "Gold", score: 4.8 },
  { id: 4, username: "michael", password: bcrypt.hashSync("password123", 10), name: "Michael Chen", avatar: "https://i.pravatar.cc/150?u=michael", skillsOffered: "React,Node.js", skillsSought: "UI/UX Design,Marketing", hobbies: "Gaming,Reading", about: "Full-stack dev trying to make things look pretty.", rating: "Bronze", score: 4.2 },
  { id: 5, username: "you", password: bcrypt.hashSync("password123", 10), name: "You (Demo)", avatar: "https://i.pravatar.cc/150?u=you", skillsOffered: "JavaScript,React", skillsSought: "UI/UX Design,Python", hobbies: "Photography,Traveling,Gaming,Yoga", about: "I'm a passionate frontend developer looking to branch out into design and backend technologies.", rating: "Platinum", score: 4.9 }
];

const MOCK_POSTS = [
  { id: 1, authorId: 1, content: "Just had an amazing session with David learning Python loops! In exchange, we practiced conversational Spanish. I love this community.", type: "journey", likes: 24, date: "2 hours ago" },
  { id: 2, authorId: 3, content: "Looking for a React expert to help me bridge the gap between my Figma designs and live code. Anyone up for an exchange?", type: "request", likes: 12, date: "5 hours ago" },
  { id: 3, authorId: 2, content: "Finally achieved Gold rating in Python mentorship! Big thanks to all my exchange partners for the honest feedback.", type: "milestone", likes: 56, date: "1 day ago" }
];

const MOCK_COMMUNITIES = [
  { id: 1, name: "Language Exchange", icon: "ph ph-translate", members: 1240, activeSessions: 42, tags: "Spanish,French,Japanese" },
  { id: 2, name: "Fitness Enthusiasts", icon: "ph ph-person-simple-run", members: 856, activeSessions: 15, tags: "Yoga,Calisthenics,MMA" },
  { id: 3, name: "Code Mentorship", icon: "ph ph-code", members: 3200, activeSessions: 128, tags: "React,Python,Node.js" },
  { id: 4, name: "Design Thinkers", icon: "ph ph-paint-brush-broad", members: 920, activeSessions: 24, tags: "UI/UX,Figma,Sketch" }
];

setTimeout(() => {
  db.serialize(() => {
    // Clear existing data to avoid duplicates on re-run
    db.run("DELETE FROM users");
    db.run("DELETE FROM posts");
    db.run("DELETE FROM communities");

    const stmtUsers = db.prepare("INSERT INTO users (id, username, password, name, avatar, skillsOffered, skillsSought, hobbies, about, rating, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    MOCK_USERS.forEach(u => stmtUsers.run(u.id, u.username, u.password, u.name, u.avatar, u.skillsOffered, u.skillsSought, u.hobbies, u.about, u.rating, u.score));
    stmtUsers.finalize();

    const stmtPosts = db.prepare("INSERT INTO posts (id, authorId, content, type, likes, date) VALUES (?, ?, ?, ?, ?, ?)");
    MOCK_POSTS.forEach(p => stmtPosts.run(p.id, p.authorId, p.content, p.type, p.likes, p.date));
    stmtPosts.finalize();

    const stmtCommunities = db.prepare("INSERT INTO communities (id, name, icon, members, activeSessions, tags) VALUES (?, ?, ?, ?, ?, ?)");
    MOCK_COMMUNITIES.forEach(c => stmtCommunities.run(c.id, c.name, c.icon, c.members, c.activeSessions, c.tags));
    stmtCommunities.finalize();

    console.log("Database seeded successfully!");
  });

  // Close connection after seeding
  setTimeout(() => db.close(), 1000);
}, 1000);
