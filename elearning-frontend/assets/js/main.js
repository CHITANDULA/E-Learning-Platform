// Dashboard logic for creating/joining classes and showing user info
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('userToken');
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

  if (!token || !user.user_id) {
    window.location.href = 'login.html';
    return;
  }

  const welcomeEl = document.getElementById('welcomeMessage');
  const classListEl = document.getElementById('classList');
  const createForm = document.getElementById('createClassForm');
  const joinForm = document.getElementById('joinClassForm');
  const logoutBtn = document.getElementById('logout');

  welcomeEl.textContent = `Welcome, ${user.name}!`;

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    window.location.href = 'login.html';
  });

  async function loadClasses() {
    try {
      const res = await fetch('http://localhost:5000/api/classes/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      classListEl.innerHTML = '';
      data.forEach(cls => {
        const li = document.createElement('li');
        li.textContent = `${cls.title} (${cls.invite_code})`;
        classListEl.appendChild(li);
      });
    } catch (err) {
      console.error('Load classes error', err);
    }
  }

  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('classTitle').value.trim();
    const description = document.getElementById('classDescription').value.trim();
    try {
      await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });
      createForm.reset();
      loadClasses();
    } catch (err) {
      console.error('Create class error', err);
    }
  });

  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inviteCode = document.getElementById('inviteCode').value.trim();
    try {
      await fetch('http://localhost:5000/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode })
      });
      joinForm.reset();
      loadClasses();
    } catch (err) {
      console.error('Join class error', err);
    }
  });

  loadClasses();
});
