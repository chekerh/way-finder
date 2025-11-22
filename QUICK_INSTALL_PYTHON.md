# Installation Rapide des Dépendances Python

## 🚀 Pour le Développement Local

### 1. Installer les outils système (macOS)

```bash
brew install python3 imagemagick ffmpeg
```

### 2. Installer les dépendances Python

```bash
cd /Users/malekbenslimen/Desktop/DAM/backend/video_generation
pip3 install -r requirements.txt
```

### 3. Vérifier l'installation

```bash
python3 --version
python3 -c "import moviepy; print('✓ MoviePy installé')"
python3 -c "from PIL import Image; print('✓ Pillow installé')"
```

## ☁️ Pour Render (Production)

Le Dockerfile a été mis à jour pour installer automatiquement Python.

**Aucune action manuelle requise** - Render utilisera le Dockerfile qui installe :
- Python 3
- ImageMagick
- FFmpeg
- Toutes les dépendances Python

**Juste pousser le code** :
```bash
cd backend
git add .
git commit -m "Add Python video generation support"
git push
```

Render détectera automatiquement le Dockerfile et installera tout.

## ⚙️ Configuration Optionnelle

Si vous voulez utiliser Pixabay pour la musique (optionnel) :

1. Créer un compte gratuit sur [Pixabay](https://pixabay.com/api/docs/)
2. Obtenir votre clé API
3. Ajouter dans Render Environment Variables :
   ```
   PIXABAY_API_KEY=votre_clé_ici
   ```

Si vous ne configurez pas Pixabay, le système utilisera la musique de fallback.

## ✅ C'est tout !

Le système est prêt. Les vidéos seront générées automatiquement quand les utilisateurs cliquent sur "Générer" pour une destination.

