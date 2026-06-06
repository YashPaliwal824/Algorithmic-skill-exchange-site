// App State
const state = {
  currentUser: { avatar: "https://i.pravatar.cc/150?u=you", name: "Loading..." },
  currentRoute: window.location.hash || '#home',
  users: [],
  posts: [],
  communities: [],
  isLoading: true,
  supportMessages: [
    { text: "Hello! Welcome to Synapse Support. How can we help you today?", isIncoming: true }
  ],
  callState: {
    micActive: true,
    videoActive: true,
    screenSharing: false,
    chatOpen: true,
    callDuration: 0,
    timerInterval: null,
    localStream: null,
    sessionChatMessages: [
      { text: "Hey! Glad we connected today. What should we start with?", author: "Sarah", isIncoming: true },
      { text: "Hey! Let's start with basic Machine Learning concepts, then we can swap to React.", author: "You", isIncoming: false }
    ]
  }
};

// Mock Data
const mockData = {
  users: [
    { id: 1, name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah", rating: "Platinum", score: "4.9", skillsOffered: ["Machine Learning", "Python"], skillsSought: ["UI/UX Design", "Figma"], about: "AI Researcher passionate about building accessible tools.", hobbies: ["Photography", "Hiking"] },
    { id: 2, name: "Alex Kumar", avatar: "https://i.pravatar.cc/150?u=alex", rating: "Gold", score: "4.7", skillsOffered: ["React", "CSS"], skillsSought: ["Go", "System Design"], about: "Frontend developer looking to transition to fullstack.", hobbies: ["Gaming", "Cooking"] },
    { id: 3, name: "Elena Rodriguez", avatar: "https://i.pravatar.cc/150?u=elena", rating: "Diamond", score: "5.0", skillsOffered: ["Spanish", "Digital Marketing"], skillsSought: ["Data Analysis", "SQL"], about: "Marketing director wanting to become more data-driven.", hobbies: ["Traveling", "Reading"] }
  ],
  posts: [
    { id: 1, authorId: 1, content: "Just successfully deployed my first machine learning model using TensorFlow.js! Thanks to @Alex for the frontend help.", type: "Milestone", date: "2 hours ago", likes: 24, author: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah" } },
    { id: 2, authorId: 2, content: "Struggling a bit with understanding React Server Components. Anyone free for a quick 15-min chat to explain the concepts?", type: "Request", date: "5 hours ago", likes: 5, author: { name: "Alex Kumar", avatar: "https://i.pravatar.cc/150?u=alex" } }
  ],
  communities: [
    { id: 1, name: "AI Explorers", icon: "ph ph-brain", tags: ["Machine Learning", "Python", "Data Science"], members: 1240, activeSessions: 42 },
    { id: 2, name: "Frontend Masters", icon: "ph ph-code", tags: ["React", "Vue", "CSS"], members: 3890, activeSessions: 115 },
    { id: 3, name: "Language Exchange", icon: "ph ph-translate", tags: ["Spanish", "English", "Mandarin"], members: 5420, activeSessions: 230 }
  ],
  currentUser: {
    id: 5,
    name: "Demo User",
    avatar: "https://i.pravatar.cc/150?u=you",
    rating: "Gold",
    score: "4.8",
    skillsOffered: ["JavaScript", "HTML"],
    skillsSought: ["Machine Learning", "Python"],
    about: "Enthusiastic developer eager to learn about AI and machine learning.",
    hobbies: ["Reading", "Coding"]
  }
};

// API Calls
const api = {
  getUsers: () => fetch('/api/users').then(res => res.json()),
  getUser: (id) => fetch(`/api/users/${id}`).then(res => res.json()),
  getPosts: () => fetch('/api/posts').then(res => res.json()),
  getCommunities: () => fetch('/api/communities').then(res => res.json()),
  createPost: (post) => fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  }).then(res => res.json())
};

// Fetch initial data
async function loadData() {
  state.isLoading = true;
  render(); // show loading state if needed
  
  try {
    const [users, posts, communities] = await Promise.all([
      api.getUsers(),
      api.getPosts(),
      api.getCommunities()
    ]);
    state.users = users || [];
    state.posts = posts || [];
    state.communities = communities || [];

    const loggedInUserStr = localStorage.getItem('currentUser');
    if (loggedInUserStr) {
      const parsed = JSON.parse(loggedInUserStr);
      try {
        const freshUser = await api.getUser(parsed.id);
        if (freshUser && !freshUser.error) {
          state.currentUser = freshUser;
          localStorage.setItem('currentUser', JSON.stringify(freshUser));
        } else {
          state.currentUser = parsed;
        }
      } catch (e) {
        state.currentUser = parsed;
      }
    } else {
      state.currentUser = null;
    }
  } catch (error) {
    console.error("Failed to load data from API", error);
  } finally {
    state.isLoading = false;
    render();
  }
}

// Components
const Navbar = () => {
  const profileSection = state.currentUser 
    ? `
      <a href="#logout" onclick="logoutUser(event)" style="margin-right:1.5rem;color:var(--text-muted);font-weight:600;display:flex;align-items:center;gap:0.3rem;"><i class="ph ph-sign-out"></i> Logout</a>
      <a href="#profile" style="display:flex; align-items:center;"><img src="${state.currentUser.avatar}" alt="Profile" class="avatar-sm"></a>
    `
    : `
      <a href="#login" style="color:var(--text-muted);font-weight:600;display:flex;align-items:center;gap:0.3rem;"><i class="ph ph-sign-in"></i> Login</a>
    `;

  return `
    <nav class="navbar glass-panel">
      <div class="container nav-container">
        <a href="#home" class="brand">
          <img src="favicon.png" alt="Synapse" style="width:36px; height:36px; border-radius:8px; object-fit:cover;">
          <span>Synapse</span>
        </a>
        <div class="nav-links">
          <a href="#home" class="${state.currentRoute === '#home' || state.currentRoute === '' ? 'active' : ''}">Home</a>
          <a href="#explore" class="${state.currentRoute === '#explore' ? 'active' : ''}">Explore</a>
          <a href="#communities" class="${state.currentRoute === '#communities' ? 'active' : ''}">Communities</a>
          <a href="#journey" class="${state.currentRoute === '#journey' ? 'active' : ''}">Journey</a>
          <a href="#about" class="${state.currentRoute === '#about' ? 'active' : ''}">About</a>
          <a href="#support" class="${state.currentRoute === '#support' ? 'active' : ''}">Support</a>
        </div>
        <div class="profile-menu" style="display:flex; align-items:center;">
          ${profileSection}
        </div>
      </div>
    </nav>
  `;
};

const HomeView = () => {
  return `
    <div class="hero container animate-fade-in">
      <div class="hero-content">
        <h1>Global Skill Exchange,<br><span class="text-gradient">Redefined.</span></h1>
        <p>Connect with brilliant minds worldwide. Teach what you know, learn what you desire. Our matching algorithm connects you instantly with the perfect peer mentor.</p>
        <div class="hero-actions">
          <a href="#explore" class="btn btn-primary"><i class="ph ph-magnifying-glass"></i> Find Matches</a>
          <a href="#journey" class="btn btn-outline"><i class="ph ph-users"></i> Community</a>
        </div>
      </div>
      <div class="hero-visual">
         <div class="orb orb-1"></div>
         <div class="orb orb-2"></div>
         <img src="sharing_information.png" alt="Synapse Knowledge Exchange" style="position:relative; z-index:10; width: 100%; max-width: 500px; height: auto; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid var(--glass-border); animation: float 5s ease-in-out infinite alternate;">
      </div>
    </div>
  `;
};

const ExploreView = () => `
  <div class="container animate-fade-in">
    <h2>Algorithmic Matches</h2>
    <p>Based on your profile, here are the best companions to exchange skills with.</p>
    <div class="grid grid-cols-3">
      ${state.users.map(user => `
        <div class="glass-panel match-card">
          <div class="match-header">
            <img src="${user.avatar}" class="avatar-lg">
            <div class="match-info">
              <h3>${user.name}</h3>
              <div class="match-rating">
                <i class="ph-fill ph-star"></i>
                <span>${user.score || '4.5'}</span>
                <span class="badge ${user.rating === 'Platinum' ? 'rating-platinum' : user.rating === 'Gold' ? 'rating-gold' : 'rating-bronze'}" style="margin-left:8px">${user.rating || 'Silver'}</span>
              </div>
            </div>
          </div>
          <div>
            <p style="margin-bottom:0.5rem; font-size:0.9rem;"><strong>Offers:</strong></p>
            <div class="skills-list">
              ${(user.skillsOffered || []).map(skill => `<span class="badge skill-offer">${skill}</span>`).join('')}
            </div>
          </div>
          <div>
            <p style="margin-bottom:0.5rem; font-size:0.9rem;"><strong>Seeks:</strong></p>
            <div class="skills-list">
              ${(user.skillsSought || []).map(skill => `<span class="badge skill-seek">${skill}</span>`).join('')}
            </div>
          </div>
          <a href="#session" class="btn btn-outline" style="margin-top:auto;"><i class="ph ph-phone"></i> Start Exchange</a>
        </div>
      `).join('')}
    </div>
  </div>
`;

const CommunityView = () => `
  <div class="container animate-fade-in" style="max-width: 800px;">
    <h2>Community Journey</h2>
    <p>See what others are learning and sharing.</p>
    
    <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 3rem;">
        <textarea id="postContent" placeholder="Share an update on your learning journey..." style="width:100%; background:transparent; border:none; color:white; font-family:inherit; font-size:1rem; outline:none; resize:none; min-height:80px;"></textarea>
        <div style="display:flex; justify-content:flex-end;">
           <button class="btn btn-primary" onclick="submitPost()">Post</button>
        </div>
    </div>

    <div class="timeline">
      ${state.posts.map(post => `
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="glass-panel timeline-content">
            <div class="timeline-header">
              <div style="display:flex; align-items:center; gap: 1rem;">
                <img src="${post.author?.avatar || 'https://i.pravatar.cc/150?u=anon'}" class="avatar-sm">
                <div>
                  <h4 style="margin:0">${post.author?.name || 'Unknown'}</h4>
                  <small style="color:var(--text-muted)">${post.date}</small>
                </div>
              </div>
              <span class="badge" style="background:rgba(255,255,255,0.1)">${post.type}</span>
            </div>
            <p style="color:var(--text-main); font-size:1.1rem;">${post.content}</p>
            <div style="display:flex; gap: 1rem; margin-top:1rem;">
              <button class="btn-outline" style="padding:0.5rem 1rem; border-radius:8px; border:none; background:rgba(255,255,255,0.05); cursor:pointer; color:white; display:flex; align-items:center; gap:0.5rem;"><i class="ph ph-heart"></i> ${post.likes || 0}</button>
              <button class="btn-outline" style="padding:0.5rem 1rem; border-radius:8px; border:none; background:rgba(255,255,255,0.05); cursor:pointer; color:white; display:flex; align-items:center; gap:0.5rem;"><i class="ph ph-chat-circle"></i> Reply</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
`;

window.submitPost = async () => {
  if (!state.currentUser) {
    alert('Please log in to post an update.');
    window.location.hash = '#login';
    return;
  }
  const content = document.getElementById('postContent').value;
  if (!content.trim()) return;
  
  await api.createPost({
    content,
    type: 'journey',
    date: 'Just now',
    authorId: state.currentUser.id
  });
  
  // Refresh posts after posting
  state.posts = await api.getPosts();
  render();
};

const LoginView = () => `
  <div class="container animate-fade-in" style="height: calc(100vh - 120px); display:flex; align-items:center; justify-content:center;">
    <div class="glass-panel auth-container">
      <div style="font-size:3rem; color:var(--primary-light); margin-bottom:1rem;"><i class="ph-fill ph-infinity"></i></div>
      <h2 style="margin-bottom:1.5rem;">Welcome Back</h2>
      <div id="loginError" style="color:var(--accent); background:rgba(235,94,85,0.1); border:1px solid rgba(235,94,85,0.2); padding:0.75rem; border-radius:8px; margin-bottom:1.5rem; display:none; text-align:left; font-size: 0.9rem;"></div>
      <form onsubmit="handleLoginSubmit(event)" style="width:100%; display:flex; flex-direction:column; gap:1.25rem;">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" id="loginUsername" class="form-control" placeholder="Enter your username" required autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem; display:flex; align-items:center; justify-content:center; gap:0.5rem;">Login <i class="ph ph-sign-in"></i></button>
      </form>
      <p style="margin-top:2rem; font-size:0.9rem; color:var(--text-muted);">Don't have an account? <a href="#signup" style="color:var(--primary-light); font-weight:600;">Sign up</a></p>
    </div>
  </div>
`;

const SignupView = () => `
  <div class="container animate-fade-in" style="height: calc(100vh - 120px); display:flex; align-items:center; justify-content:center;">
    <div class="glass-panel auth-container">
      <div style="font-size:3rem; color:var(--primary-light); margin-bottom:1rem;"><i class="ph-fill ph-infinity"></i></div>
      <h2 style="margin-bottom:1.5rem;">Create Account</h2>
      <div id="signupError" style="color:var(--accent); background:rgba(235,94,85,0.1); border:1px solid rgba(235,94,85,0.2); padding:0.75rem; border-radius:8px; margin-bottom:1.5rem; display:none; text-align:left; font-size: 0.9rem;"></div>
      <form onsubmit="handleSignupSubmit(event)" style="width:100%; display:flex; flex-direction:column; gap:1.25rem;">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="signupName" class="form-control" placeholder="Enter your full name" required autocomplete="name">
        </div>
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" id="signupUsername" class="form-control" placeholder="Choose a username" required autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="signupPassword" class="form-control" placeholder="Create a password" required autocomplete="new-password">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem; display:flex; align-items:center; justify-content:center; gap:0.5rem;">Sign Up & Continue <i class="ph ph-arrow-right"></i></button>
      </form>
      <p style="margin-top:2rem; font-size:0.9rem; color:var(--text-muted);">Already have an account? <a href="#login" style="color:var(--primary-light); font-weight:600;">Login</a></p>
    </div>
  </div>
`;

const OnboardingView = () => {
  const skills = ["Calisthenics", "Yoga", "MMA", "Languages", "Dance & Music", "Programming", "Design", "Cooking", "Photography", "Marketing"];
  return `
    <div class="container animate-fade-in" style="max-width:800px; text-align:center; padding-bottom: 4rem;">
      <h2 style="margin-bottom: 0.5rem;">Tell Us About Yourself</h2>
      <p style="color:var(--text-muted); margin-bottom: 3rem;">Select the skills you can share and the skills you want to learn to get matched.</p>
      
      <div style="text-align:left; margin-bottom:2.5rem;">
        <h3 style="margin-bottom: 1rem; color: var(--primary-light);"><i class="ph ph-briefcase"></i> Skills You Can Teach (Offer)</h3>
        <div class="skill-grid">
          ${skills.map(skill => `
            <label>
              <input type="checkbox" name="skillsOffered" value="${skill}">
              <div class="skill-pill">${skill}</div>
            </label>
          `).join('')}
        </div>
      </div>

      <div style="text-align:left; margin-bottom:3rem;">
        <h3 style="margin-bottom: 1rem; color: var(--accent);"><i class="ph ph-student"></i> Skills You Want to Learn (Seek)</h3>
        <div class="skill-grid">
          ${skills.map(skill => `
            <label>
              <input type="checkbox" name="skillsSought" value="${skill}">
              <div class="skill-pill">${skill}</div>
            </label>
          `).join('')}
        </div>
      </div>

      <button onclick="submitOnboarding()" class="btn btn-primary" style="padding:1rem 4rem; font-size:1.1rem; display:inline-flex; align-items:center; gap:0.5rem;">Complete Setup <i class="ph ph-arrow-right"></i></button>
    </div>
  `;
};

window.handleLoginSubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.innerText = data.error || 'Login failed';
      errorEl.style.display = 'block';
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(data));
    state.currentUser = data;
    
    await loadData();
    window.location.hash = '#home';
  } catch (err) {
    errorEl.innerText = 'Network error, please try again.';
    errorEl.style.display = 'block';
  }
};

window.handleSignupSubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  const errorEl = document.getElementById('signupError');

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.innerText = data.error || 'Signup failed';
      errorEl.style.display = 'block';
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(data));
    state.currentUser = data;
    
    await loadData();
    window.location.hash = '#onboarding';
  } catch (err) {
    errorEl.innerText = 'Network error, please try again.';
    errorEl.style.display = 'block';
  }
};

window.submitOnboarding = async () => {
  if (!state.currentUser) {
    window.location.hash = '#login';
    return;
  }

  const offeredCheks = document.querySelectorAll('input[name="skillsOffered"]:checked');
  const soughtCheks = document.querySelectorAll('input[name="skillsSought"]:checked');

  const skillsOffered = Array.from(offeredCheks).map(c => c.value);
  const skillsSought = Array.from(soughtCheks).map(c => c.value);

  try {
    const res = await fetch(`/api/users/${state.currentUser.id}/skills`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillsOffered, skillsSought })
    });
    const data = await res.json();
    if (res.ok) {
      state.currentUser.skillsOffered = skillsOffered;
      state.currentUser.skillsSought = skillsSought;
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
      
      const usersRes = await fetch('/api/users');
      state.users = await usersRes.json();

      window.location.hash = '#profile';
    } else {
      alert(data.error || 'Failed to save skills.');
    }
  } catch (err) {
    console.error("Failed to update onboarding skills", err);
  }
};

window.logoutUser = (e) => {
  if (e) e.preventDefault();
  localStorage.removeItem('currentUser');
  state.currentUser = null;
  window.location.hash = '#home';
  render();
};

const ProfileView = () => {
  if (!state.currentUser) return LoginView();
  const u = state.currentUser;
  const skillsOffered = Array.isArray(u.skillsOffered) ? u.skillsOffered : (u.skillsOffered ? u.skillsOffered.split(',').filter(Boolean) : []);
  const skillsSought = Array.isArray(u.skillsSought) ? u.skillsSought : (u.skillsSought ? u.skillsSought.split(',').filter(Boolean) : []);
  const hobbies = Array.isArray(u.hobbies) ? u.hobbies : (u.hobbies ? u.hobbies.split(',').filter(Boolean) : []);
  return `
  <div class="container animate-fade-in" style="max-width:800px;">
    <div class="glass-panel profile-section">
      <div class="profile-header">
        <img src="${u.avatar}" class="avatar-lg" style="width:120px; height:120px;">
        <div class="profile-info">
          <h2>${u.name}</h2>
          <div class="profile-league">
            <i class="ph-fill ph-star"></i>
            <i class="ph-fill ph-star"></i>
            <i class="ph-fill ph-star"></i>
            <span>${u.rating || 'Bronze'} League</span>
          </div>
          <p>${u.about || ''}</p>
        </div>
      </div>
      <div class="grid grid-cols-2" style="gap:2rem;">
        <div>
          <h3 class="profile-section-title"><i class="ph ph-briefcase"></i> Skills I Have</h3>
          <div class="skills-list">
             ${skillsOffered.length > 0 ? skillsOffered.map(skill => `<span class="badge skill-offer">${skill}</span>`).join('') : '<span style="color:var(--text-muted); font-size:0.9rem;">No skills added yet. <a href="#onboarding" style="color:var(--primary-light);">Add skills</a></span>'}
          </div>
        </div>
        <div>
          <h3 class="profile-section-title"><i class="ph ph-student"></i> Skills I Want To Learn</h3>
          <div class="skills-list">
             ${skillsSought.length > 0 ? skillsSought.map(skill => `<span class="badge skill-seek">${skill}</span>`).join('') : '<span style="color:var(--text-muted); font-size:0.9rem;">No skills added yet. <a href="#onboarding" style="color:var(--primary-light);">Add skills</a></span>'}
          </div>
        </div>
        <div style="grid-column: 1 / -1;">
          <h3 class="profile-section-title"><i class="ph ph-heart"></i> Hobbies & Interests</h3>
          <div class="skills-list">
             ${hobbies.length > 0 ? hobbies.map(hobby => `<span class="badge" style="background:var(--bg-surface-elevated)">${hobby}</span>`).join('') : '<span style="color:var(--text-muted); font-size:0.9rem;">No hobbies added.</span>'}
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
};

const CommunitiesView = () => `
  <div class="container animate-fade-in">
    <h2>Specialized Communities</h2>
    <p>Join communities based on your skills and interests to connect with like-minded individuals.</p>
    <div class="grid grid-cols-3">
      ${state.communities.map(community => `
        <div class="glass-panel community-card">
          <div class="community-header">
            <div class="community-icon"><i class="${community.icon}"></i></div>
            <div>
              <h3 style="margin:0">${community.name}</h3>
              <div class="skills-list" style="margin-top:0.25rem;">
                ${(community.tags || []).map(tag => `<span class="badge" style="font-size:0.75rem;">${tag}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="community-stats">
            <span><i class="ph ph-users"></i> ${community.members} Members</span>
            <span><i class="ph ph-video-camera"></i> ${community.activeSessions} Active Sessions</span>
          </div>
          <button class="btn btn-outline" style="margin-top:1rem; width:100%;">Join Community</button>
        </div>
      `).join('')}
    </div>
  </div>
`;

const SessionView = () => {
  const companion = state.users[0] || { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah", skillsOffered: ["Machine Learning"] };
  const timerStr = formatDuration(state.callState.callDuration);

  return `
  <div class="container animate-fade-in session-container">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2 style="margin:0;"><i class="ph-fill ph-video-camera" style="color:var(--primary-light); animation: pulseAvatar 2s infinite alternate;"></i> Interactive Session</h2>
        <span class="badge rating-platinum" id="callTimer" style="font-size:1.1rem; padding:0.5rem 1.25rem; font-family:monospace; background:rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">${timerStr}</span>
    </div>
    
    <div class="session-layout">
      <!-- Media Streams -->
      <div style="display:flex; flex-direction:column; gap:1.5rem; justify-content:space-between; flex:1;">
        <div class="video-grid">
          <!-- Companion Feed -->
          <div class="video-placeholder glass-panel" id="companionVideoContainer">
             <img src="${companion.avatar}" id="companionAvatarImg">
             <div class="avatar-fallback" id="companionAvatarFallback">
                <i class="ph ph-user"></i>
             </div>
             <div class="video-name">${companion.name} (Teaching ${(companion.skillsOffered && companion.skillsOffered[0]) || 'Skill'})</div>
             <div style="position:absolute; top:1rem; right:1rem;">
                 <span class="badge" id="companionStatus" style="background:rgba(0,0,0,0.6);"><i class="ph ph-microphone"></i> Active</span>
             </div>
             <!-- Companion voice waveform when active -->
             <div class="waveform-container active" id="companionWaveform" style="position:absolute; bottom: 3.5rem; left: 50%; transform: translateX(-50%); scale: 0.6; pointer-events: none;">
                 <div class="wave-bar"></div>
                 <div class="wave-bar"></div>
                 <div class="wave-bar"></div>
                 <div class="wave-bar"></div>
                 <div class="wave-bar"></div>
             </div>
          </div>

          <!-- User Feed (Local) -->
          <div class="video-placeholder glass-panel ${state.callState.videoActive ? '' : 'camera-off'}" id="localVideoContainer">
             <video id="localVideoFeed" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); display: none;"></video>
             <img src="${state.currentUser?.avatar || 'https://i.pravatar.cc/150?u=you'}" id="localAvatarImg" style="display: block;">
             <div class="avatar-fallback" id="localAvatarFallback">
                <i class="ph ph-user"></i>
             </div>
             <div class="video-name">You (Teaching ${(Array.isArray(state.currentUser?.skillsOffered) ? state.currentUser.skillsOffered[0] : (state.currentUser?.skillsOffered || '').split(',')[0]) || 'Skill'})</div>
             
             <!-- Local voice waveform when mic is active -->
             <div class="waveform-container ${state.callState.micActive ? 'active' : ''}" id="localWaveform" style="position:absolute; bottom: 3.5rem; left: 50%; transform: translateX(-50%); scale: 0.6; pointer-events: none;">
                 <div class="wave-bar"></div>
                 <div class="wave-bar"></div>
                 <div class="wave-bar"></div>
                 <div class="wave-bar"></div>
                 <div class="wave-bar"></div>
             </div>

             <!-- Mic status overlay -->
             <div style="position:absolute; inset:0; display: ${state.callState.micActive ? 'none' : 'flex'}; align-items:center; justify-content:center; background:rgba(0,0,0,0.4);" id="localMuteOverlay">
                 <i class="ph-fill ph-microphone-slash" style="font-size:3rem; color:var(--accent); background:rgba(0,0,0,0.6); padding:1rem; border-radius:50%;"></i>
             </div>
          </div>
        </div>

        <!-- Call Actions Panel -->
        <div class="glass-panel controls" style="margin-top:auto;">
            <button class="btn-icon ${state.callState.micActive ? '' : 'active'}" id="micToggleBtn" onclick="toggleLocalMic()" title="Toggle Mic">
                <i class="${state.callState.micActive ? 'ph-fill ph-microphone' : 'ph-fill ph-microphone-slash'}"></i>
            </button>
            <button class="btn-icon ${state.callState.videoActive ? '' : 'active'}" id="videoToggleBtn" onclick="toggleLocalVideo()" title="Toggle Video">
                <i class="${state.callState.videoActive ? 'ph-fill ph-video-camera' : 'ph-fill ph-video-camera-slash'}"></i>
            </button>
            <button class="btn-icon ${state.callState.screenSharing ? 'active' : ''}" id="screenToggleBtn" onclick="toggleLocalScreen()" title="Share Screen">
                <i class="ph-fill ph-monitor-arrow-up"></i>
            </button>
            <button class="btn-icon" id="chatToggleBtn" onclick="toggleCallChat()" title="Toggle Chat">
                <i class="ph-fill ph-chat-teardrop-dots"></i>
            </button>
            <a href="#explore" class="btn-icon btn-danger" title="End Call" onclick="cleanupSessionCall()"><i class="ph-fill ph-phone-disconnect"></i></a>
        </div>
      </div>

      <!-- Chat Sidebar -->
      <div class="session-chat glass-panel" id="sessionChatPanel" style="display: ${state.callState.chatOpen ? 'flex' : 'none'};">
         <div class="chat-header">
             <i class="ph ph-chat-circle"></i>
             <span>Session Chat</span>
         </div>
         <div class="chat-messages" id="sessionChatMessages">
             ${state.callState.sessionChatMessages.map(msg => `
                <div class="chat-msg ${msg.isIncoming ? 'incoming' : 'outgoing'}">
                    <strong>${msg.author}:</strong> ${msg.text}
                </div>
             `).join('')}
         </div>
         <div class="chat-input-container">
             <input type="text" id="sessionChatInput" placeholder="Message companion..." onkeypress="handleSessionChatKey(event)">
             <button onclick="sendSessionChatMessage()"><i class="ph ph-paper-plane-right"></i></button>
         </div>
      </div>
    </div>
  </div>
  `;
};

const AboutView = () => `
  <div class="container animate-fade-in">
    <div class="about-hero">
      <h2>About <span class="text-gradient">Synapse</span></h2>
      <p style="font-size:1.2rem; max-width:600px; margin: 0 auto 2rem auto;">
        Synapse is a peer-to-peer learning network designed to bridge knowledge gaps across the globe. We believe that everyone has something to teach and something to learn.
      </p>
    </div>

    <div class="glass-panel mission-card">
      <div class="about-grid">
        <div>
          <h3>Our Mission</h3>
          <p>We are building a platform that breaks down barriers to quality education. By facilitating direct human-to-human interaction, Synapse helps users master new skills, expand their cultural horizons, and form lasting professional connections.</p>
          <p>Through our intelligent algorithmic match matching, we connect you with peer mentors who specialize in what you want to learn, and are eager to acquire the skills you already possess.</p>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
          <div class="stat-box">
            <div class="stat-number">10K+</div>
            <p style="margin:0; font-weight:600;">Active Users</p>
          </div>
          <div class="stat-box">
            <div class="stat-number">45K+</div>
            <p style="margin:0; font-weight:600;">Sessions Completed</p>
          </div>
          <div class="stat-box">
            <div class="stat-number">120+</div>
            <p style="margin:0; font-weight:600;">Skills Exchanged</p>
          </div>
          <div class="stat-box">
            <div class="stat-number">98%</div>
            <p style="margin:0; font-weight:600;">Success Rate</p>
          </div>
        </div>
      </div>
    </div>

    <h2 style="margin-top: 5rem; text-align:center;">Meet the Team</h2>
    <div class="team-grid">
      <div class="glass-panel team-card">
        <img src="https://i.pravatar.cc/150?u=dev1" class="team-avatar">
        <h3>Marcus Vance</h3>
        <p style="color:var(--primary-light); font-weight:600; font-size:0.9rem; margin-bottom:0.5rem;">Founder & CEO</p>
        <p style="font-size:0.9rem;">Passionate educator with 10+ years in ed-tech.</p>
      </div>
      <div class="glass-panel team-card">
        <img src="https://i.pravatar.cc/150?u=dev2" class="team-avatar">
        <h3>Linya Zhou</h3>
        <p style="color:var(--primary-light); font-weight:600; font-size:0.9rem; margin-bottom:0.5rem;">Lead Architect</p>
        <p style="font-size:0.9rem;">Algorithms expert, builder of matching engines.</p>
      </div>
      <div class="glass-panel team-card">
        <img src="https://i.pravatar.cc/150?u=dev3" class="team-avatar">
        <h3>David K.</h3>
        <p style="color:var(--primary-light); font-weight:600; font-size:0.9rem; margin-bottom:0.5rem;">Head of Community</p>
        <p style="font-size:0.9rem;">Fosters connections and ensures peer satisfaction.</p>
      </div>
    </div>
  </div>
`;

const SupportView = () => `
  <div class="container animate-fade-in">
    <div class="support-hero">
      <h2>How Can We <span class="text-gradient">Help You?</span></h2>
      <p>Browse FAQs or contact our Customer Service team directly.</p>
    </div>

    <div class="support-container">
      <div>
        <h3>Frequently Asked Questions</h3>
        <div class="faq-list">
          <div class="faq-item" onclick="toggleFaq(this)">
            <div class="faq-question">How does the skill matching algorithm work? <i class="ph ph-caret-down"></i></div>
            <div class="faq-answer">Synapse calculates match scores by comparing user profiles. It evaluates the exact overlap of skills offered and sought, along with ratings, time zones, and preferences to pair you with the best learning partner.</div>
          </div>
          <div class="faq-item" onclick="toggleFaq(this)">
            <div class="faq-question">Is the platform free to use? <i class="ph ph-caret-down"></i></div>
            <div class="faq-answer">Yes, Synapse operates on a direct swap model. You teach a skill in exchange for learning one, making the platform entirely free of direct monetary charges.</div>
          </div>
          <div class="faq-item" onclick="toggleFaq(this)">
            <div class="faq-question">What if my match does not show up? <i class="ph ph-caret-down"></i></div>
            <div class="faq-answer">If a partner misses a scheduled session, you can report it via their profile or session view. Our system tracks attendance and reliability to ensure a positive community environment.</div>
          </div>
          <div class="faq-item" onclick="toggleFaq(this)">
            <div class="faq-question">How do video and audio calls work? <i class="ph ph-caret-down"></i></div>
            <div class="faq-answer">When you click "Start Exchange" or "Connect Now", you enter a browser-based session screen with full support for real-time video, microphone mute toggles, screenshare, and built-in text chat.</div>
          </div>
        </div>

        <div class="glass-panel live-chat-card">
          <h3><i class="ph ph-chat-circle-text" style="color:var(--primary-light)"></i> Live Chat with Support</h3>
          <p>Get instant automated assistance from our support bot.</p>
          <div class="live-chat-box">
            <div class="live-chat-messages" id="liveChatMessages">
              ${state.supportMessages.map(msg => `
                <div class="chat-msg ${msg.isIncoming ? 'incoming' : 'outgoing'}">${msg.text}</div>
              `).join('')}
            </div>
            <div class="live-chat-input">
              <input type="text" id="liveChatInputText" placeholder="Type your message..." onkeypress="handleLiveChatKey(event)">
              <button onclick="sendLiveSupportMessage()">Send</button>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-panel support-ticket-form">
        <h3>Submit a Support Ticket</h3>
        <p>Send a detailed message to our engineering and support teams.</p>
        <div style="margin-top:1.5rem;">
          <div class="form-group">
            <label class="form-label">Your Email</label>
            <input type="email" class="form-control" id="ticketEmail" placeholder="name@example.com">
          </div>
          <div class="form-group">
            <label class="form-label">Subject</label>
            <input type="text" class="form-control" id="ticketSubject" placeholder="e.g. Issue with video session">
          </div>
          <div class="form-group">
            <label class="form-label">Describe your issue</label>
            <textarea class="form-control" id="ticketDesc" rows="4" style="resize:none; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); width:100%; border-radius:8px; padding:0.75rem; color:white;" placeholder="Provide details..."></textarea>
          </div>
          <button class="btn btn-primary" style="width:100%; margin-top:1rem;" onclick="submitSupportTicket()">Submit Ticket</button>
        </div>
      </div>
    </div>
  </div>
`;

window.toggleFaq = (el) => {
  el.classList.toggle('active');
};

window.handleLiveChatKey = (e) => {
  if (e.key === 'Enter') {
    sendLiveSupportMessage();
  }
};

window.sendLiveSupportMessage = () => {
  const input = document.getElementById('liveChatInputText');
  const text = input.value.trim();
  if (!text) return;

  state.supportMessages.push({ text, isIncoming: false });
  input.value = '';
  
  // Render chat messages immediately
  const chatMessagesEl = document.getElementById('liveChatMessages');
  if (chatMessagesEl) {
    chatMessagesEl.innerHTML = state.supportMessages.map(msg => `
      <div class="chat-msg ${msg.isIncoming ? 'incoming' : 'outgoing'}">${msg.text}</div>
    `).join('');
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  // Simulated auto response
  setTimeout(() => {
    let reply = "Thanks for messaging. A Synapse representative has been notified and will get back to you shortly! In the meantime, please check the FAQ list.";
    if (text.toLowerCase().includes('video') || text.toLowerCase().includes('call') || text.toLowerCase().includes('mic')) {
      reply = "It sounds like you're having issues with calls. Please verify you've granted microphone and camera permissions to the browser, and check your browser settings.";
    } else if (text.toLowerCase().includes('match') || text.toLowerCase().includes('algorithm')) {
      reply = "Our matching system looks at matching your 'Skills Offered' with another user's 'Skills Sought' and vice versa. Try expanding your profile's skill list!";
    }
    
    state.supportMessages.push({ text: reply, isIncoming: true });
    if (chatMessagesEl) {
      chatMessagesEl.innerHTML = state.supportMessages.map(msg => `
        <div class="chat-msg ${msg.isIncoming ? 'incoming' : 'outgoing'}">${msg.text}</div>
      `).join('');
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
  }, 1000);
};

window.submitSupportTicket = () => {
  const email = document.getElementById('ticketEmail').value;
  const subject = document.getElementById('ticketSubject').value;
  const desc = document.getElementById('ticketDesc').value;
  
  if (!email || !subject || !desc) {
    alert("Please fill in all fields.");
    return;
  }
  
  alert("Support Ticket submitted successfully! Ticket ID: #" + Math.floor(Math.random() * 900000 + 100000) + ". We've sent a confirmation to " + email);
  document.getElementById('ticketEmail').value = '';
  document.getElementById('ticketSubject').value = '';
  document.getElementById('ticketDesc').value = '';
};

window.formatDuration = (s) => {
  const mins = Math.floor(s / 60).toString().padStart(2, '0');
  const secs = (s % 60).toString().padStart(2, '0');
  return `00:${mins}:${secs}`;
};

window.initSessionCall = async () => {
  // Start timer
  if (!state.callState.timerInterval) {
    state.callState.timerInterval = setInterval(() => {
      state.callState.callDuration++;
      const timerEl = document.getElementById('callTimer');
      if (timerEl) {
        timerEl.innerText = formatDuration(state.callState.callDuration);
      }
    }, 1000);
  }

  // Attempt to load browser media devices for WebRTC visual simulation
  if (state.callState.videoActive && !state.callState.localStream) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      state.callState.localStream = stream;
      const videoEl = document.getElementById('localVideoFeed');
      const imgEl = document.getElementById('localAvatarImg');
      if (videoEl && imgEl) {
        videoEl.srcObject = stream;
        videoEl.style.display = 'block';
        imgEl.style.display = 'none';
      }
    } catch (e) {
      console.warn("Camera access denied or unavailable. Falling back to avatar placeholder.");
    }
  }

  // Setup simulated chat incoming messages every 25 seconds
  if (!window.sessionSimInterval) {
    window.sessionSimInterval = setInterval(() => {
      const replies = [
        "That makes total sense!",
        "Let me share a quick link in a second.",
        "Could you explain that part one more time?",
        "Awesome progress we're making here.",
        "How do you usually handle state management in larger projects?"
      ];
      const companion = state.users[0] || { name: "Sarah Chen" };
      const randomText = replies[Math.floor(Math.random() * replies.length)];
      
      state.callState.sessionChatMessages.push({
        text: randomText,
        author: companion.name.split(' ')[0],
        isIncoming: true
      });

      const chatMessagesEl = document.getElementById('sessionChatMessages');
      if (chatMessagesEl) {
        chatMessagesEl.innerHTML = state.callState.sessionChatMessages.map(msg => `
          <div class="chat-msg ${msg.isIncoming ? 'incoming' : 'outgoing'}">
              <strong>${msg.author}:</strong> ${msg.text}
          </div>
        `).join('');
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
      }
    }, 25000);
  }
};

window.cleanupSessionCall = () => {
  // Clear timer
  if (state.callState.timerInterval) {
    clearInterval(state.callState.timerInterval);
    state.callState.timerInterval = null;
  }
  if (window.sessionSimInterval) {
    clearInterval(window.sessionSimInterval);
    window.sessionSimInterval = null;
  }
  // Stop webcam streams
  if (state.callState.localStream) {
    state.callState.localStream.getTracks().forEach(track => track.stop());
    state.callState.localStream = null;
  }
};

window.toggleLocalMic = () => {
  state.callState.micActive = !state.callState.micActive;
  const overlay = document.getElementById('localMuteOverlay');
  const waveform = document.getElementById('localWaveform');
  const btn = document.getElementById('micToggleBtn');
  
  if (state.callState.localStream) {
    state.callState.localStream.getAudioTracks().forEach(track => {
      track.enabled = state.callState.micActive;
    });
  }

  if (overlay) overlay.style.display = state.callState.micActive ? 'none' : 'flex';
  if (waveform) {
    if (state.callState.micActive) waveform.classList.add('active');
    else waveform.classList.remove('active');
  }
  if (btn) {
    btn.className = `btn-icon ${state.callState.micActive ? '' : 'active'}`;
    btn.innerHTML = `<i class="${state.callState.micActive ? 'ph-fill ph-microphone' : 'ph-fill ph-microphone-slash'}"></i>`;
  }
};

window.toggleLocalVideo = async () => {
  state.callState.videoActive = !state.callState.videoActive;
  const container = document.getElementById('localVideoContainer');
  const videoEl = document.getElementById('localVideoFeed');
  const imgEl = document.getElementById('localAvatarImg');
  const btn = document.getElementById('videoToggleBtn');

  if (state.callState.localStream) {
    state.callState.localStream.getVideoTracks().forEach(track => {
      track.enabled = state.callState.videoActive;
    });
  }

  if (container) {
    if (state.callState.videoActive) container.classList.remove('camera-off');
    else container.classList.add('camera-off');
  }
  if (btn) {
    btn.className = `btn-icon ${state.callState.videoActive ? '' : 'active'}`;
    btn.innerHTML = `<i class="${state.callState.videoActive ? 'ph-fill ph-video-camera' : 'ph-fill ph-video-camera-slash'}"></i>`;
  }

  // Request stream if turning video back on and missing stream
  if (state.callState.videoActive && !state.callState.localStream) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      state.callState.localStream = stream;
      if (videoEl && imgEl) {
        videoEl.srcObject = stream;
        videoEl.style.display = 'block';
        imgEl.style.display = 'none';
      }
    } catch (e) {
      console.warn("Camera denied.");
    }
  }
};

window.toggleLocalScreen = async () => {
  state.callState.screenSharing = !state.callState.screenSharing;
  const btn = document.getElementById('screenToggleBtn');
  const videoEl = document.getElementById('localVideoFeed');
  const imgEl = document.getElementById('localAvatarImg');
  
  if (btn) btn.className = `btn-icon ${state.callState.screenSharing ? 'active' : ''}`;

  if (state.callState.screenSharing) {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.style.display = 'block';
        if (imgEl) imgEl.style.display = 'none';
      }
      // Revert if screenshare track finishes
      stream.getVideoTracks()[0].onended = () => {
        toggleLocalScreen();
      };
    } catch (e) {
      console.warn("Screenshare denied/cancelled.");
      state.callState.screenSharing = false;
      if (btn) btn.classList.remove('active');
    }
  } else {
    // Return to webcam
    if (videoEl && state.callState.localStream) {
      videoEl.srcObject = state.callState.localStream;
    } else if (imgEl) {
      if (videoEl) videoEl.style.display = 'none';
      imgEl.style.display = 'block';
    }
  }
};

window.toggleCallChat = () => {
  state.callState.chatOpen = !state.callState.chatOpen;
  const chatPanel = document.getElementById('sessionChatPanel');
  if (chatPanel) chatPanel.style.display = state.callState.chatOpen ? 'flex' : 'none';
};

window.handleSessionChatKey = (e) => {
  if (e.key === 'Enter') sendSessionChatMessage();
};

window.sendSessionChatMessage = () => {
  const input = document.getElementById('sessionChatInput');
  const text = input.value.trim();
  if (!text) return;

  state.callState.sessionChatMessages.push({
    text,
    author: "You",
    isIncoming: false
  });
  input.value = '';

  const chatMessagesEl = document.getElementById('sessionChatMessages');
  if (chatMessagesEl) {
    chatMessagesEl.innerHTML = state.callState.sessionChatMessages.map(msg => `
      <div class="chat-msg ${msg.isIncoming ? 'incoming' : 'outgoing'}">
          <strong>${msg.author}:</strong> ${msg.text}
      </div>
    `).join('');
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }
  
  // Companion automatic quick response mockup
  setTimeout(() => {
    const companion = state.users[0] || { name: "Sarah Chen" };
    const replies = [
      "Awesome!",
      "Got it. Let's try writing some code for this.",
      "Indeed! Let's do that.",
      "Could you show me an example of what you mean?"
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    state.callState.sessionChatMessages.push({
      text: randomReply,
      author: companion.name.split(' ')[0],
      isIncoming: true
    });
    if (chatMessagesEl) {
      chatMessagesEl.innerHTML = state.callState.sessionChatMessages.map(msg => `
        <div class="chat-msg ${msg.isIncoming ? 'incoming' : 'outgoing'}">
            <strong>${msg.author}:</strong> ${msg.text}
        </div>
      `).join('');
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
  }, 1500);
};

// Router
const render = () => {
  const app = document.getElementById('app');
  
  if (state.isLoading) {
    app.innerHTML = Navbar() + '<main><div class="container" style="text-align:center; padding: 4rem;"><h2>Loading Data...</h2></div></main>';
    return;
  }
  
  // Protect routes: if not logged in, redirect to login page
  const protectedRoutes = ['#profile', '#session', '#onboarding'];
  if (protectedRoutes.includes(state.currentRoute) && !state.currentUser) {
    state.currentRoute = '#login';
    window.location.hash = '#login';
  }
  
  let viewHtml = '';
  
  switch(state.currentRoute) {
    case '#home':
    case '': viewHtml = HomeView(); break;
    case '#explore': viewHtml = ExploreView(); break;
    case '#journey': viewHtml = CommunityView(); break;
    case '#session': viewHtml = SessionView(); break;
    case '#login': viewHtml = LoginView(); break;
    case '#signup': viewHtml = SignupView(); break;
    case '#onboarding': viewHtml = OnboardingView(); break;
    case '#profile': viewHtml = ProfileView(); break;
    case '#communities': viewHtml = CommunitiesView(); break;
    case '#about': viewHtml = AboutView(); break;
    case '#support': viewHtml = SupportView(); break;
    default: viewHtml = HomeView();
  }

  app.innerHTML = Navbar() + '<main>' + viewHtml + '</main>';

  // Handle page-specific hooks
  setTimeout(() => {
    if (state.currentRoute === '#session') {
      initSessionCall();
    } else {
      cleanupSessionCall();
    }
  }, 100);
};

// Event Listeners
window.addEventListener('hashchange', () => { state.currentRoute = window.location.hash; render(); });

// Initialize
document.addEventListener('DOMContentLoaded', loadData);
