# Intégration Kaggle avec Android - Vérification de Cohérence

## Architecture du Flux

```
Android App
    ↓ (appelle regenerateVideo)
Backend API
    ↓ (choisit service: Cloudinary → Replicate → Kaggle → etc.)
Service de Génération Vidéo (Kaggle)
    ↓ (génère vidéo)
Backend sauvegarde video_url et video_status = 'completed'
    ↓
Android récupère journey avec videoUrl et videoStatus
    ↓
Android affiche la vidéo si videoStatus == "completed"
```

## Vérification de Cohérence

### ✅ 1. Modèles de Données

**Backend (MongoDB Schema):**
```typescript
video_url?: string;  // URL de la vidéo générée
video_status: 'pending' | 'processing' | 'completed' | 'failed';
```

**Android (Kotlin Model):**
```kotlin
@SerialName("video_url") val videoUrl: String? = null,
@SerialName("video_status") val videoStatus: String = "pending",
```

✅ **Cohérent** : Les noms de champs correspondent (`video_url` ↔ `videoUrl`, `video_status` ↔ `videoStatus`)

### ✅ 2. Statuts Vidéo

**Backend utilise:**
- `pending` - Pas encore généré
- `processing` - En cours de génération
- `completed` - Génération terminée, vidéo disponible
- `failed` - Échec de la génération

**Android vérifie:**
- `videoStatus == "completed"` pour afficher la vidéo
- `videoStatus == "processing"` pour afficher un loader
- `videoStatus == "failed"` pour afficher une erreur

✅ **Cohérent** : Les statuts correspondent

### ✅ 3. Format de l'URL Vidéo

**Backend retourne:**
- Une URL HTTP/HTTPS accessible publiquement
- Format: `https://...` ou `http://...`

**Android attend:**
- Une URL valide pour `VideoView.setVideoURI(Uri.parse(videoUrl))`
- Format compatible avec Android MediaPlayer

✅ **Cohérent** : Android peut lire n'importe quelle URL vidéo valide

### ⚠️ 4. Notebook Kaggle - Point Important

**Problème potentiel :** Le notebook Kaggle génère la vidéo dans `/kaggle/working/`, mais cette URL n'est pas directement accessible depuis l'extérieur.

**Solutions :**

#### Option A : Upload vers Cloud Storage (Recommandé)
Modifiez le notebook Kaggle pour uploader la vidéo vers un service de stockage accessible :

```python
# Dans votre notebook Kaggle, après génération de la vidéo
import requests

def upload_video_to_storage(video_path, public_url):
    """Upload video to a publicly accessible storage"""
    # Option 1: Upload to Cloudinary
    # Option 2: Upload to AWS S3
    # Option 3: Upload to Google Cloud Storage
    # Option 4: Upload to votre propre serveur
    pass

# Après génération
video_path = create_video_from_images(images, output_path)
public_video_url = upload_video_to_storage(video_path, "https://your-storage.com")
print(f"Video URL: {public_video_url}")
```

#### Option B : Utiliser Kaggle Datasets (Complexe)
1. Sauvegarder la vidéo dans un dataset Kaggle
2. Récupérer l'URL publique du dataset
3. Accéder à la vidéo via l'URL du dataset

#### Option C : Intégration Backend Directe
Le backend peut :
1. Exécuter le notebook Kaggle via API
2. Télécharger la vidéo depuis `/kaggle/working/`
3. Uploader la vidéo vers votre propre storage (Cloudinary, S3, etc.)
4. Retourner l'URL publique

### ✅ 5. Flux Complet

**Étape 1 : Android déclenche la génération**
```kotlin
journeyViewModel.regenerateVideo(journey.id)
```

**Étape 2 : Backend traite la requête**
```typescript
// Backend met video_status = 'processing'
journey.video_status = 'processing';
await journey.save();

// Backend appelle Kaggle (ou autre service)
const response = await aiVideoService.generateVideo(payload);

// Backend met à jour avec l'URL
journey.video_url = response.videoUrl;
journey.video_status = 'completed';
await journey.save();
```

**Étape 3 : Android récupère le statut**
```kotlin
// Android poll le backend ou recharge les journeys
val journey = journeyViewModel.getJourney(id)
// journey.videoStatus = "completed"
// journey.videoUrl = "https://..."
```

**Étape 4 : Android affiche la vidéo**
```kotlin
if (journey.videoStatus == "completed" && !journey.videoUrl.isNullOrEmpty()) {
    // Afficher la vidéo
    VideoView.setVideoURI(Uri.parse(journey.videoUrl))
}
```

✅ **Cohérent** : Le flux est correct

## Points d'Attention

### 1. URL Publique Requise
⚠️ **Important** : Le notebook Kaggle doit retourner une URL **publiquement accessible**. Les fichiers dans `/kaggle/working/` ne sont pas directement accessibles depuis l'extérieur.

**Solution recommandée :** Modifier le notebook pour uploader la vidéo vers Cloudinary ou un autre service de stockage.

### 2. Format Vidéo
✅ Android supporte MP4 avec codec H.264 (ce que le notebook génère)

### 3. Timeout
⚠️ La génération vidéo peut prendre du temps (plusieurs minutes). Le backend gère cela avec BullMQ (queue asynchrone).

### 4. Polling Android
✅ Android recharge automatiquement les journeys pour voir les mises à jour de statut.

## Recommandations

1. **Pour une intégration simple** : Utilisez **Cloudinary** au lieu de Kaggle
   - Plus simple à configurer
   - URLs publiques automatiques
   - Pas besoin de notebook personnalisé

2. **Si vous utilisez Kaggle** : 
   - Modifiez le notebook pour uploader la vidéo vers un storage public
   - Ou configurez le backend pour télécharger et re-uploader la vidéo

3. **Test de cohérence** :
   - Testez que `videoStatus` passe de `pending` → `processing` → `completed`
   - Vérifiez que `videoUrl` est une URL valide et accessible
   - Testez la lecture vidéo dans Android

## Conclusion

✅ **Le système est cohérent** entre Android et le backend.

⚠️ **Action requise** : S'assurer que le notebook Kaggle retourne une URL publiquement accessible, ou modifier le backend pour gérer l'upload de la vidéo Kaggle vers un storage public.

