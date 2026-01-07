# Configuration - Outfit Weather Feature

## Clés API nécessaires

Vous avez déjà la plupart des clés nécessaires ! Voici ce qu'il vous faut :

### ✅ Déjà configuré

1. **IMGBB_API_KEY** - Pour uploader les images de tenues
   - Vous l'avez déjà dans vos variables d'environnement
   - Utilisé pour stocker les photos de tenues

2. **OPENAI_API_KEY** - Pour analyser les images et identifier les vêtements
   - Vous l'avez déjà dans vos variables d'environnement
   - Utilisé pour détecter les vêtements dans les photos

### 🔄 À configurer

3. **OPENWEATHER_API_KEY** - Pour obtenir la météo de la destination
   - Vous êtes en train de créer cette clé
   - **Gratuit** jusqu'à 1000 appels/jour
   - Obtenir ici : https://openweathermap.org/api

## Configuration dans Render/Vercel

### Étape 1 : Ajouter OPENWEATHER_API_KEY

1. Allez dans votre projet sur Render/Vercel
2. Section "Environment Variables"
3. Cliquez sur "Add" ou "Edit"
4. Ajoutez :
   - **Key**: `OPENWEATHER_API_KEY`
   - **Value**: Votre clé OpenWeatherMap (que vous êtes en train de créer)

### Étape 2 : Vérifier les autres clés

Assurez-vous que ces clés sont bien configurées :
- ✅ `IMGBB_API_KEY` - Déjà présent
- ✅ `OPENAI_API_KEY` - Déjà présent
- 🔄 `OPENWEATHER_API_KEY` - À ajouter

## Comment obtenir OPENWEATHER_API_KEY

1. Aller sur https://openweathermap.org/api
2. Cliquer sur "Sign Up" (gratuit)
3. Créer un compte
4. Aller dans "API keys"
5. Copier votre clé API
6. L'ajouter dans vos variables d'environnement

**Note** : La clé peut prendre quelques minutes à être activée.

## Test de la configuration

Une fois toutes les clés configurées, vous pouvez tester avec :

```bash
# Test de l'endpoint d'upload
POST /outfit-weather/upload
Headers: Authorization: Bearer <token>
Body (form-data):
  - image: <file>
  - booking_id: <booking_id>
```

## Fonctionnement

1. **Upload d'image** → Utilise `IMGBB_API_KEY` pour stocker l'image
2. **Analyse d'image** → Utilise `OPENAI_API_KEY` pour identifier les vêtements
3. **Météo** → Utilise `OPENWEATHER_API_KEY` pour obtenir la météo de la destination
4. **Recommandations** → Compare les vêtements avec la météo et génère un score

## Fallback

Si `OPENWEATHER_API_KEY` n'est pas configuré, le système utilise des données météo mock basées sur le nom de la ville. Cela permet de tester la fonctionnalité même sans clé API.

## Support

Si vous avez des problèmes :
1. Vérifiez que toutes les clés sont bien dans les variables d'environnement
2. Redéployez l'application après avoir ajouté les clés
3. Vérifiez les logs pour voir les erreurs éventuelles

