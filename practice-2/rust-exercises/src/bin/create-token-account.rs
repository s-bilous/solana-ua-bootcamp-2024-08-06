use dotenv;
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

    let target_pubkey = Pubkey::from_str("jNm968EKytCzANZgKquCWax99b6ezJoZYnVCgdeA32F").unwrap();
    println!("Target account: {}", target_pubkey);

    let mint_pubkey = Pubkey::from_str("7HGwfPEuheQXPNZbvC8wMJ83v9kEFiLo1vUeGvMTturG").unwrap();
    println!("Mint account: {}", mint_pubkey);

    let rpc_client = RpcClient::new("https://api.devnet.solana.com");

    let associated_token_address =
        spl_associated_token_account::get_associated_token_address(&target_pubkey, &mint_pubkey);

    if rpc_client.get_account(&associated_token_address).is_ok() {
        println!("Associated token account: {}", associated_token_address);
        return;
    }

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get latest blockhash");

    let create_account_instruction =
        spl_associated_token_account::instruction::create_associated_token_account(
            &signer_account.pubkey(),
            &target_pubkey,
            &mint_pubkey,
            &spl_token::ID,
        );

    let transaction = Transaction::new_signed_with_payer(
        &[create_account_instruction],
        Some(&signer_account.pubkey()),
        &[&signer_account],
        recent_blockhash,
    );

    rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

    println!("Associated token account: {}", associated_token_address);
}
