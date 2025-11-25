# Guide de Diagnostic - Notifications Push FCM

## Problème
Les notifications sont créées dans la base de données (visibles dans l'icône de notification) mais les notifications push ne sont pas reçues sur l'appareil.

## Étapes de Diagnostic

### 1. Vérifier les logs Render

Après avoir annulé une réservation, vérifiez les logs Render. Vous devriez voir :

#### ✅ Si FCM fonctionne :
```
[NotificationsService] ✅ Created new notification for user xxx, type booking_cancelled
[NotificationsService] Attempting to send FCM - shouldSendFCM: true, isInitialized: true
[NotificationsService] FCM token for user xxx: FOUND
[NotificationsService] Sending FCM notification to token: ...
[FCM] ✅ Successfully sent FCM notification: projects/xxx/messages/xxx
```

#### ❌ Si FCM n'est pas initialisé :
```
[NotificationsService] ⚠️ FCM service not initialized
[NotificationsService] Configure FIREBASE_SERVICE_ACCOUNT_KEY environment variable on Render
```

**Solution** : Configurez `FIREBASE_SERVICE_ACCOUNT_KEY` sur Render (voir guide ci-dessous)

#### ❌ Si le token FCM n'est pas enregistré :
```
[NotificationsService] ⚠️ No FCM token found for user xxx
[NotificationsService] User needs to register FCM token via POST /api/user/fcm-token
```

**Solution** : L'utilisateur doit se reconnecter pour enregistrer son token FCM

#### ❌ Si l'envoi FCM échoue :
```
[FCM] ❌ Failed to send FCM notification: [erreur]
[FCM] Error code: messaging/invalid-registration-token
```

**Solution** : Le token FCM est invalide, l'utilisateur doit se reconnecter

### 2. Vérifier la Configuration FCM sur Render

1. **Allez sur votre dashboard Render**
2. **Ouvrez votre service backend**
3. **Allez dans "Environment"**
4. **Vérifiez que `FIREBASE_SERVICE_ACCOUNT_KEY` est configuré**

Si ce n'est pas configuré :

1. **Obtenez votre clé de compte de service Firebase** :
   - Allez sur https://console.firebase.google.com/
   - Sélectionnez votre projet
   - Allez dans "Paramètres du projet" → "Comptes de service"
   - Cliquez sur "Générer une nouvelle clé privée"
   - Téléchargez le fichier JSON

2. **Configurez sur Render** :
   - Ouvrez le fichier JSON téléchargé
   - Copiez TOUT le contenu JSON
   - Sur Render, ajoutez la variable d'environnement :
     - **Key** : `FIREBASE_SERVICE_ACCOUNT_KEY`
     - **Value** : Collez le contenu JSON complet (sur une seule ligne ou avec des guillemets)
   
   **Important** : Si vous utilisez plusieurs lignes, utilisez des guillemets simples autour du JSON :
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'
   ```

3. **Redéployez le service**

### 3. Vérifier que le Token FCM est Enregistré

1. **Connectez-vous à l'app iOS**
2. **Vérifiez les logs Render** - vous devriez voir :
   ```
   ✅ [UserService] FCM token registered: Token registered successfully
   ```

3. **Vérifiez dans MongoDB** :
   - Connectez-vous à MongoDB Atlas
   - Allez dans votre collection `users`
   - Trouvez votre utilisateur
   - Vérifiez que le champ `fcm_token` existe et contient un token

### 4. Vérifier les Permissions iOS

1. **Sur l'appareil iOS** :
   - Allez dans "Réglages" → "Notifications" → "WayFinder"
   - Vérifiez que les notifications sont activées
   - Vérifiez que "Alertes" est activé

2. **Dans l'app** :
   - À la première ouverture, l'app doit demander la permission de notification
   - Acceptez la permission

### 5. Tester l'Envoi de Notification

1. **Annulez une réservation**
2. **Vérifiez les logs Render immédiatement**
3. **Cherchez les messages** :
   - `[NotificationsService] Attempting to send FCM`
   - `[FCM] Sending notification`
   - `[FCM] ✅ Successfully sent` ou `[FCM] ❌ Failed`

### 6. Problèmes Courants

#### Problème : "FCM service not initialized"
**Cause** : `FIREBASE_SERVICE_ACCOUNT_KEY` n'est pas configuré ou invalide
**Solution** : Configurez la variable d'environnement comme décrit ci-dessus

#### Problème : "No FCM token found for user"
**Cause** : L'utilisateur ne s'est pas connecté depuis la configuration FCM
**Solution** : L'utilisateur doit se déconnecter et se reconnecter

#### Problème : "Invalid registration token"
**Cause** : Le token FCM est expiré ou invalide
**Solution** : L'utilisateur doit se reconnecter pour obtenir un nouveau token

#### Problème : Notification reçue mais pas affichée
**Cause** : Permissions iOS non accordées ou app en arrière-plan
**Solution** : Vérifiez les permissions iOS et testez avec l'app en arrière-plan

## Vérification Rapide

Pour vérifier rapidement si FCM est configuré :

1. **Vérifiez les logs au démarrage du backend** :
   ```
   [FcmService] Firebase Admin SDK initialized successfully
   ```
   OU
   ```
   [FcmService] Firebase Admin SDK not initialized
   ```

2. **Testez l'envoi** :
   - Annulez une réservation
   - Vérifiez les logs
   - Si vous voyez `✅ Successfully sent FCM notification`, FCM fonctionne
   - Si vous voyez `⚠️ FCM service not initialized`, configurez `FIREBASE_SERVICE_ACCOUNT_KEY`

## Support

Si le problème persiste après avoir suivi ces étapes :
1. Copiez les logs Render complets (surtout les lignes avec `[NotificationsService]` et `[FCM]`)
2. Vérifiez que `FIREBASE_SERVICE_ACCOUNT_KEY` est bien configuré
3. Vérifiez que le token FCM est enregistré dans MongoDB

