# 🧪 Dataset de Test pour le Coffre

## 📋 Description

Ce script crée un dataset de test cohérent pour valider les calculs du coffre sur 9 jours.

## 📊 Structure du Dataset

**Période** : 10-18 janvier 2025 (9 jours)

### Clôtures (5 jours) :
- **10/01** : cashToSafe=100€, extraFlow=20€
- **11/01** : cashToSafe=150€, extraFlow=30€
- **12/01** : 🔴 GAP (1 jour sans clôture)
- **13/01** : cashToSafe=200€, extraFlow=0€
- **14-16/01** : 🔴 GAP (3 jours sans clôture)
- **17/01** : cashToSafe=120€, extraFlow=50€
- **18/01** : cashToSafe=180€, extraFlow=10€

### Mouvements du Coffre (3 mouvements) :
- **12/01** : Retrait Extra-Flow 40€ (Paiement lavage vitres)
- **15/01** : Dépôt Banque 100€
- **16/01** : Dépôt Banque 200€

## 🎯 Résultat Attendu

| Date | Banque (cumul) | Prime Noël (cumul) | Événement |
|------|----------------|-------------------|-----------|
| 10/01 | 100€ | 20€ | Clôture |
| 11/01 | 250€ | 50€ | Clôture |
| 12/01 | 250€ | **10€** | Retrait 40€ |
| 13/01 | 450€ | 10€ | Clôture |
| 14/01 | 450€ | 10€ | GAP |
| 15/01 | **550€** | 10€ | Dépôt 100€ |
| 16/01 | **750€** | 10€ | Dépôt 200€ |
| 17/01 | 870€ | 60€ | Clôture |
| 18/01 | **1050€** | **70€** | Clôture |

### ✅ TOTAL FINAL :
- **Banque** : 1050€
- **Prime de Noël** : 70€
- **TOTAL COFFRE** : **1120€**

## 🚀 Utilisation

### Étape 1 : Récupérer vos identifiants

Allez sur Firebase Console et récupérez :
- Votre `restaurantId`
- Votre `userId`
- Votre nom d'utilisateur

### Étape 2 : Modifier le script

Ouvrez `createTestDataset.js` et modifiez les lignes 19-21 :

```javascript
const RESTAURANT_ID = 'VOTRE_RESTAURANT_ID'; // ← À REMPLACER
const USER_ID = 'VOTRE_USER_ID';             // ← À REMPLACER
const USER_NAME = 'Votre Nom';               // ← À REMPLACER
```

### Étape 3 : Installer firebase-admin

```bash
npm install firebase-admin
```

### Étape 4 : Télécharger la clé de service

1. Firebase Console → Paramètres du projet → Comptes de service
2. Cliquer sur "Générer une nouvelle clé privée"
3. Sauvegarder le fichier JSON dans le dossier racine sous le nom `serviceAccountKey.json`

### Étape 5 : (Optionnel) Nettoyer les anciennes données

Dans `createTestDataset.js`, décommentez la ligne 28 :

```javascript
await cleanOldData(); // ← Décommenter cette ligne
```

### Étape 6 : Exécuter le script

```bash
node scripts/createTestDataset.js
```

## 🧪 Vérification

Après l'exécution, vérifiez :

1. **Dashboard → Récapitulatif → Tableau** :
   - Doit montrer les gaps (1 jour + 3 jours)
   - Pagination correcte

2. **Dashboard → Récapitulatif → Coffre** :
   - Le graphique doit montrer les valeurs ci-dessus
   - Les valeurs doivent correspondre à l'outil Safe

3. **/tools/safe** :
   - Extra-Flow : 70€
   - Banque : 1050€
   - Total : 1120€

## ⚠️ Notes Importantes

- Les données de test sont créées en janvier 2025
- Si vous nettoyez (`cleanOldData()`), TOUTES les données de janvier 2025 seront supprimées
- Assurez-vous d'avoir un backup avant de nettoyer

## 🔄 Alternative : Firebase CLI

Si vous préférez ne pas utiliser Node.js, vous pouvez créer les données manuellement via la Firebase Console ou utiliser les commandes Firebase CLI.
