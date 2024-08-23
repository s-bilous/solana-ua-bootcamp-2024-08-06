use dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    instruction::Instruction,
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

    let associated_token_address =
        spl_associated_token_account::get_associated_token_address(&target_pubkey, &mint_pubkey);
    println!("Associated token account: {}", associated_token_address);

    let rpc_client = RpcClient::new("https://api.devnet.solana.com");

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get latest blockhash");

    let mut instructions: Vec<Instruction> = Vec::new();

    if rpc_client.get_account(&associated_token_address).is_err() {
        instructions.push(
            spl_associated_token_account::instruction::create_associated_token_account(
                &signer_account.pubkey(),
                &target_pubkey,
                &mint_pubkey,
                &spl_token::ID,
            ),
        )
    }

    instructions.push(
        spl_token::instruction::mint_to(
            &spl_token::ID,
            &mint_pubkey,
            &associated_token_address,
            &signer_account.pubkey(),
            &[&signer_account.pubkey()],
            10 * (10 as u64).pow(2),
        )
        .unwrap(),
    );

    let transaction = Transaction::new_signed_with_payer(
        instructions.as_slice(),
        Some(&signer_account.pubkey()),
        &[&signer_account],
        recent_blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

    println!("Transaction confirmed: {}", signature);
}
