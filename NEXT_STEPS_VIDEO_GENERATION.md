# 📋 Prochaines Étapes - Génération Vidéo AI

## ✅ Ce qui est déjà fait

1. ✅ **Schéma MongoDB** - Créé pour stocker les vidéos par destination
2. ✅ **Services backend** - Tous créés et intégrés
3. ✅ **API Endpoints** - Disponibles et documentés
4. ✅ **Script Python** - Générateur vidéo avec Ken Burns effect
5. ✅ **Dockerfile** - Mis à jour pour installer Python et dépendances
6. ✅ **Intégration Android** - UI et ViewModels créés
7. ✅ **Dépendances locales** - Installées sur votre machine

## 🚀 Étapes Restantes

### 1. **Clé API Pixabay (Optionnel mais Recommandé)**

Dans Render, ajouter la variable d'environnement :
```
PIXABAY_API_KEY=votre_clé_ici
```

**Pour obtenir une clé :**
1. Créer un compte gratuit sur [Pixabay](https://pixabay.com/api/docs/)
2. Obtenir la clé API
3. L'ajouter dans Render > Environment Variables

**Note:** Si vous ne configurez pas Pixabay, le système utilisera la musique de fallback, mais c'est moins optimal.

---

### 2. **Important : Stockage Cloud pour Production**

⚠️ **CRITIQUE sur Render :** Le système de fichiers est **éphémère** (tous les fichiers sont supprimés à chaque redéploiement).

**Solutions recommandées :**

#### Option A : Upload vers ImgBB (Déjà utilisé pour les images)
Modifier `destination-video.service.ts` pour uploader les vidéos vers ImgBB après génération.

#### Option B : Upload vers Cloudinary/S3
Intégrer Cloudinary ou AWS S3 pour stocker les vidéos de manière permanente.

#### Option C : Utiliser un stockage Render Persistent
Si disponible, configurer un volume persistant sur Render.

**Action requise :** 
- Modifier `destination-video.service.ts` ligne ~186 pour uploader la vidéo vers un cloud storage
- Ou accepter que les vidéos soient perdues à chaque redéploiement (OK pour développement)

---

### 3. **Tester le Script Python**

Vérifier que le script Python fonctionne :

```bash
cd backend/video_generation
python3 video_generator.py '{"user_id":"test","destination":"Paris","image_urls":["https://i.pravatar.cc/1080"],"output_dir":"/tmp"}'
```

**Attendu :** Un fichier JSON avec `success: true` et un chemin de vidéo.

---

### 4. **Vérifier les Permissions du Script**

Sur Render, le script Python doit être exécutable :

```bash
chmod +x video_generation/video_generator.py
```

Cela sera fait automatiquement par le Dockerfile si nécessaire.

---

### 5. **Tester les Endpoints API**

Une fois déployé sur Render :

```bash
# 1. Générer une vidéo
POST https://wayfinder-api-w92x.onrender.com/api/users/{userId}/destinations/Paris/generate-video
Authorization: Bearer {token}

# 2. Vérifier le statut
GET https://wayfinder-api-w92x.onrender.com/api/users/{userId}/destinations/Paris/video-status
Authorization: Bearer {token}

# 3. Lister les destinations
GET https://wayfinder-api-w92x.onrender.com/api/users/{userId}/destinations
Authorization: Bearer {token}
```

---

### 6. **Tester depuis l'App Android**

1. Ouvrir l'écran "Voyages partagés"
2. Vérifier que la section "Vidéos par destination" apparaît
3. Cliquer sur "Générer" pour une destination
4. Vérifier que le statut passe à "processing"
5. Attendre quelques minutes (polling toutes les 5 secondes)
6. Vérifier que la vidéo est générée

---

### 7. **Optimisations Futures (Optionnel)**

- **Cache des vidéos** : Ne pas régénérer si déjà existante
- **Compression vidéo** : Réduire la taille des fichiers
- **Thumbnails** : Générer des miniatures pour l'affichage
- **Queue système** : Utiliser BullMQ pour gérer plusieurs générations en parallèle
- **Notifications** : Notifier l'utilisateur quand la vidéo est prête

---

## ⚠️ Points d'Attention

### Sur Render (Production)

1. **Filesystem éphémère** : Les vidéos seront perdues à chaque redéploiement
2. **Timeouts** : La génération vidéo peut prendre 5-10 minutes
3. **Ressources** : Les instances gratuites peuvent être lentes
4. **Python path** : Vérifier que `python3` est dans le PATH sur Render

### Local (Développement)

1. **ImageMagick** : Doit être installé pour le rendu de texte
2. **FFmpeg** : Doit être installé pour le traitement vidéo
3. **Espace disque** : Les vidéos peuvent être volumineuses (50-100MB chacune)

---

## 📝 Checklist Finale

- [ ] Clé API Pixabay ajoutée dans Render (optionnel)
- [ ] **Stockage cloud configuré** (CRITIQUE pour production)
- [ ] Script Python testé localement
- [ ] Endpoints API testés sur Render
- [ ] App Android testée avec génération réelle
- [ ] Gestion d'erreurs vérifiée (pas d'images, timeout, etc.)

---

## 🎯 Priorité Immédiate

**La seule étape critique avant déploiement :**
1. ✅ Clé API Pixabay (optionnel - peut attendre)
2. ⚠️ **Configuration du stockage cloud** (important pour production)

Le reste peut être testé après le déploiement !

