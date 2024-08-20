import path from 'path';
import dotenv from 'dotenv';
import { Keypair, PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { mintTo, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const secretKey = process.env['SECRET_KEY'];
if (!secretKey) {
  throw new Error('SECRET_KEY variable is not defined');
}

const connection = new Connection(clusterApiUrl('devnet'));

const sender = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
console.log(`Sender public key: ${sender.publicKey.toBase58()}`);

const recipient = new PublicKey('jNm968EKytCzANZgKquCWax99b6ezJoZYnVCgdeA32F');
console.log(`Recipient public key: ${recipient.toBase58()}`);

const tokenMint = new PublicKey('25pRcY2spC9A668r5gX9bDzMuNZVt2yFoqmzFApNWAhd');
const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMint,
  recipient,
);

const signature = await mintTo(
  connection,
  sender,
  tokenMint,
  tokenAccount.address,
  sender,
  10 * MINOR_UNITS_PER_MAJOR_UNITS,
);
console.log(`Transaction confirmed: ${signature}`);
