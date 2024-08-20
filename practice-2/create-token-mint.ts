import path from 'path';
import dotenv from 'dotenv';
import { Keypair, Connection, clusterApiUrl } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const secretKey = process.env['SECRET_KEY'];
if (!secretKey) {
  throw new Error('SECRET_KEY variable is not defined');
}

const connection = new Connection(clusterApiUrl('devnet'));

const sender = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
console.log(`Public key: ${sender.publicKey.toBase58()}`);

const tokenMint = await createMint(connection, sender, sender.publicKey, null, 2);
console.log(`Token address: ${tokenMint}`);
