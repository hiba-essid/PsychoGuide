// ============================================================================
// PSYCHOGUIDE SERVER - NODE.JS/EXPRESS + SQLITE
// ============================================================================

require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// ============================================================================
// CONFIGURATION
// ============================================================================
const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_changez_en_production';
const DB_PATH = path.join(__dirname, 'psychoguide.db');

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

// CSP and Security Headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net data:; connect-src 'self' http://localhost:* https://cdn.jsdelivr.net; img-src 'self' data: https:; frame-ancestors 'none';");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.static(path.join(__dirname)));

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================
let db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erreur ouverture base de données:', err);
  } else {
    console.log('✓ Base de données SQLite connectée');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Table utilisateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      prenom TEXT,
      nom TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      statut TEXT DEFAULT 'actif'
    )
  `);

  // Table entrees carnet
  db.run(`
    CREATE TABLE IF NOT EXISTS entrees_carnet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      utilisateur_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      titre TEXT NOT NULL,
      description TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
      statut TEXT DEFAULT 'publie',
      FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
    )
  `);

  // Table sessions
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      utilisateur_id INTEGER NOT NULL,
      token TEXT UNIQUE,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_expiration DATETIME,
      statut TEXT DEFAULT 'active',
      FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
    )
  `);

  console.log('✓ Tables créées/vérifiées');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function sendResponse(res, success, message, data = null, statusCode = 200) {
  if (success) {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  } else {
    res.status(statusCode === 200 ? 400 : statusCode).json({
      success: false,
      message,
      data: null
    });
  }
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return sendResponse(res, false, 'Token manquant', null);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    sendResponse(res, false, 'Token invalide', null);
  }
}

// ============================================================================
// ROUTES - ROOT
// ============================================================================

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'PsychoGuide(2).html'));
});

// ============================================================================
// ROUTES - AUTHENTICATION
// ============================================================================

// Register - Inscription
app.post('/api/auth/register', async (req, res) => {
  const { email, password, prenom, nom } = req.body;

  if (!email || !password) {
    return sendResponse(res, false, 'Email et mot de passe requis');
  }

  if (password.length < 6) {
    return sendResponse(res, false, 'Le mot de passe doit contenir au moins 6 caractères');
  }

  // Vérifier si l'email existe
  db.get('SELECT id FROM utilisateurs WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return sendResponse(res, false, 'Erreur base de données: ' + err.message);
    }

    if (row) {
      return sendResponse(res, false, 'Cet email est déjà utilisé');
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    db.run(
      'INSERT INTO utilisateurs (email, password, prenom, nom) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, prenom || '', nom || ''],
      function(err) {
        if (err) {
          return sendResponse(res, false, 'Erreur création utilisateur');
        }

        sendResponse(res, true, 'Inscription réussie! Veuillez vous connecter.', {
          utilisateur_id: this.lastID,
          email
        });
      }
    );
  });
});

// Login - Connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, false, 'Email et mot de passe requis');
  }

  db.get('SELECT id, email, password, prenom, nom FROM utilisateurs WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return sendResponse(res, false, 'Erreur base de données');
    }

    if (!user) {
      return sendResponse(res, false, 'Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendResponse(res, false, 'Email ou mot de passe incorrect');
    }

    // Générer le token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    // Sauvegarder la session
    db.run(
      'INSERT INTO sessions (utilisateur_id, token, date_expiration) VALUES (?, ?, datetime("now", "+24 hours"))',
      [user.id, token],
      (err) => {
        if (err) console.error('Erreur sauvegarde session:', err);

        sendResponse(res, true, 'Connexion réussie', {
          utilisateur_id: user.id,
          email: user.email,
          prenom: user.prenom,
          nom: user.nom,
          token
        });
      }
    );
  });
});

// Verify Token
app.post('/api/auth/verify', verifyToken, (req, res) => {
  db.get('SELECT id, email, prenom, nom FROM utilisateurs WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return sendResponse(res, false, 'Utilisateur non trouvé');
    }

    sendResponse(res, true, 'Session valide', user);
  });
});

// Logout
app.post('/api/auth/logout', verifyToken, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  db.run('UPDATE sessions SET statut = ? WHERE token = ?', ['revoquee', token], (err) => {
    if (err) console.error('Erreur logout:', err);
    sendResponse(res, true, 'Déconnexion réussie');
  });
});

// ============================================================================
// ROUTES - CARNET (PROTECTED)
// ============================================================================

// Créer une entrée
app.post('/api/carnet', verifyToken, (req, res) => {
  const { type, titre, description } = req.body;

  if (!['note', 'question', 'probleme'].includes(type)) {
    return sendResponse(res, false, 'Type invalide');
  }

  if (!titre) {
    return sendResponse(res, false, 'Le titre est requis');
  }

  db.run(
    'INSERT INTO entrees_carnet (utilisateur_id, type, titre, description) VALUES (?, ?, ?, ?)',
    [req.userId, type, titre, description || ''],
    function(err) {
      if (err) {
        return sendResponse(res, false, 'Erreur création entrée');
      }

      sendResponse(res, true, 'Entrée créée avec succès', {
        id: this.lastID,
        type,
        titre,
        description: description || '',
        date_creation: new Date().toISOString()
      });
    }
  );
});

// Récupérer les entrées
app.get('/api/carnet', verifyToken, (req, res) => {
  db.all(
    'SELECT id, type, titre, description, date_creation, statut FROM entrees_carnet WHERE utilisateur_id = ? AND statut != ? ORDER BY date_creation DESC',
    [req.userId, 'archive'],
    (err, rows) => {
      if (err) {
        return sendResponse(res, false, 'Erreur récupération entrées');
      }

      sendResponse(res, true, 'Entrées récupérées', rows || []);
    }
  );
});

// Modifier une entrée
app.put('/api/carnet/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { type, titre, description } = req.body;

  // Vérifier que l'entrée appartient à l'utilisateur
  db.get('SELECT utilisateur_id FROM entrees_carnet WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      return sendResponse(res, false, 'Entrée non trouvée');
    }

    if (row.utilisateur_id !== req.userId) {
      return sendResponse(res, false, 'Accès non autorisé');
    }

    db.run(
      'UPDATE entrees_carnet SET type = ?, titre = ?, description = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?',
      [type, titre, description || '', id],
      (err) => {
        if (err) {
          return sendResponse(res, false, 'Erreur modification');
        }

        sendResponse(res, true, 'Entrée modifiée avec succès');
      }
    );
  });
});

// Supprimer une entrée
app.delete('/api/carnet/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  // Vérifier que l'entrée appartient à l'utilisateur
  db.get('SELECT utilisateur_id FROM entrees_carnet WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      return sendResponse(res, false, 'Entrée non trouvée');
    }

    if (row.utilisateur_id !== req.userId) {
      return sendResponse(res, false, 'Accès non autorisé');
    }

    db.run('DELETE FROM entrees_carnet WHERE id = ?', [id], (err) => {
      if (err) {
        return sendResponse(res, false, 'Erreur suppression');
      }

      sendResponse(res, true, 'Entrée supprimée avec succès');
    });
  });
});

// ============================================================================
// SERVER START
// ============================================================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🧠 PsychoGuide Server Started Successfully 🧠         ║
╠════════════════════════════════════════════════════════════════╣
║  Server:  http://localhost:${PORT}                              
║  Database: ${DB_PATH}
║  Status: ✓ Opérationnel                                        
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
