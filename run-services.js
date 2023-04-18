#!/usr/bin/env node
import { exec } from 'node:child_process';
import { writeFile, appendFile } from 'node:fs/promises';

const logFile = 'log.txt';
const debug = false;

// Start log file, overwriting any previous file
if (debug) {
  try {
    writeFile(
      logFile,
      'Log file started at ' + new Date().toLocaleTimeString() + '.'
    );
  } catch (err) {
    console.log(err);
  }
}

async function localLog(message) {
  if (debug) {
    try {
      await appendFile(logFile, message + '\r\n');
    } catch (err) {
      console.log(err);
    }
  }
}
localLog('');

const children = new Array();

async function execute(command, arg) {
  localLog('Executing command ' + command);
  const promise = new Promise((resolve, reject) => {
    const child = exec(command, arg, (error, stdout, stderr) => {
      if (error) {
        cleanUp();
        throw error;
      }
      console.log('ExecFile result: ' + stdout);
      resolve(stdout);
    });
    children.push(child);
    child.stdout.on('data', (data) => {
      const message = data;
      if (!(data.length === 2 && data == 'c')) {
        console.log(message);
      }
      localLog(message);
    });
  });
  return promise;
}

// e.g. getExecutableResult('which sass');
async function getExecutableResult(command) {
  const promise = new Promise((resolve, reject) => {
    const child = exec(command, null, (error, stdout, stderr) => {
      if (error) {
        cleanUp();
        throw error;
      }
      console.log(stdout);
      resolve(stdout);
    });
    children.push(child);
    child.stdout.on('data', (data) => {
      const message = data;
      console.log(message);
      localLog(message);
    });
  });
  return promise;
}

async function cleanUp() {
  for (let child of children) {
    child.kill();
  }
}

async function run() {
  // Set off sass
  execute('sass --watch ./docs/*.scss ./docs/styles/styles.css');

  // Set off typescript compiler
  execute('tsc --watch');

  // set off vite
  execute('vite docs');
}

run();
