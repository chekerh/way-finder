# Comment obtenir les credentials pour la génération vidéo

## 1. Cloudinary (⭐ RECOMMANDÉ pour les montages vidéo)

### Étape 1 : Créer un compte Cloudinary
1. Allez sur https://cloudinary.com
2. Cliquez sur **"Sign Up for Free"** (gratuit)
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email

### Étape 2 : Obtenir les credentials
1. Une fois connecté, allez sur le **Dashboard** : https://cloudinary.com/console
2. Sur la page d'accueil du dashboard, vous verrez un tableau avec vos informations :
   ```
   Cloud name: votre_cloud_name
   API Key: votre_api_key
   API Secret: votre_api_secret
   ```
3. **Copiez ces 3 valeurs** - elles sont affichées directement sur le dashboard

### Étape 3 : Ajouter dans Render
Dans votre projet Render, ajoutez ces variables d'environnement :
```
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

**Note :** Le plan gratuit offre :
- 25 GB de stockage
- 25 GB de bande passante/mois
- Parfait pour commencer

---

## 2. Kaggle (Pour les modèles personnalisés)

### Étape 1 : Créer un compte Kaggle
1. Allez sur https://www.kaggle.com
2. Cliquez sur **"Sign Up"** ou **"Register"**
3. Créez un compte (gratuit)
4. Vérifiez votre email

### Étape 2 : Obtenir KAGGLE_USERNAME
1. Une fois connecté, votre **username** est visible :
   - En haut à droite de la page (votre profil)
   - Ou dans l'URL : `https://www.kaggle.com/votre_username`
2. **Copiez votre username**

### Étape 3 : Obtenir KAGGLE_KEY (API Token)
**⚠️ IMPORTANT :** Kaggle utilise maintenant un nouveau système d'API Tokens (recommandé) au lieu de l'ancien `kaggle.json`.

#### Option A : Utiliser les nouveaux API Tokens (Recommandé)
1. Allez sur **Settings** : https://www.kaggle.com/settings
2. Dans la section **"API Tokens (Recommended)"**
3. Cliquez sur **"Generate New Token"**
4. Donnez un nom à votre token (ex: "wayfinder-video-generation")
5. Le token sera créé et affiché dans le tableau
6. **Cliquez sur les trois points (⋯) à droite du token** pour voir les options
7. Sélectionnez **"Copy Token"** ou **"View Token"** pour copier la valeur
8. **⚠️ Important :** Le token complet sera affiché (c'est une longue chaîne)
9. **Copiez cette valeur** - c'est votre `KAGGLE_KEY`

**Note :** Si vous avez déjà créé un token (comme "way finder" visible dans votre compte), vous pouvez :
- Cliquer sur les trois points (⋯) à côté du token
- Sélectionner "Copy Token" ou "View Token" pour obtenir la valeur

#### Option B : Utiliser les Legacy API Credentials (Ancien système)
Si vous préférez utiliser l'ancien système avec `kaggle.json` :
1. Dans la section **"Legacy API Credentials"**
2. Cliquez sur **"Create Legacy API Key"**
3. Un fichier `kaggle.json` sera téléchargé automatiquement
4. Ouvrez ce fichier JSON, il contient :
   ```json
   {
     "username": "votre_username",
     "key": "votre_api_key_ici"
   }
   ```
5. **Copiez la valeur de "key"** - c'est votre `KAGGLE_KEY`

**⚠️ Note :** Les Legacy API Credentials expirent les anciennes clés. Il est recommandé d'utiliser les nouveaux API Tokens.

### Étape 4 : Obtenir KAGGLE_NOTEBOOK_URL (Optionnel)
**Note :** Cette URL est optionnelle et nécessite de créer un notebook Kaggle personnalisé.

Si vous voulez utiliser un notebook Kaggle existant :
1. Allez sur https://www.kaggle.com/code
2. Créez un nouveau notebook ou utilisez un existant
3. Le notebook doit :
   - Accepter des images en entrée
   - Générer une vidéo
   - Retourner l'URL de la vidéo générée
4. Une fois le notebook créé, l'URL sera : `https://www.kaggle.com/code/votre_username/nom-du-notebook`
5. Pour l'API, utilisez : `https://www.kaggle.com/api/v1/kernels/output`

**⚠️ Important :** L'intégration Kaggle est complexe car elle nécessite :
- Un notebook Kaggle configuré pour la génération vidéo
- L'upload des images vers Kaggle
- L'exécution du notebook via API
- La récupération du résultat

**Recommandation :** Utilisez **Cloudinary** ou **Replicate** pour une intégration plus simple.

### Étape 5 : Ajouter dans Render
Dans votre projet Render, ajoutez ces variables d'environnement :
```
KAGGLE_USERNAME=votre_username
KAGGLE_KEY=votre_api_key
# Optionnel (si vous avez un notebook personnalisé)
KAGGLE_NOTEBOOK_URL=https://www.kaggle.com/api/v1/kernels/output
```

---

## 3. Replicate (⭐ MEILLEUR pour l'IA vidéo)

### Étape 1 : Créer un compte Replicate
1. Allez sur https://replicate.com
2. Cliquez sur **"Sign Up"** (gratuit)
3. Créez un compte avec GitHub, Google, ou email

### Étape 2 : Obtenir REPLICATE_API_TOKEN
1. Une fois connecté, allez sur **Account Settings** : https://replicate.com/account
2. Cliquez sur **"API Tokens"** dans le menu
3. Vous verrez votre token API (commence par `r8_...`)
4. Cliquez sur **"Copy"** pour copier le token
5. **⚠️ Important :** Ce token ne sera affiché qu'une seule fois, sauvegardez-le !

### Étape 3 : Ajouter dans Render
```
REPLICATE_API_TOKEN=r8_votre_token_ici
REPLICATE_VIDEO_MODEL=anotherjesse/zeroscope-v2-xl
```

---

## Résumé des URLs importantes

| Service | URL pour obtenir les credentials |
|---------|----------------------------------|
| **Cloudinary** | https://cloudinary.com/console (Dashboard) |
| **Kaggle** | https://www.kaggle.com/settings (Settings → API) |
| **Replicate** | https://replicate.com/account (Account → API Tokens) |

## Ordre de priorité recommandé

1. **Cloudinary** (le plus simple et fiable pour les montages)
2. **Replicate** (meilleur pour l'IA, mais plus lent)
3. **Kaggle** (complexe, nécessite un notebook personnalisé)

## Configuration minimale pour commencer

Pour tester rapidement, configurez au moins **un** de ces services :

**Option 1 (Recommandé) :** Cloudinary
```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**Option 2 :** Replicate
```
REPLICATE_API_TOKEN=r8_xxx
```

**Option 3 :** Kaggle (si vous avez un notebook)
```
KAGGLE_USERNAME=xxx
KAGGLE_KEY=xxx
```

## Après configuration

1. Ajoutez les variables dans Render
2. Redéployez le backend
3. Testez la génération vidéo dans l'app
4. Vérifiez les logs backend pour voir quel service est utilisé

