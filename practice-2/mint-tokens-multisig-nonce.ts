import path from 'path';
import dotenv from 'dotenv';
import {
  Keypair,
  PublicKey,
  Connection,
  clusterApiUrl,
  Transaction,
  sendAndConfirmTransaction,
  sendAndConfirmRawTransaction,
  SystemProgram,
  NonceAccount,
  NONCE_ACCOUNT_LENGTH,
} from '@solana/web3.js';
import {
  createMint,
  createMultisig,
  createMintToInstruction,
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

const nonceKeypair = Keypair.generate();

const createNonceAccountTransaction = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: nonceKeypair.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH),
    space: NONCE_ACCOUNT_LENGTH,
    programId: SystemProgram.programId,
  }),
  SystemProgram.nonceInitialize({
    noncePubkey: nonceKeypair.publicKey,
    authorizedPubkey: payer.publicKey,
  }),
);

await sendAndConfirmTransaction(connection, createNonceAccountTransaction, [payer, nonceKeypair]);
console.log(`Nonce account: ${nonceKeypair.publicKey.toBase58()}`);

const nonceAccountInfo = await connection.getAccountInfo(nonceKeypair.publicKey, 'confirmed');
const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo!.data);

const createMintTransaction = new Transaction()
  .add(
    SystemProgram.nonceAdvance({
      noncePubkey: nonceKeypair.publicKey,
      authorizedPubkey: payer.publicKey,
    }),
  )
  .add(
    createMintToInstruction(
      mint,
      associatedAccount.address,
      multisigKey,
      10 * Math.pow(10, TOKEN_DECIMALS),
      signers,
    ),
  );

createMintTransaction.recentBlockhash = nonceAccount.nonce;
createMintTransaction.feePayer = payer.publicKey;
createMintTransaction.partialSign(payer);

await new Promise((resolve) => {
  console.log('Waiting 2 minutes...');
  setTimeout(resolve, 2 * 60 * 1000);
});

signers.forEach((signer) => createMintTransaction.partialSign(signer));

const signature = await sendAndConfirmRawTransaction(connection, createMintTransaction.serialize());
console.log(`Transaction confirmed: ${signature}`);
