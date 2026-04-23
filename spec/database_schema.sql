-- MySQL schema for Obat Reminder App
-- Note: this SQL is framework-agnostic and can be translated to Laravel migrations.

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role ENUM('APOTEKER','PASIEN') NOT NULL,
  name VARCHAR(100) NOT NULL,
  gender ENUM('L','P') NULL,
  age INT NULL,
  birth_date DATE NULL,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE medicines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  brand VARCHAR(120) NOT NULL,
  usage_text TEXT NOT NULL,
  how_to_use TEXT NOT NULL,
  warning_text TEXT NOT NULL,
  side_effects_text TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_medicine_name_brand (name, brand)
);

CREATE TABLE patient_medicine_schedules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  medicine_id BIGINT UNSIGNED NOT NULL,
  pharmacist_id BIGINT UNSIGNED NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  medicine_type VARCHAR(50) NOT NULL,
  intake_time TIME NOT NULL,
  quantity_given INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedule_patient FOREIGN KEY (patient_id) REFERENCES users(id),
  CONSTRAINT fk_schedule_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  CONSTRAINT fk_schedule_pharmacist FOREIGN KEY (pharmacist_id) REFERENCES users(id)
);

CREATE TABLE medicine_intake_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  schedule_id BIGINT UNSIGNED NOT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  intake_date DATE NOT NULL,
  intake_time TIME NOT NULL,
  status ENUM('SUDAH_MINUM','TIDAK_MINUM') NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_schedule FOREIGN KEY (schedule_id) REFERENCES patient_medicine_schedules(id),
  CONSTRAINT fk_log_patient FOREIGN KEY (patient_id) REFERENCES users(id),
  UNIQUE KEY uk_log_unique_status (schedule_id, patient_id, intake_date)
);

CREATE INDEX idx_schedule_patient_active ON patient_medicine_schedules(patient_id, is_active);
CREATE INDEX idx_log_patient_date ON medicine_intake_logs(patient_id, intake_date);
