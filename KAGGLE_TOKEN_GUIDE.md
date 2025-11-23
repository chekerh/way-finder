# Guide : Obtenir le Token Kaggle (Nouveau Système)

## Problème
Kaggle a changé son système d'API. Le fichier `kaggle.json` n'est plus automatiquement téléchargé avec le nouveau système d'API Tokens.

## Solution : Utiliser les nouveaux API Tokens

### Étape 1 : Accéder aux Settings
1. Allez sur https://www.kaggle.com/settings
2. Connectez-vous si nécessaire

### Étape 2 : Générer un nouveau token
1. Dans la section **"API Tokens (Recommended)"**
2. Cliquez sur le bouton **"Generate New Token"**
3. Donnez un nom à votre token (ex: "wayfinder-video-generation")
4. Cliquez sur **"Create"** ou **"Generate"**

### Étape 3 : Récupérer le token
**⚠️ IMPORTANT :** Le token n'est pas téléchargé automatiquement. Vous devez le copier manuellement.

1. Une fois le token créé, il apparaît dans le tableau sous "API Tokens (Recommended)"
2. **Cliquez sur les trois points verticaux (⋯)** à droite du token dans le tableau
3. Un menu déroulant apparaît avec les options :
   - **"Copy Token"** - Pour copier le token
   - **"View Token"** - Pour voir le token complet
   - **"Delete"** - Pour supprimer le token
4. Cliquez sur **"Copy Token"** ou **"View Token"**
5. **Copiez la valeur complète du token** (c'est une longue chaîne de caractères)
6. Cette valeur est votre `KAGGLE_KEY`

### Étape 4 : Obtenir votre username
Votre username est visible :
- En haut à droite de votre profil Kaggle
- Dans l'URL : `https://www.kaggle.com/votre_username`
- Dans la section "Your username" sur la page Settings

### Étape 5 : Configurer dans Render
Ajoutez ces variables dans Render :
```
KAGGLE_USERNAME=votre_username
KAGGLE_KEY=votre_token_complet_ici
```

## Alternative : Utiliser Legacy API Credentials

Si vous préférez utiliser l'ancien système qui télécharge `kaggle.json` :

1. Dans la section **"Legacy API Credentials"**
2. Cliquez sur **"Create Legacy API Key"**
3. Un fichier `kaggle.json` sera téléchargé
4. Ouvrez le fichier et copiez les valeurs :
   ```json
   {
     "username": "votre_username",
     "key": "votre_key"
   }
   ```

**⚠️ Attention :** Créer une Legacy API Key expire toutes les anciennes clés legacy existantes.

## Vérification

Pour vérifier que votre token fonctionne :
1. Le token doit être une longue chaîne de caractères
2. Il ne doit pas contenir d'espaces
3. Il commence généralement par des lettres et chiffres

## Exemple de configuration

Dans Render, vos variables devraient ressembler à :
```
KAGGLE_USERNAME=malekbenslimen
KAGGLE_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## Note importante

Le nouveau système d'API Tokens de Kaggle est plus sécurisé et permet de :
- Gérer plusieurs tokens séparément
- Révoquer des tokens individuellement
- Voir quand chaque token a été utilisé

C'est pourquoi Kaggle recommande d'utiliser ce nouveau système au lieu de l'ancien `kaggle.json`.

