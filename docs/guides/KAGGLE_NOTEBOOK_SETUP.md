# Guide : Créer un Notebook Kaggle pour la Génération Vidéo

## Vue d'ensemble

Ce guide vous explique comment créer un notebook Kaggle qui génère des vidéos à partir d'images de voyage.

## Étape 1 : Créer un nouveau notebook

1. Allez sur https://www.kaggle.com/code
2. Cliquez sur **"New Notebook"** ou **"Create"**
3. Donnez un nom à votre notebook (ex: "wayfinder-video-generator")
4. Sélectionnez **"Python"** comme langage

## Étape 2 : Installer les dépendances nécessaires

Dans la première cellule de votre notebook, ajoutez :

```python
# Install required packages
!pip install moviepy imageio imageio-ffmpeg pillow requests
```

**Note :** Kaggle a déjà `numpy` et `pandas` installés, donc pas besoin de les installer.

## Étape 3 : Copier le code de génération vidéo

Copiez le code du fichier `KAGGLE_NOTEBOOK_TEMPLATE.py` dans votre notebook Kaggle.

## Étape 4 : Ajouter des images

### Option A : Via Dataset Kaggle (Recommandé)

1. Créez un dataset Kaggle avec vos images :
   - Allez sur https://www.kaggle.com/datasets
   - Cliquez sur **"New Dataset"**
   - Uploadez vos images
   - Publiez le dataset

2. Dans votre notebook, dans le panneau de droite :
   - Cliquez sur **"+ Add Input"**
   - Sélectionnez votre dataset
   - Les images seront disponibles dans `/kaggle/input/`

### Option B : Via URLs (Pour l'intégration API)

Modifiez la fonction `main()` pour accepter des URLs d'images :

```python
def main(image_urls=None):
    """Main function to generate video"""
    images = []
    
    if image_urls:
        # Download images from URLs
        images = download_images_from_urls(image_urls)
    else:
        # Load from input directory
        images, _ = load_images_from_input()
    
    # ... rest of the code
```

## Étape 5 : Exécuter le notebook

1. Cliquez sur **"Run All"** ou exécutez les cellules une par une
2. Le notebook va :
   - Charger les images
   - Créer un montage vidéo
   - Sauvegarder la vidéo dans `/kaggle/working/`

## Étape 6 : Récupérer la vidéo générée

1. Une fois l'exécution terminée, cliquez sur **"Save Version"**
2. Dans le panneau de droite, section **"Output"**, vous verrez :
   - `generated_video.mp4` - La vidéo générée
   - `metadata.json` - Les métadonnées

3. Cliquez sur le fichier pour le télécharger ou obtenir l'URL

## Étape 7 : Configurer pour l'API (Optionnel)

Pour utiliser ce notebook via l'API Kaggle :

1. **Publiez votre notebook** :
   - Cliquez sur **"Save Version"**
   - Sélectionnez **"Save & Run All"**
   - Une fois terminé, le notebook est publié

2. **Obtenez l'URL du notebook** :
   - L'URL sera : `https://www.kaggle.com/code/votre_username/nom-du-notebook`
   - Notez cette URL pour `KAGGLE_NOTEBOOK_URL`

3. **Utilisez l'API Kaggle** :
   - L'API Kaggle permet d'exécuter des notebooks programmatiquement
   - Voir la documentation : https://www.kaggle.com/docs/api

## Configuration dans le Backend

Une fois votre notebook créé et testé, configurez dans Render :

```
KAGGLE_USERNAME=malekbenslimen
KAGGLE_KEY=votre_token_api
KAGGLE_NOTEBOOK_URL=https://www.kaggle.com/code/malekbenslimen/wayfinder-video-generator
```

## Notes importantes

1. **Limites Kaggle** :
   - Les notebooks ont des limites de temps d'exécution
   - Les datasets ont des limites de taille
   - Vérifiez les quotas sur https://www.kaggle.com/settings

2. **Performance** :
   - La génération vidéo peut prendre plusieurs minutes
   - Utilisez des images optimisées (pas trop grandes)

3. **Alternative plus simple** :
   - Pour une intégration plus simple, utilisez **Cloudinary** ou **Replicate**
   - Kaggle est plus complexe mais offre plus de contrôle

## Exemple de notebook complet

Le fichier `KAGGLE_NOTEBOOK_TEMPLATE.py` contient un exemple complet que vous pouvez copier dans votre notebook Kaggle.

## Prochaines étapes

1. Créez le notebook avec le template
2. Testez avec quelques images
3. Une fois que ça fonctionne, configurez l'intégration API dans le backend
4. Testez l'intégration complète

