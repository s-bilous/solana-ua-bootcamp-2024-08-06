import path from 'path';
import dotenv from 'dotenv';
import { Keypair } from '@solana/web3.js';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const privateKey = process.env['SECRET_KEY'];
if (privateKey === undefined) {
  console.log('Add SECRET_KEY to .env!');
  process.exit(1);
}

const asArray = Uint8Array.from(JSON.parse(privateKey));
const keypair = Keypair.fromSecretKey(asArray);

console.log(`Public key: ${keypair.publicKey.toBase58()}`);
