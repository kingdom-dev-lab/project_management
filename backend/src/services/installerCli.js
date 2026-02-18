import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { runInstallation } from './installer.js';

async function main() {
  const rl = readline.createInterface({ input, output });
  const payload = {
    systemName: await rl.question('System Name: '),
    dbHost: await rl.question('Database Host: '),
    dbName: await rl.question('Database Name: '),
    dbUser: await rl.question('Database User: '),
    dbPassword: await rl.question('Database Password: '),
    adminEmail: await rl.question('Admin Email: '),
    adminPassword: await rl.question('Admin Password: ')
  };
  rl.close();

  await runInstallation(payload);
  console.log('Installation completed.');
}

main();
