use dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    program_pack::Pack,
    signer::{keypair::Keypair, Signer},
    transaction::Transaction,
};
use spl_token::state::Mint;
use std::env;

fn main() {
    dotenv::from_filename("../../.env").ok();

    let private_key_string: String = env::var("SECRET_KEY").expect("SECRET_KEY was not found");
    let private_key_bytes: Vec<u8> = serde_json::from_str(&private_key_string).unwrap();

    let signer_account = Keypair::from_bytes(&private_key_bytes).expect("SECRET_KEY is invalid");
    println!("Signer account: {}", signer_account.pubkey().to_string());

    let mint_account = Keypair::new();
    println!("Mint account: {}", mint_account.pubkey().to_string());

    let rpc_client = RpcClient::new("https://api.devnet.solana.com");

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get latest blockhash");

    let minimum_balance_for_rent_exemption = rpc_client
        .get_minimum_balance_for_rent_exemption(Mint::LEN)
        .expect("Failed to get minimum balance for rent exemption");

    let create_account_instruction = solana_sdk::system_instruction::create_account(
        &signer_account.pubkey(),
        &mint_account.pubkey(),
        minimum_balance_for_rent_exemption,
        Mint::LEN as u64,
        &spl_token::ID,
    );

    let initialize_mint_instruction = spl_token::instruction::initialize_mint(
        &spl_token::ID,
        &mint_account.pubkey(),
        &signer_account.pubkey(),
        None,
        2,
    )
    .unwrap();

    let transaction = Transaction::new_signed_with_payer(
        &[create_account_instruction, initialize_mint_instruction],
        Some(&signer_account.pubkey()),
        &[&signer_account, &mint_account],
        recent_blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

    println!("Transaction confirmed: {}", signature);
}
