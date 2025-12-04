# Configuration Firebase Cloud Messaging (FCM)

## 📋 Prérequis

1. **Compte Google** avec accès à Firebase Console
2. **Projet Firebase** créé sur [https://console.firebase.google.com/](https://console.firebase.google.com/)

## 🔧 Configuration Android

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet" ou sélectionnez un projet existant
3. Suivez les étapes de configuration

### 2. Ajouter Android App dans Firebase

1. Dans Firebase Console, cliquez sur l'icône Android
2. **Package name** : `tn.esprit.WayFinder` (doit correspondre à `applicationId` dans `build.gradle.kts`)
3. **App nickname** : WayFinder (optionnel)
4. **SHA-1** : Obtenez votre SHA-1 :
   ```bash
   cd android
   ./gradlew signingReport
   ```
   Ou pour debug :
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
5. Cliquez sur "Enregistrer l'app"

### 3. Télécharger `google-services.json`

1. Téléchargez le fichier `google-services.json` depuis Firebase Console
2. Placez-le dans : `android/app/google-services.json`

⚠️ **IMPORTANT** : Ce fichier est nécessaire pour que FCM fonctionne !

## 🔧 Configuration Backend

### 1. Créer une clé de compte de service Firebase

1. Dans Firebase Console, allez dans **Paramètres du projet** (⚙️)
2. Onglet **Comptes de service**
3. Cliquez sur **Générer une nouvelle clé privée**
4. Téléchargez le fichier JSON (ex: `wayfinder-firebase-adminsdk.json`)

### 2. Configurer les variables d'environnement

**Option A : Chemin vers le fichier JSON**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/wayfinder-firebase-adminsdk.json
```

**Option B : Contenu JSON dans variable d'environnement**
```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'
```

**Option C : Google Cloud Application Default Credentials** (pour production)
- Pas besoin de configurer si déployé sur Google Cloud avec credentials par défaut

### 3. Redémarrer le backend

Après avoir configuré les variables d'environnement, redémarrez le serveur backend.

## ✅ Vérification

### Android
1. Lancez l'application
2. Connectez-vous avec un compte
3. Le token FCM sera automatiquement enregistré dans le backend

### Backend
1. Vérifiez les logs : vous devriez voir "Firebase Admin SDK initialized"
2. Testez l'envoi d'une notification via l'API :
   ```bash
   POST /api/notifications
   {
     "type": "general",
     "title": "Test",
     "message": "Test notification"
   }
   ```

## 🧪 Test des notifications push

### 1. Tester depuis Firebase Console

1. Allez dans Firebase Console > **Cloud Messaging**
2. Cliquez sur "Envoyer votre premier message"
3. Entrez un titre et un message
4. Cliquez sur "Envoyer un message de test"
5. Entrez le token FCM de votre appareil (visible dans les logs de l'app)

### 2. Tester depuis le backend

Les notifications sont automatiquement envoyées via FCM quand :
- Une réservation est confirmée/annulée/mise à jour
- Un paiement réussit/échoue
- Une alerte de prix est déclenchée

## 📱 Recevoir le token FCM dans l'app

Le token FCM est automatiquement obtenu et envoyé au backend lors du login ou de l'ouverture de l'app.

Pour vérifier manuellement :
```kotlin
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        // Token sera automatiquement envoyé au backend
    }
}
```

## 🐛 Dépannage

### Android : "google-services.json not found"
- Vérifiez que le fichier est bien dans `android/app/google-services.json`
- Synchronisez le projet Gradle dans Android Studio

### Backend : "Firebase Admin SDK not initialized"
- Vérifiez que `FIREBASE_SERVICE_ACCOUNT_PATH` ou `FIREBASE_SERVICE_ACCOUNT_KEY` est défini
- Vérifiez que le fichier JSON de service account est valide

### Notifications ne s'affichent pas
- Vérifiez les permissions notifications dans Android Settings
- Vérifiez que le token FCM est bien enregistré dans la base de données
- Vérifiez les logs du backend pour les erreurs FCM

## 🚀 Configuration pour Render (Production)

### 1. Créer une clé de compte de service Firebase

1. Dans Firebase Console, allez dans **Paramètres du projet** (⚙️)
2. Onglet **Comptes de service**
3. Cliquez sur **Générer une nouvelle clé privée**
4. Téléchargez le fichier JSON (ex: `wayfinder-firebase-adminsdk-xxxxx.json`)

### 2. Configurer dans Render Dashboard

1. Allez sur votre dashboard Render : [https://dashboard.render.com/](https://dashboard.render.com/)
2. Sélectionnez votre service backend (Web Service)
3. Allez dans **Environment** (Variables d'environnement)
4. Cliquez sur **Add Environment Variable**

#### Option A : Variable d'environnement JSON (RECOMMANDÉ)

1. **Key** : `FIREBASE_SERVICE_ACCOUNT_KEY`
2. **Value** : Copiez le **contenu entier** du fichier JSON téléchargé
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

⚠️ **IMPORTANT** :
- Copiez tout le contenu du fichier JSON (sans modification)
- Sur Render, vous pouvez coller le JSON directement dans la valeur
- N'utilisez pas `FIREBASE_SERVICE_ACCOUNT_PATH` sur Render (les fichiers ne sont pas persistants)

### 3. Redémarrer le service Render

1. Après avoir ajouté la variable d'environnement
2. Render redémarrera automatiquement le service
3. Ou allez dans **Manual Deploy** > **Deploy latest commit**

### 4. Vérifier les logs Render

1. Allez dans **Logs** de votre service Render
2. Vous devriez voir :
   ```
   Firebase Admin SDK initialized successfully
   ```
   ou
   ```
   Firebase Admin SDK not initialized. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
   ```

### 5. Tester les notifications push

Une fois configuré, les notifications sont automatiquement envoyées via FCM quand :
- Une réservation est confirmée/annulée/mise à jour
- Un paiement réussit/échoue
- Une alerte de prix est déclenchée

Testez en créant une notification via l'API :
```bash
POST https://your-render-app.onrender.com/api/notifications
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "type": "general",
  "title": "Test",
  "message": "Test notification from Render"
}
```

## 🔧 Alternative : Utiliser Google Cloud Secret Manager (Avancé)

Si vous utilisez Google Cloud en production, vous pouvez utiliser Application Default Credentials :

1. Dans Render, n'ajoutez **pas** `FIREBASE_SERVICE_ACCOUNT_KEY`
2. Configurez Google Cloud Application Default Credentials
3. Le code essaiera automatiquement d'utiliser les credentials par défaut

⚠️ **Note** : Cette méthode nécessite une configuration supplémentaire de Google Cloud et n'est pas recommandée pour la plupart des cas d'usage.

## 📚 Documentation

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Android FCM Setup](https://firebase.google.com/docs/cloud-messaging/android/client)
- [Render Environment Variables](https://render.com/docs/environment-variables)

