import path from 'path';
import dotenv from 'dotenv';
import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const secretKey = process.env['SECRET_KEY'];
if (!secretKey) {
  throw new Error('SECRET_KEY variable is not defined');
}

const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));

const connection = new Connection(clusterApiUrl('devnet'));

const balanceInLamports = await connection.getBalance(keypair.publicKey);
const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(`Address: ${keypair.publicKey.toBase58()}`);
console.log(`Balance: ${balanceInSOL}`);
