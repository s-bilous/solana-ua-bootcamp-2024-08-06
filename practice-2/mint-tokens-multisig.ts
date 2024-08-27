import path from 'path';
import dotenv from 'dotenv';
import { Keypair, PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import {
  mintTo,
  createMint,
  createMultisig,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

// The number of required signers
const REQUIRED_SIGNERS = 3;
// The number of decimal places
const TOKEN_DECIMALS = 2;

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

const payer = getAccount();
const recipient = new PublicKey('jNm968EKytCzANZgKquCWax99b6ezJoZYnVCgdeA32F');

const signers: Keypair[] = Array.from({ length: REQUIRED_SIGNERS }).map((_, index) => {
  const signer = getAccount(index);
  console.log(`Signer ${index}: ${signer.publicKey.toBase58()}`);
  return signer;
});

const connection = new Connection(clusterApiUrl('devnet'));

const multisigKey = await createMultisig(
  connection,
  payer,
  signers.map((signer) => signer.publicKey),
  signers.length,
);
console.log(`Multisig: ${multisigKey.toBase58()}`);

const mint = await createMint(connection, payer, multisigKey, null, TOKEN_DECIMALS);
console.log(`Mint: ${mint.toBase58()}`);

const associatedAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  recipient,
);
console.log(`Associated account: ${associatedAccount.address.toBase58()}`);

const signature = await mintTo(
  connection,
  payer,
  mint,
  associatedAccount.address,
  multisigKey,
  10 * Math.pow(10, TOKEN_DECIMALS),
  signers,
);
console.log(`Transaction confirmed: ${signature}`);
