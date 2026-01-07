# Guide d'Implémentation : Recommandation de Tenues Basée sur la Météo

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de :
1. Prendre des photos de leurs tenues après avoir réservé un vol
2. Obtenir des recommandations basées sur la météo de la destination
3. Recevoir des feedbacks sur l'adaptation de leurs tenues au climat

## Architecture

### Backend

#### Modules créés :
- `outfit-weather.module.ts` : Module principal
- `outfit.schema.ts` : Schéma MongoDB pour stocker les tenues
- `weather.service.ts` : Service pour récupérer les données météo
- `image-analysis.service.ts` : Service pour analyser les images de tenues
- `outfit-weather.service.ts` : Service principal de logique métier
- `outfit-weather.controller.ts` : Contrôleur API REST
- `outfit-weather.dto.ts` : DTOs pour validation

#### Endpoints API :

1. **POST `/outfit-weather/analyze`**
   - Analyse une tenue pour une réservation
   - Body: `{ booking_id: string, image_url: string }`
   - Retourne: Analyse complète avec recommandations

2. **GET `/outfit-weather/booking/:bookingId`**
   - Récupère toutes les tenues pour une réservation

3. **GET `/outfit-weather/:outfitId`**
   - Récupère une tenue spécifique

4. **POST `/outfit-weather/:outfitId/approve`**
   - Approuve une tenue

5. **DELETE `/outfit-weather/:outfitId`**
   - Supprime une tenue

### Configuration requise

#### Variables d'environnement :

```env
# OpenWeatherMap API (optionnel, utilise mock si non défini)
OPENWEATHER_API_KEY=your_api_key_here

# OpenAI API (optionnel, utilise fallback si non défini)
OPENAI_API_KEY=your_api_key_here
```

#### Obtenir les clés API :

1. **OpenWeatherMap** (gratuit jusqu'à 1000 appels/jour) :
   - Aller sur https://openweathermap.org/api
   - Créer un compte gratuit
   - Obtenir la clé API

2. **OpenAI** (payant) :
   - Aller sur https://platform.openai.com/
   - Créer un compte et ajouter des crédits
   - Obtenir la clé API

**Note** : Si les clés API ne sont pas configurées, le système utilise des données mock pour le développement.

## Installation

1. Installer les dépendances (déjà dans package.json) :
```bash
npm install @nestjs/axios
```

2. Ajouter le module à `app.module.ts` (déjà fait)

3. Configurer les variables d'environnement dans `.env`

## Utilisation

### Flux utilisateur :

1. **Réservation confirmée** → L'utilisateur voit un bouton "Vérifier ma tenue"
2. **Upload photo** → L'utilisateur prend/upload une photo de sa tenue
3. **Analyse** → L'application :
   - Récupère la météo de la destination
   - Analyse l'image pour identifier les vêtements
   - Compare avec les recommandations météo
   - Génère un score et des suggestions
4. **Feedback** → L'utilisateur voit :
   - Score d'adaptation (0-100)
   - Feedback détaillé
   - Suggestions d'amélioration

### Exemple de réponse API :

```json
{
  "_id": "...",
  "user_id": "...",
  "booking_id": "...",
  "image_url": "https://...",
  "detected_items": ["t-shirt", "jeans", "sneakers"],
  "weather_data": {
    "temperature": 25,
    "condition": "sunny",
    "humidity": 60,
    "wind_speed": 10
  },
  "recommendation": {
    "is_suitable": true,
    "score": 85,
    "feedback": "Excellent! Votre tenue est parfaitement adaptée à la météo.\n✅ Vous portez 3 article(s) adapté(s) à la météo",
    "suggestions": [
      "💡 Pensez à ajouter: sunglasses, hat",
      "Protégez-vous du soleil"
    ]
  },
  "is_approved": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Prochaines étapes - Android

1. Créer un écran `OutfitAnalysisScreen.kt`
2. Intégrer la caméra/galerie pour prendre des photos
3. Upload l'image vers le backend (via ImgBB ou similaire)
4. Appeler l'API d'analyse
5. Afficher les résultats avec un design attrayant

## Améliorations futures

1. **Analyse d'images améliorée** :
   - Utiliser Google Vision API (plus précis)
   - Modèle ML local (TensorFlow Lite)
   - Détection de couleurs et textures

2. **Recommandations avancées** :
   - Tenues par activité (plage, randonnée, ville)
   - Style personnel de l'utilisateur
   - Historique des tenues approuvées

3. **Fonctionnalités sociales** :
   - Partager des tenues avec d'autres voyageurs
   - Voir les tenues populaires pour une destination

4. **Intégration shopping** :
   - Lien vers des boutiques en ligne
   - Suggestions d'achat basées sur les manques

