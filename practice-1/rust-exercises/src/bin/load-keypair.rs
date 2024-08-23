use dotenv;
use solana_sdk::signer::{keypair::Keypair, Signer};
use std::env;

fn main() {
    dotenv::from_filename("../../.env").ok();

    let private_key_string: String = env::var("SECRET_KEY").expect("SECRET_KEY was not found");
    let private_key_bytes: Vec<u8> = serde_json::from_str(&private_key_string).unwrap();

    let keypair = Keypair::from_bytes(&private_key_bytes).expect("SECRET_KEY is invalid");
    println!("Address: {}", keypair.pubkey().to_string());
}
