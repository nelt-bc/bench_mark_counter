# NEAR Counter Service

This service provides benchmarking and account management utilities for NEAR blockchain operations.

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- NEAR account with testnet access

## Installation

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
M_PRIVATE_KEY=your_master_account_private_key
M_ACCOUNT_ID=your_master_account_id
NEAR_RPC=https://rpc.testnet.fastnear.com
```

### Required Environment Variables

- `M_PRIVATE_KEY`: Private key of your master NEAR account
- `M_ACCOUNT_ID`: Account ID of your master NEAR account  
- `NEAR_RPC`: NEAR RPC endpoint (defaults to testnet if not provided)

## Available Scripts

### 1. Benchmark Script

Runs performance benchmarks for various NEAR operations including single and simultaneous read/write operations.

```bash
yarn benchmark
```

**What it does:**
- Executes single read/write operations
- Executes simultaneous read/write operations
- Provides performance metrics and timing data
- Uses the configured `singleRunTimes` (default: 3) for each benchmark

### 2. Sub-Account Creation Script

Creates and funds multiple sub-accounts for testing purposes.

```bash
yarn accounts --times <number_of_accounts>
```

**Parameters:**
- `--times` or `-t`: Number of sub-accounts to create (required, must be positive)

**Examples:**
```bash
# Create 5 sub-accounts
yarn accounts --times 5

# Create 10 sub-accounts using short flag
yarn accounts -t 10
```

## Usage Examples

### Running Benchmarks
```bash
# Run all benchmark tests
yarn benchmark
```

### Creating Test Accounts
```bash
# Create 3 test accounts
yarn accounts --times 3

# Create 10 test accounts
yarn accounts -t 10
```

## Project Structure

```
service/
├── config.ts              # Configuration and environment variables
├── scripts/
│   ├── benchmark.ts       # Benchmark execution script
│   └── subAccount.ts      # Sub-account creation script
├── service/
│   ├── benchmark.ts       # Benchmark service logic
│   ├── single.ts          # Single operation implementations
│   └── simultaneously.ts  # Simultaneous operation implementations
└── utils/
    ├── db.ts              # Database utilities
    ├── near.ts            # NEAR blockchain utilities
    └── string.ts          # String manipulation utilities
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure your `.env` file exists and contains all required variables
   - Check that `M_PRIVATE_KEY` and `M_ACCOUNT_ID` are correctly set

2. **NEAR RPC Connection Issues**
   - Verify your internet connection
   - Check if the RPC endpoint is accessible
   - Consider using a different RPC endpoint if needed

3. **Insufficient Funds**
   - Ensure your master account has sufficient NEAR tokens for creating sub-accounts
   - For testnet, you can get free tokens from the NEAR faucet

### Error Messages

- `'--times' must be a positive number`: Ensure you provide a valid positive number for the accounts script
- `CRITICAL ERROR in main execution`: Check the error details in the console output for specific issues

## Development

This project uses TypeScript and includes the following key dependencies:

- `near-api-js`: NEAR blockchain SDK
- `yargs`: Command-line argument parsing
- `dotenv`: Environment variable management
- `ts-node`: TypeScript execution

## License

ISC License 