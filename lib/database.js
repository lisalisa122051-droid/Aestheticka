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
            public: true, // Default public
        },
    };
    fs.writeJsonSync(dbPath, initialData, { spaces: 2 });
}

// Read database
function readDB() {
    try {
        return fs.readJsonSync(dbPath);
    } catch (error) {
        console.error('Error reading database:', error);
        return { groups: {}, users: {}, settings: {} };
    }
}

// Write database
function writeDB(data) {
    try {
        fs.writeJsonSync(dbPath, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// Group functions
function getGroupData(groupId) {
    const db = readDB();
    if (!db.groups[groupId]) {
        db.groups[groupId] = {
            welcome: false,
            antilink: false,
            rules: '',
            created: new Date().toISOString(),
        };
        writeDB(db);
    }
    return db.groups[groupId];
}

function updateGroupData(groupId, data) {
    const db = readDB();
    db.groups[groupId] = { ...db.groups[groupId], ...data };
    return writeDB(db);
}

function deleteGroupData(groupId) {
    const db = readDB();
    delete db.groups[groupId];
    return writeDB(db);
}

// User functions
function getUserData(userId) {
    const db = readDB();
    if (!db.users[userId]) {
        db.users[userId] = {
            banned: false,
            premium: false,
            limit: 1000,
            level: 1,
            exp: 0,
            joinDate: new Date().toISOString(),
        };
        writeDB(db);
    }
    return db.users[userId];
}

function updateUserData(userId, data) {
    const db = readDB();
    db.users[userId] = { ...db.users[userId], ...data };
    return writeDB(db);
}

// Settings functions
function getSettings() {
    const db = readDB();
    return db.settings || { welcome: false, antilink: false, public: true };
}

function updateSettings(data) {
    const db = readDB();
    db.settings = { ...db.settings, ...data };
    return writeDB(db);
}

// Utility functions
function getAllGroups() {
    const db = readDB();
    return Object.keys(db.groups);
}

function getAllUsers() {
    const db = readDB();
    return Object.keys(db.users);
}

function getStats() {
    const db = readDB();
    return {
        totalGroups: Object.keys(db.groups).length,
        totalUsers: Object.keys(db.users).length,
        settings: db.settings,
    };
}

module.exports = {
    readDB,
    writeDB,
    getGroupData,
    updateGroupData,
    deleteGroupData,
    getUserData,
    updateUserData,
    getSettings,
    updateSettings,
    getAllGroups,
    getAllUsers,
    getStats,
};
