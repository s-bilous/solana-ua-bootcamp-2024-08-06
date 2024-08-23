use dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    instruction::AccountMeta,
    instruction::Instruction,
    pubkey::Pubkey,
    signer::{keypair::Keypair, Signer},
    system_instruction,
    transaction::Transaction,
};
use std::{env, str::FromStr};

fn main() {
    dotenv::from_filename("../../.env").ok();

    let private_key_string: String = env::var("SECRET_KEY").expect("SECRET_KEY was not found");
    let private_key_bytes: Vec<u8> = serde_json::from_str(&private_key_string).unwrap();

    let sender = Keypair::from_bytes(&private_key_bytes).expect("SECRET_KEY is invalid");
    println!("Sender public key: {}", sender.pubkey().to_string());

    let recipient = Pubkey::from_str("jNm968EKytCzANZgKquCWax99b6ezJoZYnVCgdeA32F").unwrap();
    println!("Recipient public key: {}", recipient);

    let memo_program = Pubkey::from_str("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr").unwrap();
    let memo_text = "Hello, World!";

    let rpc_client = RpcClient::new("https://api.devnet.solana.com");

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get latest blockhash");

    let transfer_instruction = system_instruction::transfer(
        &sender.pubkey(),
        &recipient,
        (0.1 * solana_sdk::native_token::LAMPORTS_PER_SOL as f64) as u64,
    );

    let memo_instruction = Instruction {
        accounts: vec![AccountMeta::new(sender.pubkey(), true)],
        data: memo_text.as_bytes().to_vec(),
        program_id: memo_program,
    };

    let transaction = Transaction::new_signed_with_payer(
        &[transfer_instruction, memo_instruction],
        Some(&sender.pubkey()),
        &[&sender],
        recent_blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

    println!("Transaction confirmed: {}", signature);
}
