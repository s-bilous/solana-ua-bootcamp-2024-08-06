import path from 'path';
import dotenv from 'dotenv';
import { Keypair, PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

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
console.log(`Token address: ${tokenMint.toBase58()}`);

const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMint,
  recipient,
);
console.log(`Token account address: ${tokenAccount.address.toBase58()}`);
