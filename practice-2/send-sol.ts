import path from 'path';
import dotenv from 'dotenv';
import {
  Keypair,
  PublicKey,
  Connection,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  clusterApiUrl,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const secretKey = process.env['SECRET_KEY'];
if (!secretKey) {
  throw new Error('SECRET_KEY variable is not defined');
}

const sender = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
console.log(`Sender public key: ${sender.publicKey.toBase58()}`);

const recipient = new PublicKey('jNm968EKytCzANZgKquCWax99b6ezJoZYnVCgdeA32F');
console.log(`Recipient public key: ${recipient.toBase58()}`);

const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const memoText = 'Hello, World!';

const connection = new Connection(clusterApiUrl('devnet'));
const transaction = new Transaction()
  .add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    }),
  )
  .add(
    new TransactionInstruction({
      keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: true }],
      data: Buffer.from(memoText, 'utf-8'),
      programId: memoProgram,
    }),
  );

const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);
console.log(`Transaction confirmed: ${signature}`);
