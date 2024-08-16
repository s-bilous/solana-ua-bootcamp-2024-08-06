import { Keypair } from '@solana/web3.js';
import { throttle } from 'lodash-es';
import prompts from 'prompts';

const { predicate } = await prompts([
  {
    type: 'text',
    name: 'prefix',
    message: 'Enter desired prefix',
    validate: (prefix: string) => !!prefix.trim(),
  },
  {
    type: 'select',
    name: 'predicate',
    message: 'Ignore case',
    choices: (prefix: string) => [
      {
        title: 'Yes',
        value: (publicKey: string) => {
          return publicKey.toLowerCase().startsWith(prefix.toLowerCase());
        },
      },
      {
        title: 'No',
        value: (publicKey: string) => {
          return publicKey.startsWith(prefix);
        },
      },
    ],
  },
]);

let keypair: Keypair | null = null;
let attempts = 0;

const printStats = throttle(() => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`Searching... (attempts: ${attempts})`);
}, 1000);

while (true) {
  attempts++;
  keypair = Keypair.generate();

  if (predicate(keypair.publicKey.toBase58())) {
    break;
  }

  printStats();
}

printStats.flush();
console.log(`\n`);
console.log(`Public key: ${keypair.publicKey.toBase58()}`);
console.log(`Secret key: [${keypair.secretKey.join(', ')}]`);
