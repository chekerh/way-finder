# Configuration Email sur Render

## Problème
Les codes OTP sont générés mais les emails ne sont pas reçus. Cela signifie que le service d'email n'est pas configuré correctement sur Render.

## Solution : Configurer les variables d'environnement email sur Render

### Option 1 : Utiliser Gmail SMTP (Recommandé pour les tests)

1. **Créer un mot de passe d'application Gmail** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Connectez-vous avec votre compte Gmail
   - Sélectionnez "App" → "Mail" et "Device" → "Other (Custom name)"
   - Entrez "WayFinder Render" comme nom
   - Cliquez sur "Generate"
   - **Copiez le mot de passe généré** (16 caractères)

2. **Configurer les variables d'environnement sur Render** :
   - Allez sur votre dashboard Render
   - Ouvrez votre service backend
   - Allez dans "Environment"
   - Ajoutez ces variables :

   ```
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=votre_email@gmail.com
   EMAIL_PASSWORD=votre_mot_de_passe_application_16_caracteres
   EMAIL_FROM=WayFinder <votre_email@gmail.com>
   ```

3. **Redéployer le service** :
   - Cliquez sur "Manual Deploy" → "Deploy latest commit"

### Option 2 : Utiliser Mailjet (Recommandé pour la production)

1. **Créer un compte Mailjet** :
   - Allez sur https://www.mailjet.com/
   - Créez un compte gratuit (6000 emails/mois gratuits)
   - Allez dans "Account Settings" → "API Keys"
   - Copiez votre **API Key** et **Secret Key**

2. **Vérifier votre email d'envoi** :
   - Dans Mailjet, allez dans "Senders & Domains"
   - Ajoutez et vérifiez votre email d'envoi

3. **Configurer les variables d'environnement sur Render** :
   ```
   EMAIL_SERVICE=mailjet
   MAILJET_API_KEY=votre_api_key
   MAILJET_API_SECRET=votre_secret_key
   MAILJET_FROM_EMAIL=votre_email_verifie@example.com
   MAILJET_FROM_NAME=WayFinder
   ```

4. **Redéployer le service**

### Option 3 : Utiliser un autre service SMTP

Si vous utilisez un autre fournisseur email (Outlook, Yahoo, etc.) :

```
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.office365.com  # Pour Outlook
EMAIL_PORT=587
EMAIL_USER=votre_email@outlook.com
EMAIL_PASSWORD=votre_mot_de_passe
EMAIL_FROM=WayFinder <votre_email@outlook.com>
```

## Vérification

Après avoir configuré les variables et redéployé :

1. **Vérifiez les logs Render** :
   - Allez dans "Logs" de votre service
   - Cherchez les messages :
     - `✅ SMTP transporter configured` (si SMTP)
     - `Mailjet email service configured successfully` (si Mailjet)
     - `❌ SMTP credentials not fully configured` (si mal configuré)

2. **Testez l'envoi d'OTP** :
   - Essayez de vous inscrire ou de vous connecter avec OTP
   - Vérifiez les logs pour voir si l'email est envoyé
   - Les logs montreront maintenant des messages détaillés :
     - `[Register OTP] Attempting to send OTP email to...`
     - `✅ OTP email sent successfully` (si réussi)
     - `❌ Failed to send email` (si échec avec détails)

## Dépannage

### Si vous voyez "SMTP transporter not configured" :
- Vérifiez que `EMAIL_USER` et `EMAIL_PASSWORD` sont bien définis
- Vérifiez que les valeurs sont correctes (pas d'espaces, pas de guillemets)

### Si vous voyez "Failed to send email" :
- Vérifiez que le mot de passe d'application Gmail est correct
- Vérifiez que "Less secure app access" n'est pas nécessaire (utilisez App Password)
- Vérifiez que le port 587 n'est pas bloqué par le firewall

### Si vous utilisez Mailjet et ça ne marche pas :
- Vérifiez que votre email d'envoi est vérifié dans Mailjet
- Vérifiez que les API keys sont correctes
- Vérifiez les logs Mailjet dans leur dashboard

## Important

⚠️ **Ne jamais commiter les mots de passe dans le code !**
- Utilisez toujours les variables d'environnement sur Render
- Les valeurs sensibles doivent rester dans les variables d'environnement uniquement

