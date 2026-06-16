#!/bin/bash
# Script de démarrage pour Mac/Linux

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🧠 PsychoGuide Server - Démarrage                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "✗ Node.js n'est pas installé!"
    echo "  Téléchargez-le sur: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js trouvé: $(node --version)"
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "✓ Installation des dépendances..."
    npm install
    echo ""
fi

# Démarrer le serveur
echo "✓ Démarrage du serveur..."
echo ""
echo "  Ouvrez votre navigateur: http://localhost:8000"
echo ""
echo "  Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm start
