#!/usr/bin/env node

const path = require('path');
const os = require('os');
const dotenv = require('dotenv');
const ChildProcess = require('child_process');
const speakeasy = require('speakeasy');
const fs = require('fs');

function resolveDirectory(directory, homeDirectory) {
  let fullPath = directory.replace(/^\~/, homeDirectory);
  return path.resolve(process.cwd(), fullPath);
}

function writeAuthFile(homeDirectory, username, password, totpSecret) {
  const filePath = path.join(homeDirectory, '.openvpn.auth');
  const token = speakeasy.totp({
    secret: totpSecret,
    encoding: 'base32'
  });
  return new Promise((resolve, reject) => {
    try {
      const authPayload = `${username}\n${password}${token}\n`;
      fs.writeFile(filePath, authPayload, { mode: 0o0700 }, (err) => {
        if (err) {
          fs.unlinkSync(filePath);
          return reject(err);
        }
        resolve(filePath);
      });
    } catch (err) {
      fs.unlinkSync(filePath);
      return reject(err);
    }
  });
}

function deleteAuthFile(filePath) {
  fs.unlinkSync(filePath);
}

function startClient(ovpnFilePath, authFilePath) {
  const spawnArgs = [
    '--config', ovpnFilePath,
    '--auth-user-pass', authFilePath,
    '--auth-nocache'
  ];
  
  return new Promise((resolve, reject) => {
    let childProcess;
    const args = spawnArgs.join(' ');
    if (os.platform() === "win32") {
      const script = path.join(__dirname, 'runas.vbs');
      const command = `${script} "${args}"`;
      childProcess = ChildProcess.exec(command);
    } else {
      const command = `openvpn ${args}`;
      childProcess = ChildProcess.exec(command);
    }
    childProcess.stderr.pipe(process.stderr);
    childProcess.stdout.pipe(process.stdout);
    childProcess.on('error', reject);
    childProcess.on('exit', () => { resolve(); });
  });
}

(async function start() {

  // Load the configuration file fromm home directory
  const homeDirectory = os.homedir();
  const configPath = path.join(homeDirectory, '.openvpn');
  dotenv.config({ path: configPath });

  // Grab values from loaded environnement
  const username = process.env.OPENVPN_USERNAME;
  const password = process.env.OPENVPN_PASSWORD;
  const totpSecret = process.env.OPENVPN_TOTP_SECRET;

  const authFilePath = await writeAuthFile(homeDirectory, username, password, totpSecret);
  try {
    const ovpnFilePath = process.env.OPENVPN_CONFIG_FILE;
    const resolvedOvpnFilePath= resolveDirectory(ovpnFilePath, homeDirectory);
    await startClient(resolvedOvpnFilePath, authFilePath);
  } finally {
    setTimeout(() => {
      deleteAuthFile(authFilePath);
    }, 500);
  }
})()
