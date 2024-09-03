import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { Favorites } from '../target/types/favorites';
import { airdropIfRequired, getCustomErrorMessage } from '@solana-developers/helpers';
import { expect, describe } from '@jest/globals';
import { systemProgramErrors } from './system-program-errors';

describe('favorites', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  it('Writes our favorites to the blockchain', async () => {
    const user = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;

    console.log(`User public key: ${user.publicKey}`);

    await airdropIfRequired(
      anchor.getProvider().connection,
      user.publicKey,
      0.5 * web3.LAMPORTS_PER_SOL,
      1 * web3.LAMPORTS_PER_SOL
    );

    const favoriteNumber = new anchor.BN(23);
    const favoriteColor = 'red';

    try {
      const tx = await program.methods
        .setFavorites(favoriteNumber, favoriteColor)
        .accounts({
          user: user.publicKey,
        })
        .signers([user])
        .rpc();

      console.log(`Tx signature: ${tx}`);
    } catch (thrownObject) {
      const rawError = thrownObject as Error;
      throw new Error(getCustomErrorMessage(systemProgramErrors, rawError.message));
    }

    // Calculate the PDA account address that holds the user's favorites
    const [favoritesPda, _favoritesBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('favorites'), user.publicKey.toBuffer()],
      program.programId
    );

    // And make sure it matches!
    const dataFromPda = await program.account.favorites.fetch(favoritesPda);
    expect(dataFromPda.color).toEqual(favoriteColor);
    expect(dataFromPda.number.toNumber()).toEqual(favoriteNumber.toNumber());
  });
});
