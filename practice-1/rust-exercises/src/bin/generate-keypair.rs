use solana_sdk::signer::{keypair::Keypair, Signer};

fn main() {
    let keypair = Keypair::new();

    println!("Public key: {}", keypair.pubkey().to_string());
    println!("Secret key: {:?}", keypair.secret().to_bytes());
}
