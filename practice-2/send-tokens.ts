import path from 'path';
import dotenv from 'dotenv';
import {
  Keypair,
  PublicKey,
  Connection,
  clusterApiUrl,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  mintTo,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from '@solana/spl-token';

const TRANSFER_AMOUNT = 10 * 10 ** 2;

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const getAccount = (index?: number) => {
  const key = typeof index === 'number' ? `SECRET_KEY_${index}` : 'SECRET_KEY';
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} variable is not defined`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(value)));
};

const sender = getAccount();
console.log(`Sender: ${sender.publicKey.toBase58()}`);

const recipient = getAccount(0);
console.log(`Recipient: ${recipient.publicKey.toBase58()}`);

const mint = new PublicKey('25pRcY2spC9A668r5gX9bDzMuNZVt2yFoqmzFApNWAhd');
console.log(`Mint: ${mint.toBase58()}`);

const connection = new Connection(clusterApiUrl('devnet'));
const latestBlockhash = await connection.getLatestBlockhash();

const senderAssociatedAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  mint,
  sender.publicKey,
);

const recipientAssociatedAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  recipient,
  mint,
  recipient.publicKey,
);

await mintTo(connection, sender, mint, senderAssociatedAccount.address, sender, TRANSFER_AMOUNT);

const transaction = new Transaction({
  ...latestBlockhash,
  feePayer: recipient.publicKey,
}).add(
  createTransferInstruction(
    senderAssociatedAccount.address,
    recipientAssociatedAccount.address,
    sender.publicKey,
    TRANSFER_AMOUNT,
  ),
);

const signature = await sendAndConfirmTransaction(connection, transaction, [sender, recipient]);
console.log(`Transaction confirmed: ${signature}`);
