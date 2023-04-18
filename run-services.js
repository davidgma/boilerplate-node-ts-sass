#!/usr/bin/env node
import { exec } from 'node:child_process';
import { writeFile, appendFile } from 'node:fs/promises';

const logFile = 'log.txt';

// Start log file, overwriting any previous file
try {
  writeFile(
    logFile,
    'Log file started at ' + new Date().toLocaleTimeString() + '.'
  );
} catch (err) {
  console.log(err);
}

async function localLog(message) {
  try {
    await appendFile(logFile, message);
  } catch (err) {
    console.log(err);
  }
}
localLog('');

const children = new Array();

async function execute(command, arg) {
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
      const message = 'Received chunk: ' + data;
      if (!(data.length === 2 && data == 'c')) {
        console.log(message);
      }
      localLog(message);
    });
  });
  return promise;
}

async function getExecutablePath(command) {
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
      const message = 'Received chunk: ' + data;
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
  const sassPath = await getExecutablePath('which sass');
  const sassCommand =
    'node ' +
    sassPath.trim() +
    ' --watch ./docs/*.scss ./docs/styles/styles.css';
  console.log('sassCommand: ' + sassCommand);
  execute(sassCommand);

  // Set off live server
  const lsPath = await getExecutablePath('which live-server');
  const lsCommand = 'node ' + lsPath.trim() + ' docs';
  console.log('lsCommand: ' + lsCommand);
  execute(lsCommand);

  // Set off typescript compiler
  //const tscPath = await getExecutablePath('which tsc');
  // const tscCommand =
  //   'node ' + tscPath.trim() + ' --watch ./docs/*.ts -outDir ./docs/javascript';
  const tscCommand = 'tsc --watch';
  console.log('tscCommand: ' + tscCommand);
  execute(tscCommand);
}

run();
