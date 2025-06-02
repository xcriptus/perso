# 📊 Accès à Google Sheets via TypeScript

Ce guide explique comment lire et écrire dans un onglet d’un fichier Google Sheets à l’aide de TypeScript et de l’API Google Sheets.

---

## ✅ Étape 1 : Créer un projet Google Cloud

1. Aller sur [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. En haut à gauche, cliquer sur le sélecteur de projet
3. Cliquer sur **"New Project"**
4. Donner un nom à votre projet (ex : `gspread-typescript`)
5. Cliquer sur **"Create"**

---

## ✅ Étape 2 : Activer les APIs nécessaires

### 🔹 Activer Google Sheets API

1. Dans la barre de recherche en haut, taper `Google Sheets API`
2. Cliquer sur le résultat **Google Sheets API**
3. Cliquer sur **"Enable"**

### 🔹 Activer Google Drive API

1. Rechercher `Google Drive API` dans la barre de recherche
2. Cliquer sur **Google Drive API**
3. Cliquer sur **"Enable"**

---

## ✅ Étape 3 : Créer des identifiants (Service Account)

### 🔸 Créer un compte de service

1. Aller dans **"APIs & Services"** > **"Credentials"**
2. Cliquer sur le bouton bleu **"+ CREATE CREDENTIALS"**
3. Choisir **"Service Account"**
4. Remplir :
   - **Service account name** (ex : `sheet-accessor`)
   - Cliquer sur **"Create and Continue"**
5. (Optionnel) Choisir un rôle basique : **Basic > Editor**, ou cliquer directement sur **"Done"**

### 🔸 Créer et télécharger une clé JSON

1. Dans la liste des comptes de service, cliquer sur le nom de celui que vous venez de créer
2. Aller à l’onglet **“Keys”**
3. Cliquer sur **“Add Key”** > **“Create new key”**
4. Choisir **JSON**, puis cliquer sur **“Create”**
5. Le fichier `.json` est téléchargé automatiquement — **conservez-le en sécurité**

---

## 🔐 Étape 4 : Partager le Google Sheet

1. Ouvrir le Google Sheet cible dans votre navigateur
2. Cliquer sur **"Share"**
3. Ajouter l’adresse email du compte de service (ex : `xxxxx@your-project.iam.gserviceaccount.com`)
4. Lui donner les droits **Editor**

---

✅ Vous êtes maintenant prêt à utiliser l’API Google Sheets dans un projet TypeScript !
