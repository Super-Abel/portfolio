# Déploiement GitHub Pages

## Prérequis
1. Créer un repo GitHub nommé `portfolio`
2. Initialiser git localement:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Super-Abel/portfolio.git
git push -u origin main
```

## Déployer
```bash
npm run deploy
```

Le site sera disponible à: **https://super-abel.github.io/portfolio/**

## Notes
- Le fichier `.nojekyll` empêche Jekyll de traiter les fichiers
- Le fichier `404.html` gère le routing Angular sur GitHub Pages
- Le `base-href` est configuré sur `/portfolio/`
