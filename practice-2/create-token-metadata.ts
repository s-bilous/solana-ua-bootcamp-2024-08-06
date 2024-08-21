import path from 'path';
import dotenv from 'dotenv';
import {
  Keypair,
  PublicKey,
  Connection,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const secretKey = process.env['SECRET_KEY'];
if (!secretKey) {
  throw new Error('SECRET_KEY variable is not defined');
}

const sender = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
console.log(`Public key: ${sender.publicKey.toBase58()}`);

const tokenMint = new PublicKey('25pRcY2spC9A668r5gX9bDzMuNZVt2yFoqmzFApNWAhd');
console.log(`Token address: ${tokenMint}`);

const [metadataPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('metadata'), PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
  PROGRAM_ID,
);

const connection = new Connection(clusterApiUrl('devnet'));
const transaction = new Transaction().add(
  createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMint,
      mintAuthority: sender.publicKey,
      payer: sender.publicKey,
      updateAuthority: sender.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: 'Kitten',
          symbol: 'KIT',
          uri: 'https://ipfs.io/ipfs/QmUBMamGppK6iA1UPWiM8NQboqDkuXvtAHyYbBJNSGjmWo',
          uses: null,
          creators: null,
          collection: null,
          sellerFeeBasisPoints: 0,
        },
        collectionDetails: null,
        isMutable: true,
      },
    },
  ),
);

const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);
console.log(`Transaction confirmed: ${signature}`);
