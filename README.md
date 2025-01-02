# Solana Mnemonic Recovery Tool

Utility to recover 24-word Solana wallet mnemonics from a 25-word input.

## Installation

```bash
git clone https://github.com/yourusername/solana-mnemonic-recovery
cd solana-mnemonic-recovery
npm install
```

## Usage

```bash
npm start "word1 word2 ... word25"
```

The tool will:
- Generate all possible 24-word combinations
- Check each combination for valid Solana wallets
- Save found wallets to found_wallets.txt

## Safety
- Only works with valid BIP39 words
- Runs locally on your machine
- Saves results to local file
