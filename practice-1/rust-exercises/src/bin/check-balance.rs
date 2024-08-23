use dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::signer::{keypair::Keypair, Signer};
use std::env;

fn main() {
    dotenv::from_filename("../../.env").ok();

    let private_key_string: String = env::var("SECRET_KEY").expect("SECRET_KEY was not found");
    let private_key_bytes: Vec<u8> = serde_json::from_str(&private_key_string).unwrap();

    let keypair = Keypair::from_bytes(&private_key_bytes).expect("SECRET_KEY is invalid");

    let rpc_client = RpcClient::new("https://api.devnet.solana.com");

    let balance_in_lamports = rpc_client.get_balance(&keypair.pubkey()).unwrap();
    let balance_in_sol =
        balance_in_lamports as f64 / solana_sdk::native_token::LAMPORTS_PER_SOL as f64;

    println!("Address: {}", keypair.pubkey().to_string());
    println!("Balance: {}", balance_in_sol);
}
