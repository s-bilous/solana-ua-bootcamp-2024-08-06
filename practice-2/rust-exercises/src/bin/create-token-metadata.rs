use dotenv;
use mpl_token_metadata::{instructions::CreateMetadataAccountV3Builder, types::DataV2};
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    pubkey::Pubkey,
    signer::{keypair::Keypair, Signer},
    transaction::Transaction,
};
use std::{env, str::FromStr};

fn main() {
    dotenv::from_filename("../../.env").ok();

    let private_key_string: String = env::var("SECRET_KEY").expect("SECRET_KEY was not found");
    let private_key_bytes: Vec<u8> = serde_json::from_str(&private_key_string).unwrap();

    let signer_account = Keypair::from_bytes(&private_key_bytes).expect("SECRET_KEY is invalid");
    println!("Signer account: {}", signer_account.pubkey().to_string());

    let mint_pubkey = Pubkey::from_str("7HGwfPEuheQXPNZbvC8wMJ83v9kEFiLo1vUeGvMTturG").unwrap();
    println!("Mint account: {}", mint_pubkey);

    let rpc_client = RpcClient::new("https://api.devnet.solana.com");

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get latest blockhash");

    let (metadata_pda, _) = Pubkey::find_program_address(
        &[
            "metadata".to_string().as_bytes(),
            &mpl_token_metadata::ID.to_bytes(),
            &mint_pubkey.to_bytes(),
        ],
        &mpl_token_metadata::ID,
    );

    let create_medatada_instuction = CreateMetadataAccountV3Builder::new()
        .metadata(metadata_pda)
        .mint(mint_pubkey)
        .mint_authority(signer_account.pubkey())
        .payer(signer_account.pubkey())
        .update_authority(signer_account.pubkey(), true)
        .is_mutable(true)
        .data(DataV2 {
            name: String::from("Dogs"),
            symbol: String::from("WOOF"),
            uri: String::from(""),
            uses: Option::None,
            creators: Option::None,
            collection: Option::None,
            seller_fee_basis_points: 0,
        })
        .instruction();

    let transaction = Transaction::new_signed_with_payer(
        &[create_medatada_instuction],
        Some(&signer_account.pubkey()),
        &[&signer_account],
        recent_blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

    println!("Transaction confirmed: {}", signature);
}
