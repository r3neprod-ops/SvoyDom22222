CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  login VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','manager') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
CREATE TABLE leads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  form_data_json JSON,
  source_page TEXT,
  status VARCHAR(64) NOT NULL,
  assigned_user_id INT NULL,
  admin_comment TEXT
);
CREATE TABLE lead_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lead_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME NOT NULL
);
