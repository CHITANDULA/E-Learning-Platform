
-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DASHBOARDS TABLE
CREATE TABLE IF NOT EXISTS dashboards (
  dashboard_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- CLASSES TABLE
CREATE TABLE IF NOT EXISTS classes (
  class_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  invite_code VARCHAR(10) UNIQUE,
  instructor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  student_id INT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- COURSE MATERIALS
CREATE TABLE IF NOT EXISTS materials (
  material_id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  title VARCHAR(255),
  file_url TEXT,
  folder VARCHAR(255),
  tags TEXT,
  uploaded_by INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  title VARCHAR(255),
  description TEXT,
  due_date DATE,
  resource_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE
);

-- SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
  submission_id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT,
  student_id INT,
  file_url TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- GRADES
CREATE TABLE IF NOT EXISTS grades (
  grade_id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT,
  score DECIMAL(5,2),
  feedback TEXT,
  graded_by INT,
  graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  announcement_id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  message TEXT,
  posted_by INT,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  FOREIGN KEY (posted_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- DISCUSSION THREADS
CREATE TABLE IF NOT EXISTS threads (
  thread_id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  created_by INT,
  title VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT,
  posted_by INT,
  content TEXT,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES threads(thread_id) ON DELETE CASCADE,
  FOREIGN KEY (posted_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- LIVE LECTURES
CREATE TABLE IF NOT EXISTS live_lectures (
  lecture_id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  scheduled_by INT,
  title VARCHAR(255),
  meeting_link TEXT,
  start_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  FOREIGN KEY (scheduled_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- SAMPLE USERS
INSERT INTO users (name, email, password_hash) VALUES
('Musengwa Himoonga', 'musengwa@example.com', 'hashed_pw123'),
('Grace Banda', 'grace@example.com', 'hashed_pw456'),
('Webster Mwansa', 'webster@example.com', 'hashed_pw789');

-- SAMPLE DASHBOARDS
INSERT INTO dashboards (user_id) VALUES (1), (2), (3);

-- SAMPLE CLASS
INSERT INTO classes (title, description, invite_code, instructor_id) VALUES
('Intro to Web Development', 'Learn to build full-stack apps.', 'INV123', 2);

-- SAMPLE ENROLLMENT
INSERT INTO enrollments (class_id, student_id, status) VALUES
(1, 1, 'approved');

-- SAMPLE MATERIAL
INSERT INTO materials (class_id, title, file_url, folder, tags, uploaded_by) VALUES
(1, 'Week 1 Slides', 'materials/week1.pdf', 'Week 1', 'intro,web', 2);

-- SAMPLE ASSIGNMENT
INSERT INTO assignments (class_id, title, description, due_date, resource_url) VALUES
(1, 'HTML Basics', 'Create a static webpage.', '2025-07-31', NULL);

-- SAMPLE SUBMISSION
INSERT INTO submissions (assignment_id, student_id, file_url) VALUES
(1, 1, 'submissions/html_basic.html');

-- SAMPLE GRADE
INSERT INTO grades (submission_id, score, feedback, graded_by) VALUES
(1, 95.5, 'Great job!', 2);

-- SAMPLE ANNOUNCEMENT
INSERT INTO announcements (class_id, message, posted_by) VALUES
(1, 'Welcome to the course!', 2);

-- SAMPLE THREAD
INSERT INTO threads (class_id, created_by, title, content) VALUES
(1, 1, 'Confused about the assignment', 'Can someone explain what to do?');

-- SAMPLE COMMENT
INSERT INTO comments (thread_id, posted_by, content) VALUES
(1, 2, 'Sure! Just follow the example from class.');

-- SAMPLE NOTIFICATION
INSERT INTO notifications (user_id, message) VALUES
(1, 'You have a new grade!');

-- SAMPLE LIVE LECTURE
INSERT INTO live_lectures (class_id, scheduled_by, title, meeting_link, start_time) VALUES
(1, 2, 'Kickoff Lecture', 'https://zoom.us/kickoff', '2025-07-23 10:00:00');
