const fs = require('fs-extra');
const path = require('path');
const config = require('../config.js');

const dbPath = path.resolve(__dirname, '..', config.database);

// Initialize database if not exists
if (!fs.existsSync(dbPath)) {
  const initialData = {
    groups: {},
    users: {},
    settings: {
      welcome: false,
      antilink: false,
      public: false,
    },
  };
  fs.writeJsonSync(dbPath, initialData, { spaces: 2 });
}

// Read database
function readDB() {
  return fs.readJsonSync(dbPath);
}

// Write database
function writeDB(data) {
  fs.writeJsonSync(dbPath, data, { spaces: 2 });
}

// Group functions
function getGroupData(groupId) {
  const db = readDB();
  if (!db.groups[groupId]) {
    db.groups[groupId] = {
      welcome: false,
      antilink: false,
      rules: '',
    };
    writeDB(db);
  }
  return db.groups[groupId];
}

function updateGroupData(groupId, data) {
  const db = readDB();
  db.groups[groupId] = { ...db.groups[groupId], ...data };
  writeDB(db);
}

// User functions
function getUserData(userId) {
  const db = readDB();
  if (!db.users[userId]) {
    db.users[userId] = {
      banned: false,
      premium: false,
      limit: 100,
    };
    writeDB(db);
  }
  return db.users[userId];
}

function updateUserData(userId, data) {
  const db = readDB();
  db.users[userId] = { ...db.users[userId], ...data };
  writeDB(db);
}

// Settings functions
function getSettings() {
  const db = readDB();
  return db.settings;
}

function updateSettings(data) {
  const db = readDB();
  db.settings = { ...db.settings, ...data };
  writeDB(db);
}

module.exports = {
  readDB,
  writeDB,
  getGroupData,
  updateGroupData,
  getUserData,
  updateUserData,
  getSettings,
  updateSettings,
};
