import { Account, KeyPair, KeyPairSigner, Near, providers } from "near-api-js";
import { config } from "../config";
import { KeyPairString } from "near-api-js/lib/utils";
import { Database } from "./db";
import { Provider } from "near-api-js/lib/providers";
import { v4 as uuidv4 } from "uuid";
import { TxExecutionStatus } from "@near-js/types";

export type ContractCallParams =
  | SingleContractCallParams
  | SimultaneouslyContractCallParams;

type SingleContractCallParams = {
  contractId: string;
  methodName: string;
  args: Record<string, unknown>;
  accountId: string;
  isReadOnly?: boolean;
  txFinality?: TxExecutionStatus;
};

type SimultaneouslyContractCallParams = {
  contractId: string;
  methodName: string;
  args: Record<string, unknown>;
  accountIds: string[];
  isReadOnly?: boolean;
  txFinality?: TxExecutionStatus;
};

export class NearUtils {
  near: Near;
  provider: Provider;
  db: Database;
  constructor(nodeUrl: string = config.nodeUrl) {
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

  private readonly callReadFunction = (params: SingleContractCallParams) => {
    const account = this.getAccount(params.accountId);
    return account.provider.callFunction(
      params.contractId,
      params.methodName,
      params.args
    );
  };

  private readonly callWriteFunction = (params: SingleContractCallParams) => {
    const account = this.getAccount(params.accountId);
    return account.callFunction({
      contractId: params.contractId,
      methodName: params.methodName,
      args: params.args,
      waitUntil: params.txFinality ?? "INCLUDED",
    });
  };

  callFunction = async (params: SingleContractCallParams) => {
    return params.isReadOnly
      ? this.callReadFunction(params)
      : this.callWriteFunction(params);
  };

  callSimultaneously = async (params: SimultaneouslyContractCallParams) => {
    return Promise.allSettled(
      params.accountIds.map((accountId) =>
        this.callFunction({ ...params, accountId })
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
