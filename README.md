# WoT Adapter Proxy

Un proxy HTTP/HTTPS pour adapter les requêtes vers les serveurs Web of Things (WoT). Ce proxy transforme automatiquement la structure des données JSON en entrée pour s'adapter aux spécifications WoT.

## Fonctionnalités

- Proxy HTTP transparent pour les requêtes GET, POST, PUT, DELETE, etc.
- Transformation automatique des données JSON pour les requêtes POST
- Support des en-têtes personnalisés
- Configuration via variables d'environnement
- Gestion d'erreurs intégrée

## Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/faubourg-numerique/wot-adapter-proxy.git
   cd wot-adapter-proxy
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Ensuite, éditez le fichier `.env` selon vos besoins :
   ```env
   TARGET_URL=http://localhost:3000
   PROXY_PORT=8080
   ```

4. **Démarrer le proxy**
   ```bash
   node index.js
   ```

Le proxy sera accessible à l'adresse `http://localhost:8080` (ou le port configuré) et redirigera les requêtes vers l'URL cible.

## Configuration

Le fichier `.env` contient les variables de configuration suivantes :

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `TARGET_URL` | URL du serveur cible vers lequel rediriger les requêtes | `http://localhost:3000` |
| `PROXY_PORT` | Port sur lequel le proxy écoute | `8080` |

## Utilisation

### Transformation des données

Le proxy effectue automatiquement les transformations suivantes sur les requêtes POST avec du contenu JSON :

- **Avant** : `{ "property": { "input": { "value": 123 } } }`
- **Après** : `{ "property": { "value": 123 } }`

Cette transformation retire l'enveloppe `input` des objets pour s'adapter aux spécifications WoT.

### Exemples de requêtes

```bash
# Requête GET
curl http://localhost:8080/api/things

# Requête POST avec transformation automatique
curl -X POST http://localhost:8080/api/things/1/properties/temperature \
  -H "Content-Type: application/json" \
  -d '{"temperature": {"input": {"value": 25.5}}}'
```

## Développement

### Scripts disponibles

- `npm test` : Exécute les tests (à implémenter)

### Structure du projet

```
wot-adapter-proxy/
├── index.js          # Point d'entrée principal
├── package.json      # Configuration npm et dépendances
├── .env.example      # Exemple de configuration
├── .env              # Configuration locale (à créer)
└── README.md         # Ce fichier
```

## Dépendances

- **express** : Framework web pour Node.js
- **body-parser** : Middleware pour parser les corps de requêtes
- **dotenv** : Chargement des variables d'environnement
- **http-proxy-middleware** : Middleware de proxy HTTP

## Contribuer

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence ISC. Voir le fichier de licence pour plus de détails.

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur [GitHub](https://github.com/faubourg-numerique/wot-adapter-proxy/issues).

## Dépannage

### Erreur "Missing parameter name" au démarrage

Si vous rencontrez une erreur de type `TypeError: Missing parameter name at 1`, cela peut être dû à un problème de compatibilité avec Express 5. Assurez-vous que le code utilise `app.use('/', ...)` au lieu de `app.use('*', ...)` pour capturer toutes les routes.
