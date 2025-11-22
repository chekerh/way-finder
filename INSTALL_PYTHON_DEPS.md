# Installation des Dépendances Python pour la Génération Vidéo

Ce guide explique comment installer les dépendances Python nécessaires pour le générateur de vidéos AI.

## 📋 Prérequis

1. **Python 3.8+** (recommandé 3.10+)
2. **pip** (gestionnaire de paquets Python)
3. **ImageMagick** (pour le rendu de texte dans les vidéos)
4. **FFmpeg** (pour le traitement vidéo - requis par MoviePy)

## 🖥️ Installation Locale (macOS/Linux)

### 1. Vérifier que Python est installé

```bash
python3 --version
# Devrait afficher: Python 3.8.x ou supérieur
```

Si Python n'est pas installé :
- **macOS**: `brew install python3`
- **Linux**: `sudo apt-get install python3 python3-pip`

### 2. Installer ImageMagick et FFmpeg

#### macOS
```bash
brew install imagemagick ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install imagemagick ffmpeg
```

#### Linux (CentOS/RHEL)
```bash
sudo yum install ImageMagick ffmpeg
```

### 3. Installer les dépendances Python

```bash
cd backend/video_generation
pip3 install -r requirements.txt
```

**Ou en utilisant un environnement virtuel (recommandé)** :

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
cd video_generation
pip install -r requirements.txt
```

### 4. Vérifier l'installation

```bash
python3 -c "import moviepy; print('MoviePy OK')"
python3 -c "from PIL import Image; print('Pillow OK')"
python3 -c "import requests; print('Requests OK')"
```

## 🐳 Installation avec Docker

Le Dockerfile a été mis à jour pour installer automatiquement Python et les dépendances.

```bash
cd backend
docker build -t wayfinder-backend .
```

Ou avec Docker Compose :
```bash
docker compose up -d --build
```

## ☁️ Installation sur Render (Production)

Render utilise des conteneurs Docker, donc les dépendances sont installées via le Dockerfile.

**Cependant, pour les instances non-Docker sur Render** :

### Option 1: Utiliser un Build Command personnalisé

Dans les paramètres Render de votre service, ajoutez un **Build Command** :

```bash
npm install && npm run build && pip3 install --user -r video_generation/requirements.txt
```

### Option 2: Utiliser un Script de Build

Créez `backend/build.sh` :

```bash
#!/bin/bash
set -e

# Install Node.js dependencies
npm install

# Install Python dependencies
pip3 install --user -r video_generation/requirements.txt

# Build TypeScript
npm run build
```

Puis configurez dans Render :
- **Build Command**: `chmod +x build.sh && ./build.sh`
- **Start Command**: `node dist/main.js`

### Option 3: Utiliser un Dockerfile (Recommandé)

Render peut utiliser le Dockerfile directement :
1. Dans Render, allez dans **Settings** > **Docker**
2. Sélectionnez **Dockerfile Path**: `backend/Dockerfile`
3. Render utilisera automatiquement le Dockerfile avec Python

## ✅ Vérification

Pour tester que tout fonctionne :

```bash
cd backend/video_generation
python3 video_generator.py '{"user_id":"test","destination":"Paris","image_urls":["https://example.com/image.jpg"],"output_dir":"/tmp"}'
```

**Note**: Vous aurez besoin d'au moins une image valide dans l'URL pour tester complètement.

## 🔧 Dépannage

### Erreur: "MoviePy requires ImageMagick"

```bash
# macOS
brew install imagemagick

# Linux
sudo apt-get install imagemagick
```

Puis vérifiez :
```bash
convert -version
```

### Erreur: "FFmpeg not found"

```bash
# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg
```

### Erreur: "Permission denied" lors de l'installation pip

Utilisez `--user` :
```bash
pip3 install --user -r requirements.txt
```

Ou utilisez un environnement virtuel :
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📝 Notes Importantes

1. **ImageMagick** est requis pour `TextClip` (affichage de texte dans les vidéos)
2. **FFmpeg** est requis par MoviePy pour le traitement vidéo
3. Sur **Render**, les fichiers sont stockés dans un système de fichiers éphémère
4. Les vidéos générées doivent être uploadées vers un stockage cloud (S3, Cloudinary, etc.) pour production

## 🔗 Liens Utiles

- [MoviePy Documentation](https://zulko.github.io/moviepy/)
- [ImageMagick Installation](https://imagemagick.org/script/download.php)
- [FFmpeg Installation](https://ffmpeg.org/download.html)

