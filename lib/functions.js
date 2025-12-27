const axios = require('axios');
const fs = require('fs-extra');
const moment = require('moment-timezone');
const config = require('../config.js');

/**
 * Format time
 * @param {Date} date 
 * @returns {string}
 */
function formatTime(date) {
  return moment(date).tz(config.timezone).format('HH:mm:ss');
}

/**
 * Format date
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
  return moment(date).tz(config.timezone).format('DD/MM/YYYY');
}

/**
 * Format duration (ms) to HH:mm:ss
 * @param {number} ms 
 * @returns {string}
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Download file from URL
 * @param {string} url 
 * @param {string} filepath 
 * @returns {Promise<void>}
 */
async function downloadFile(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Get buffer from URL
 * @param {string} url 
 * @returns {Promise<Buffer>}
 */
async function getBuffer(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

/**
 * Random choice from array
 * @param {Array} arr 
 * @returns {any}
 */
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Delay
 * @param {number} ms 
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  formatTime,
  formatDate,
  formatDuration,
  downloadFile,
  getBuffer,
  randomChoice,
  delay,
};
