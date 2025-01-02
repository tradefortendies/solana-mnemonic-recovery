const { Connection, PublicKey } = require('@solana/web3.js');
const bip39 = require('bip39');
const ed25519 = require('ed25519-hdkey');
const fs = require('fs');

const BATCH_SIZE = 100; // Number of combinations to check at once
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

async function checkMnemonic(mnemonic) {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const derivedKey = ed25519.fromMasterSeed(seed).derivePath("m/44'/501'/0'/0'");
        const keyPair = derivedKey.getKey();
        const publicKey = new PublicKey(keyPair.publicKey);
        
        const connection = new Connection(RPC_ENDPOINT);
        const balance = await connection.getBalance(publicKey);
        
        if (balance > 0) {
            console.log('\nFound valid wallet!');
            console.log('Mnemonic:', mnemonic);
            console.log('Public Key:', publicKey.toString());
            console.log('Balance:', balance / 1e9, 'SOL');
            fs.appendFileSync('found_wallets.txt', 
                `\nMnemonic: ${mnemonic}\nPublic Key: ${publicKey.toString()}\nBalance: ${balance / 1e9} SOL\n`);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

async function generatePermutations(words) {
    const results = [];
    for (let i = 0; i < words.length; i++) {
        const subset = [...words.slice(0, i), ...words.slice(i + 1)];
        if (subset.length === 24) {
            results.push(subset.join(' '));
        }
    }
    return results;
}

async function main() {
    if (process.argv.length !== 3) {
        console.log('Usage: node script.js "word1 word2 ... word25"');
        process.exit(1);
    }

    const words = process.argv[2].split(' ');
    if (words.length !== 25) {
        console.log('Error: Please provide exactly 25 words');
        process.exit(1);
    }

    // Validate all words against BIP39 wordlist
    const invalidWords = words.filter(word => !bip39.wordlists.english.includes(word));
    if (invalidWords.length > 0) {
        console.log('Error: Invalid BIP39 words found:', invalidWords.join(', '));
        process.exit(1);
    }

    console.log('Generating and checking permutations...');
    const permutations = await generatePermutations(words);
    
    for (let i = 0; i < permutations.length; i += BATCH_SIZE) {
        const batch = permutations.slice(i, i + BATCH_SIZE);
        const promises = batch.map(mnemonic => checkMnemonic(mnemonic));
        
        await Promise.all(promises);
        console.log(`Checked ${i + batch.length}/${permutations.length} combinations`);
    }

    console.log('\nSearch complete. Check found_wallets.txt for results.');
}

main().catch(console.error);