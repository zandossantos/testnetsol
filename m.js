const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');

async function main() {
    // Load wallet
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('wallet/my-keypair.json')));
    const keypair = Keypair.fromSecretKey(secretKey);

    // Connect to Solana testnet
    const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

    // Initialize Metaplex
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(keypair));

    // List of metadata URIs
    const metadataUris = [
        'https://raw.githubusercontent.com/zandossantos/testnetsol/main/metadatablack.json',
        'https://raw.githubusercontent.com/zandossantos/testnetsol/main/metadatablue.json',
        'https://raw.githubusercontent.com/zandossantos/testnetsol/main/metadatayellow.json',
    ];

    // Define the creators array
    const creators = [{
        address: keypair.publicKey.toBase58(),
        verified: true,
        share: 100
    }];

    // Loop through metadata URIs and mint an NFT for each
    for (const uri of metadataUris) {
        try {
            const { nft } = await metaplex.nfts().create({
                uri: uri,
                name: 'Block Chain Bidder',
                symbol: 'BCB',
                sellerFeeBasisPoints: 0, // 0% royalty fee
                creators: creators.map(creator => ({
                    ...creator,
                    address: new PublicKey(creator.address)
                })),
                updateAuthority: keypair.publicKey,
                mintAuthority: keypair.publicKey,
            });
            console.log('Minted NFT:', nft);
        } catch (error) {
            console.error('Failed to mint NFT for URI:', uri, error);
        }
    }
}

main().catch(console.error);
