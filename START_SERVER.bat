@echo off
REM Démarrer PsychoGuide Server
REM Script batch pour Windows

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              Demarrage de PsychoGuide Server                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if errorlevel 1 (
    echo ✗ Node.js n'est pas installe!
    echo Telechargez-le sur: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js trouve
echo.

REM Vérifier si node_modules existe
if not exist "node_modules" (
    echo ✓ Installation des dependances...
    call npm install
    echo.
)

REM Démarrer le serveur
echo ✓ Demarrage du serveur...
echo.
echo Ouvrez votre navigateur et allez a: http://localhost:8000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm start

pause
