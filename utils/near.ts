import { Account, KeyPair, KeyPairSigner, Near, providers } from "near-api-js";
import { config } from "../config";
import { KeyPairString } from "near-api-js/lib/utils";
import { Database } from "./db";
import { Provider } from "near-api-js/lib/providers";
import { v4 as uuidv4 } from "uuid";

export class NearUtils {
  near: Near;
  provider: Provider;
  db: Database;
  constructor(nodeUrl: string = "https://rpc.testnet.fastnear.com") {
    const keyPair = KeyPair.fromString(
      config.masterAccount.privateKey as KeyPairString
    );

    const keyPairSigner = new KeyPairSigner(keyPair);
    this.provider = new providers.JsonRpcProvider({
      url: nodeUrl,
    });

    this.near = new Near({
      networkId: "testnet",
      nodeUrl,
      masterAccount: config.masterAccount.accountId,
      signer: keyPairSigner,
      initialBalance: "50000000000000000000000",
    });

    this.db = new Database();
  }

  callFunction = async (
    contractId: string,
    methodName: string,
    args: Record<string, unknown>,
    accountId: string
  ) => {
    const account = this.getAccount(accountId);
    return await account.callFunction({
      contractId,
      methodName,
      args,
      waitUntil: "FINAL"
    });
  };

  callSimultaneously = async (
    contractId: string,
    methodName: string,
    args: Record<string, unknown>,
    accountIds: string[]
  ) => {
    return await Promise.allSettled(
      accountIds.map((accountId) =>
        this.callFunction(contractId, methodName, args, accountId)
      )
    );
  };

  createFundedAccounts = async (amount: number) => {
    const keypairs: {
      publicKey: string;
      privateKey: string;
      accountId: string;
    }[] = [];
    for (let i = 0; i < amount; i++) {
      const keyPair = await this.createFundedAccount();
      keypairs.push(keyPair);
    }

    this.db.setMultiple(
      Object.fromEntries(
        keypairs.map((keypair) => [keypair.accountId, keypair.privateKey])
      ),
      "private_keys"
    );
  };

  createFundedAccount = async (): Promise<{
    publicKey: string;
    privateKey: string;
    accountId: string;
  }> => {
    const keyPair = KeyPair.fromRandom("ED25519");
    const accountId = `${uuidv4().replace(/-/g, "")}.testnet`;

    await this.near.accountCreator.createAccount(
      accountId,
      keyPair.getPublicKey()
    );
    return {
      publicKey: keyPair.getPublicKey().toString(),
      privateKey: keyPair.toString(),
      accountId,
    };
  };

  private readonly getAccount = (accountId: string) => {
    const entries = this.db.entries("private_keys");
    const privateKey = entries[accountId];
    const keyPair = KeyPair.fromString(privateKey as KeyPairString);
    const keyPairSigner = new KeyPairSigner(keyPair);
    return new Account(accountId, this.near.connection.provider, keyPairSigner);
  };
}

export const nearUtils = new NearUtils();