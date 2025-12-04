# Configuration FCM dans Render - Guide Rapide

## 📋 Étapes rapides pour configurer FCM dans Render

### 1. Obtenir la clé de service account Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Cliquez sur ⚙️ **Paramètres du projet**
4. Onglet **Comptes de service**
5. Cliquez sur **Générer une nouvelle clé privée**
6. Téléchargez le fichier JSON (ex: `wayfinder-firebase-adminsdk-xxxxx.json`)

### 2. Copier le contenu JSON

Ouvrez le fichier JSON téléchargé et copiez **tout son contenu**.

Le JSON devrait ressembler à :
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
}
```

### 3. Ajouter la variable d'environnement dans Render

1. Allez sur [Render Dashboard](https://dashboard.render.com/)
2. Sélectionnez votre **Web Service** (backend)
3. Cliquez sur **Environment** dans le menu de gauche
4. Cliquez sur **Add Environment Variable**

#### Configuration :

- **Key** : `FIREBASE_SERVICE_ACCOUNT_KEY`
- **Value** : Collez le **contenu JSON complet** que vous avez copié

⚠️ **IMPORTANT** :
- Collez tout le JSON en une seule ligne ou sur plusieurs lignes (Render accepte les deux)
- Assurez-vous que toutes les guillemets sont présents
- Le JSON doit être valide

### 4. Redéployer votre service

1. Render redémarrera automatiquement après avoir ajouté la variable
2. Ou allez dans **Manual Deploy** > **Deploy latest commit**

### 5. Vérifier que ça fonctionne

1. Allez dans **Logs** de votre service Render
2. Recherchez : `Firebase Admin SDK initialized successfully`
3. Si vous voyez un avertissement, vérifiez que le JSON est correct

### 6. Tester une notification

Testez en créant une notification via votre API :

```bash
curl -X POST https://your-app.onrender.com/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "general",
    "title": "Test",
    "message": "Test notification from Render"
  }'
```

Si tout fonctionne, la notification sera :
1. ✅ Sauvegardée dans MongoDB
2. ✅ Envoyée via FCM à l'app Android (si l'utilisateur a un token FCM)

## 🐛 Dépannage

### "Firebase Admin SDK not initialized"

**Problème** : La variable d'environnement n'est pas correctement configurée.

**Solutions** :
1. Vérifiez que `FIREBASE_SERVICE_ACCOUNT_KEY` est bien définie dans Render
2. Vérifiez que le JSON est complet et valide
3. Vérifiez les logs Render pour voir l'erreur exacte

### "Invalid service account"

**Problème** : Le JSON du service account est invalide ou incomplet.

**Solutions** :
1. Téléchargez à nouveau le fichier JSON depuis Firebase Console
2. Assurez-vous que vous avez copié **tout** le contenu
3. Vérifiez que les guillemets sont correctement échappés

### Les notifications ne sont pas envoyées

**Problème** : FCM n'envoie pas les notifications.

**Solutions** :
1. Vérifiez que le token FCM est bien enregistré dans MongoDB (`users.fcm_token`)
2. Vérifiez les logs Render pour les erreurs FCM
3. Vérifiez que l'app Android a bien reçu le token FCM

## 📝 Note importante

Sur Render, **ne pas utiliser** `FIREBASE_SERVICE_ACCOUNT_PATH` car :
- Le système de fichiers est éphémère
- Les fichiers ne persistent pas entre les redéploiements
- Utilisez toujours `FIREBASE_SERVICE_ACCOUNT_KEY` avec le JSON complet

## ✅ Checklist

- [ ] Clé de service account Firebase téléchargée
- [ ] Variable `FIREBASE_SERVICE_ACCOUNT_KEY` ajoutée dans Render
- [ ] Service redéployé sur Render
- [ ] Logs montrent "Firebase Admin SDK initialized successfully"
- [ ] Test de notification réussi

Une fois tout coché, FCM est configuré et fonctionnel dans Render ! 🎉

