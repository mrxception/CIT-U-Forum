-- CIT-U Forum Database Setup
-- Run this script in phpMyAdmin to create the database structure

CREATE DATABASE IF NOT EXISTS citu_forum;
USE citu_forum;

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('Member', 'Default user role'),
('VIP', 'VIP member with additional privileges'),
('Moderator', 'Forum moderator'),
('God', 'Administrator with full access');

-- Badges table
CREATE TABLE badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default badges
INSERT INTO badges (name, icon, description) VALUES
('New Member', '🆕', 'Welcome to the forum!'),
('Active Contributor', '⭐', 'Regular forum participant'),
('Helper', '🤝', 'Helps other students'),
('Scholar', '🎓', 'Academic excellence'),
('Veteran', '🏆', 'Long-time forum member');

-- Colleges table
CREATE TABLE colleges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert CIT-U colleges
INSERT INTO colleges (name, description) VALUES
('Engineering & Architecture', 'College of Engineering and Architecture'),
('Computer Studies', 'College of Computer Studies'),
('Education', 'College of Education'),
('Management & Business', 'College of Management and Business'),
('Arts & Sciences', 'College of Arts and Sciences');

-- Courses table
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    college_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- Insert CIT-U courses
INSERT INTO courses (college_id, name, description) VALUES
-- Engineering & Architecture
(1, 'BSCE', 'Bachelor of Science in Civil Engineering'),
(1, 'BSEE', 'Bachelor of Science in Electrical Engineering'),
(1, 'BSME', 'Bachelor of Science in Mechanical Engineering'),
(1, 'BSCpE', 'Bachelor of Science in Computer Engineering'),
(1, 'BSECE', 'Bachelor of Science in Electronics and Communications Engineering'),
(1, 'BSEnSE', 'Bachelor of Science in Environmental and Sanitary Engineering'),
(1, 'BSChemE', 'Bachelor of Science in Chemical Engineering'),
(1, 'BSArch', 'Bachelor of Science in Architecture'),

-- Computer Studies
(2, 'BSCS', 'Bachelor of Science in Computer Science'),
(2, 'BSIT', 'Bachelor of Science in Information Technology'),
(2, 'BSIS', 'Bachelor of Science in Information Systems'),

-- Education
(3, 'BSEd', 'Bachelor of Secondary Education'),
(3, 'BEEd', 'Bachelor of Elementary Education'),

-- Management & Business
(4, 'BSA', 'Bachelor of Science in Accountancy'),
(4, 'BSBA', 'Bachelor of Science in Business Administration'),
(4, 'BSHM', 'Bachelor of Science in Hospitality Management'),
(4, 'BSTM', 'Bachelor of Science in Tourism Management'),

-- Arts & Sciences
(5, 'BAComm', 'Bachelor of Arts in Communication'),
(5, 'BAPsych', 'Bachelor of Arts in Psychology'),
(5, 'BSBio', 'Bachelor of Science in Biology'),
(5, 'BSPhysics', 'Bachelor of Science in Physics'),
(5, 'BSMath', 'Bachelor of Science in Mathematics');

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT '/placeholder.svg?height=40&width=40',
    role_id INT DEFAULT 1,
    banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Insert admin account (password: admin123)
INSERT INTO users (username, email, hashed_password, role_id) VALUES
('admin', 'admin@cit.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4);

-- User badges junction table
CREATE TABLE user_badges (
    user_id INT,
    badge_id INT,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- User courses junction table
CREATE TABLE user_courses (
    user_id INT,
    course_id INT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Threads table
CREATE TABLE threads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    closed BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Replies table
CREATE TABLE replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    thread_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_reply_id INT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES replies(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    related_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Files/Attachments table
CREATE TABLE attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    thread_id INT NULL,
    reply_id INT NULL,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_threads_course_id ON threads(course_id);
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_created_at ON threads(created_at);
CREATE INDEX idx_replies_thread_id ON replies(thread_id);
CREATE INDEX idx_replies_user_id ON replies(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_status);


-- DROP TABLE IF EXISTS attachments;
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS replies;
-- DROP TABLE IF EXISTS threads;
-- DROP TABLE IF EXISTS user_courses;
-- DROP TABLE IF EXISTS user_badges;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS courses;
-- DROP TABLE IF EXISTS colleges;
-- DROP TABLE IF EXISTS badges;
-- DROP TABLE IF EXISTS roles;

-- -- Roles table
-- CREATE TABLE roles (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(50) NOT NULL UNIQUE,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Insert default roles
-- INSERT INTO roles (name, description) VALUES
-- ('Member', 'Default user role'),
-- ('VIP', 'VIP member with additional privileges'),
-- ('Moderator', 'Forum moderator'),
-- ('God', 'Administrator with full access');

-- -- Badges table
-- CREATE TABLE badges (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(100) NOT NULL,
--     icon VARCHAR(255),
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Insert default badges
-- INSERT INTO badges (name, icon, description) VALUES
-- ('New Member', '🆕', 'Welcome to the forum!'),
-- ('Active Contributor', '⭐', 'Regular forum participant'),
-- ('Helper', '🤝', 'Helps other students'),
-- ('Scholar', '🎓', 'Academic excellence'),
-- ('Veteran', '🏆', 'Long-time forum member');

-- -- Colleges table
-- CREATE TABLE colleges (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(255) NOT NULL,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Insert CIT-U colleges
-- INSERT INTO colleges (name, description) VALUES
-- ('Engineering & Architecture', 'College of Engineering and Architecture'),
-- ('Computer Studies', 'College of Computer Studies'),
-- ('Education', 'College of Education'),
-- ('Management & Business', 'College of Management and Business'),
-- ('Arts & Sciences', 'College of Arts and Sciences');

-- -- Courses table
-- CREATE TABLE courses (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     college_id INT NOT NULL,
--     name VARCHAR(255) NOT NULL,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
-- );

-- -- Insert CIT-U courses
-- INSERT INTO courses (college_id, name, description) VALUES
-- -- Engineering & Architecture
-- (1, 'BSCE', 'Bachelor of Science in Civil Engineering'),
-- (1, 'BSEE', 'Bachelor of Science in Electrical Engineering'),
-- (1, 'BSME', 'Bachelor of Science in Mechanical Engineering'),
-- (1, 'BSCpE', 'Bachelor of Science in Computer Engineering'),
-- (1, 'BSECE', 'Bachelor of Science in Electronics and Communications Engineering'),
-- (1, 'BSEnSE', 'Bachelor of Science in Environmental and Sanitary Engineering'),
-- (1, 'BSChemE', 'Bachelor of Science in Chemical Engineering'),
-- (1, 'BSArch', 'Bachelor of Science in Architecture'),
-- -- Computer Studies
-- (2, 'BSCS', 'Bachelor of Science in Computer Science'),
-- (2, 'BSIT', 'Bachelor of Science in Information Technology'),
-- (2, 'BSIS', 'Bachelor of Science in Information Systems'),
-- -- Education
-- (3, 'BSEd', 'Bachelor of Secondary Education'),
-- (3, 'BEEd', 'Bachelor of Elementary Education'),
-- -- Management & Business
-- (4, 'BSA', 'Bachelor of Science in Accountancy'),
-- (4, 'BSBA', 'Bachelor of Science in Business Administration'),
-- (4, 'BSHM', 'Bachelor of Science in Hospitality Management'),
-- (4, 'BSTM', 'Bachelor of Science in Tourism Management'),
-- -- Arts & Sciences
-- (5, 'BAComm', 'Bachelor of Arts in Communication'),
-- (5, 'BAPsych', 'Bachelor of Arts in Psychology'),
-- (5, 'BSBio', 'Bachelor of Science in Biology'),
-- (5, 'BSPhysics', 'Bachelor of Science in Physics'),
-- (5, 'BSMath', 'Bachelor of Science in Mathematics');

-- -- Users table
-- CREATE TABLE users (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     username VARCHAR(50) NOT NULL UNIQUE,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     hashed_password VARCHAR(255) NOT NULL,
--     avatar VARCHAR(255) DEFAULT '/placeholder.svg?height=40&width=40',
--     role_id INT DEFAULT 1,
--     banned BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     last_login TIMESTAMP NULL,
--     FOREIGN KEY (role_id) REFERENCES roles(id)
-- );

-- -- Insert admin account (password: admin123)
-- INSERT INTO users (username, email, hashed_password, role_id) VALUES
-- ('admin', 'admin@cit.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4);

-- -- User badges junction table
-- CREATE TABLE user_badges (
--     user_id INT,
--     badge_id INT,
--     awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (user_id, badge_id),
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
-- );

-- -- User courses junction table
-- CREATE TABLE user_courses (
--     user_id INT,
--     course_id INT,
--     enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (user_id, course_id),
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
-- );

-- -- Threads table
-- CREATE TABLE threads (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     course_id INT NOT NULL,
--     user_id INT NOT NULL,
--     title VARCHAR(255) NOT NULL,
--     content TEXT NOT NULL,
--     views INT DEFAULT 0,
--     closed BOOLEAN DEFAULT FALSE,
--     pinned BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP NULL,
--     FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- Replies table
-- CREATE TABLE replies (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     thread_id INT NOT NULL,
--     user_id INT NOT NULL,
--     parent_reply_id INT NULL,
--     content TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (parent_reply_id) REFERENCES replies(id) ON DELETE CASCADE
-- );

-- -- Notifications table
-- CREATE TABLE notifications (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     user_id INT NOT NULL,
--     type VARCHAR(50) NOT NULL,
--     message TEXT NOT NULL,
--     read_status BOOLEAN DEFAULT FALSE,
--     related_id INT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- Files/Attachments table
-- CREATE TABLE attachments (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     thread_id INT NULL,
--     reply_id INT NULL,
--     user_id INT NOT NULL,
--     filename VARCHAR(255) NOT NULL,
--     original_name VARCHAR(255) NOT NULL,
--     file_size INT NOT NULL,
--     mime_type VARCHAR(100) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
--     FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- Create indexes for better performance
-- CREATE INDEX idx_threads_course_id ON threads(course_id);
-- CREATE INDEX idx_threads_user_id ON threads(user_id);
-- CREATE INDEX idx_threads_created_at ON threads(created_at);
-- CREATE INDEX idx_replies_thread_id ON replies(thread_id);
-- CREATE INDEX idx_replies_user_id ON replies(user_id);
-- CREATE INDEX idx_notifications_user_id ON notifications(user_id);
-- CREATE INDEX idx_notifications_read ON notifications(read_status);