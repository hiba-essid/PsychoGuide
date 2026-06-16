-- ============================================================================
-- PSYCHOGUIDE DATABASE STRUCTURE
-- ============================================================================
-- Base de données pour stocker les identifiants des utilisateurs
-- et les entrées du carnet de stage

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS psychoguide;
USE psychoguide;

-- ============================================================================
-- TABLE: UTILISATEURS
-- ============================================================================
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  prenom VARCHAR(100),
  nom VARCHAR(100),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: ENTREES_CARNET
-- ============================================================================
CREATE TABLE IF NOT EXISTS entrees_carnet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  type ENUM('note', 'question', 'probleme') NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description LONGTEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  statut ENUM('brouillon', 'publie', 'archive') DEFAULT 'publie',
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  INDEX idx_utilisateur (utilisateur_id),
  INDEX idx_type (type),
  INDEX idx_date (date_creation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: MEDICAMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS medicaments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_medicament VARCHAR(255) NOT NULL,
  classe_therapeutique VARCHAR(100),
  indication VARCHAR(500),
  dosage_usuel VARCHAR(255),
  effets_indesirables LONGTEXT,
  conduites_infirmieres LONGTEXT,
  type_psychotrope ENUM(
    'antipsychotiques_typiques',
    'antipsychotiques_atypiques',
    'antidepresseurs_isrs',
    'antidepresseurs_irsna',
    'benzodiazepines',
    'hypnotiques',
    'thymoregulaturs'
  ),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nom (nom_medicament),
  INDEX idx_type (type_psychotrope)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: CAS_CLINIQUES
-- ============================================================================
CREATE TABLE IF NOT EXISTS cas_cliniques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description LONGTEXT,
  scenario LONGTEXT,
  diagnostic_attendu VARCHAR(255),
  points_cles LONGTEXT,
  difficulte ENUM('facile', 'moyen', 'difficile') DEFAULT 'moyen',
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_titre (titre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: SESSIONS_UTILISATEUR
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions_utilisateur (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  token_session VARCHAR(255) UNIQUE,
  adresse_ip VARCHAR(45),
  user_agent LONGTEXT,
  date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_expiration TIMESTAMP,
  statut ENUM('active', 'expiree', 'revoquee') DEFAULT 'active',
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  INDEX idx_utilisateur (utilisateur_id),
  INDEX idx_token (token_session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERTION DE DONNEES TEST
-- ============================================================================

-- Utilisateur test (motdepasse: test123)
INSERT INTO utilisateurs (email, password, prenom, nom) 
VALUES ('test@example.com', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Jean', 'Dupont');

-- Medicaments test
INSERT INTO medicaments (nom_medicament, classe_therapeutique, indication, dosage_usuel, type_psychotrope) VALUES
('Clozapine', 'Antipsychotiques', 'Schizophrénie résistante', '300-900 mg/jour', 'antipsychotiques_atypiques'),
('Halopéridol', 'Antipsychotiques', 'Psychose', '2-15 mg/jour', 'antipsychotiques_typiques'),
('Sertraline', 'Antidépresseurs ISRS', 'Dépression, Anxiété', '50-200 mg/jour', 'antidepresseurs_isrs'),
('Venlafaxine', 'Antidépresseurs IRSNA', 'Dépression, Anxiété', '75-375 mg/jour', 'antidepresseurs_irsna'),
('Diazépam', 'Benzodiazépines', 'Anxiété', '5-30 mg/jour', 'benzodiazepines'),
('Lithium', 'Thymorégulateurs', 'Trouble bipolaire', '750-1500 mg/jour', 'thymoregulaturs');

-- Cas cliniques test
INSERT INTO cas_cliniques (titre, description, scenario, diagnostic_attendu, difficulte) VALUES
('Cas 1: Dépression sévère', 'Patient présentant une dépression majeure', 'Patient âgé de 45 ans...', 'Trouble dépressif majeur', 'moyen'),
('Cas 2: Crise d\'anxiété', 'Patient en attaque de panique', 'Patient présentant des symptômes...', 'Trouble panique', 'facile'),
('Cas 3: Schizophrénie', 'Présentation atypique', 'Patient avec hallucinations...', 'Schizophrénie', 'difficile');
