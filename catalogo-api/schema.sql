-- CatalogoHub Database Schema
-- Ejecutar en la base de datos del VPS: u551009731_catalogos (o crear nueva DB)

CREATE TABLE IF NOT EXISTS marcas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  descripcion TEXT,
  activa TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS temporadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  anio INT NOT NULL,
  descripcion VARCHAR(255),
  activa TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catalogos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  marca_id INT NOT NULL,
  temporada_id INT NOT NULL,
  pdf_url VARCHAR(500) NOT NULL,
  portada_url VARCHAR(500),
  total_paginas INT DEFAULT 0,
  visualizaciones INT DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  es_nuevo TINYINT(1) DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE CASCADE,
  FOREIGN KEY (temporada_id) REFERENCES temporadas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de ejemplo
INSERT IGNORE INTO marcas (nombre, slug, descripcion) VALUES
  ('Marca Elite Gold', 'marca-elite-gold', 'Colecciones de lujo premium'),
  ('Elegance Studio', 'elegance-studio', 'Diseño minimalista y elegante'),
  ('Trendsetters Inc', 'trendsetters-inc', 'Moda urbana y contemporánea');

INSERT IGNORE INTO temporadas (nombre, slug, anio, descripcion) VALUES
  ('Primavera-Verano 2026', 'pv-2026', 2026, 'Colección Primavera Verano 2026'),
  ('Otoño-Invierno 2025', 'oi-2025', 2025, 'Colección Otoño Invierno 2025'),
  ('Primavera-Verano 2025', 'pv-2025', 2025, 'Colección Primavera Verano 2025'),
  ('Otoño-Invierno 2024', 'oi-2024', 2024, 'Colección Otoño Invierno 2024');

-- Admin por defecto: admin@catalogohub.com / Admin123!
-- Password hash generado con bcrypt rounds=10
INSERT IGNORE INTO admins (nombre, email, password_hash) VALUES
  ('Administrador', 'admin@catalogohub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');
