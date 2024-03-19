import { useState, useMemo, useCallback } from "react";
import { Pen } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "components/ui/button";
import { useActiveChainId } from "hooks/useActiveChainId";
import { useDeployerState, setDeployedAddress, setDeployerStep } from "state/deploy/deployer.store";
///Solana
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, Transaction, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  AuthorityType,
  createInitializeMintInstruction,
  createInitializeMint2Instruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeNonTransferableMintInstruction,
  createUpdateAuthorityInstruction,
  createSetAuthorityInstruction,
  getMintLen,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import { createGenericFileFromBrowserFile } from "@metaplex-foundation/umi";
import { NFT_STORAGE_TOKEN } from "config/constants";

interface TokenDeploySolanaProps {
  setIsDeploying: (args: boolean) => void;
}

const TokenDeploySolana = ({ setIsDeploying }: TokenDeploySolanaProps) => {
  const { connection } = useConnection();

  const { publicKey: walletPublicKey, sendTransaction } = useWallet();
  const wallet = useWallet();
  wallet.connect();

  const [
    {
      tokenName,
      tokenImage,
      tokenDescription,
      tokenSymbol,
      tokenDecimals,
      tokenTotalSupply,
      tokenImmutable,
      tokenRevokeFreeze,
      tokenRevokeMint,
    },
  ] = useDeployerState("tokenInfo");

  const umi = useMemo(
    () => createUmi(clusterApiUrl("mainnet-beta")).use(nftStorageUploader({ token: NFT_STORAGE_TOKEN })),
    []
  );

  console.log('ToeknDeploy Solana')

  const handleTokenDeploySolana = useCallback(async () => {
    // Generate new keypair for Mint Account
    console.log("handleTokenDeploySolanaStart")
    const mintKeypair = Keypair.generate();
    // Address for Mint Account
    const mint = mintKeypair.publicKey;
    // Authority that can mint new tokens
    const mintAuthority = walletPublicKey;
    // Authority that can update token metadata
    const updateAuthority = tokenImmutable ? null : walletPublicKey;
    // Authority that can freeze token account
    const freezeAuthority = tokenRevokeFreeze ? null : walletPublicKey;

    try {
      setIsDeploying(true);

      const tokenATA = await getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        walletPublicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      // Upload the asset.
      const file = await createGenericFileFromBrowserFile(tokenImage[0]);

      const [fileUri] = await umi.uploader.upload([file]);

      const uri = await umi.uploader.uploadJson({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        description: tokenDescription,
        image: fileUri,
      });
      // Metadata to store in Mint Account
      const metaData: TokenMetadata = {
        updateAuthority: updateAuthority,
        mint: mint,
        name: tokenName,
        symbol: tokenSymbol,
        uri: uri,
        additionalMetadata: [["description", tokenDescription]],
      };

      // Size of MetadataExtension 2 bytes for type, 2 bytes for length
      const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
      // Size of metadata
      const metadataLen = pack(metaData).length;

      // Size of Mint Account with extension
      const mintLen = getMintLen([
        ExtensionType.MetadataPointer,
        // ExtensionType.TokenMetadata,
        // ExtensionType.NonTransferable,
      ]);

      // Minimum lamports required for Mint Account
      const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataExtension + metadataLen);

      // Instruction to invoke System Program to create new account
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: walletPublicKey, // Account that will transfer lamports to created account
        newAccountPubkey: mint, // Address of the account to create
        lamports, // Amount of lamports transferred to created account
        space: mintLen, // Amount of bytes to allocate to the created account
        programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
      });

      // Instruction to initialize the MetadataPointer Extension
      const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
        mint, // Mint Account address
        updateAuthority, // Authority that can set the metadata address
        mint, // Account address that holds the metadata
        TOKEN_2022_PROGRAM_ID
      );

      // Instruction to initialize the NonTransferable Extension
      const initializeNonTransferableMintInstruction = createInitializeNonTransferableMintInstruction(
        mint, // Mint Account address
        TOKEN_2022_PROGRAM_ID // Token Extension Program ID
      );

      // Instruction to initialize Mint Account data
      const initializeMintInstruction = createInitializeMint2Instruction(
        mint, // Mint Account Address
        tokenDecimals, // Decimals of Mint
        mintAuthority, // Designated Mint Authority
        freezeAuthority, // Optional Freeze Authority (default: null)
        TOKEN_2022_PROGRAM_ID // Token Extension Program ID
      );

      // Instruction to initialize Metadata Account data
      const initializeMetadataInstruction = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: walletPublicKey, // Authority that can update the metadata
        mint: mint, // Mint Account address
        mintAuthority: mintAuthority, // Designated Mint Authority
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
      });

      // Instruction to update metadata, adding custom field
      const updateFieldInstruction = createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: walletPublicKey, // Authority that can update the metadata
        field: metaData.additionalMetadata[0][0], // key
        value: metaData.additionalMetadata[0][1], // value
      });

      const associatedTokenAccountInstruction = createAssociatedTokenAccountInstruction(
        walletPublicKey,
        tokenATA,
        walletPublicKey,
        mint,
        TOKEN_2022_PROGRAM_ID
      );

      const mintToInstruction = createMintToInstruction(
        mint,
        tokenATA,
        walletPublicKey,
        tokenTotalSupply * Math.pow(10, tokenDecimals),
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      const updateAuthorityInstruction = createUpdateAuthorityInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mint,
        oldAuthority: walletPublicKey,
        newAuthority: null,
      });

      const setAuthorityInstruction = createSetAuthorityInstruction(
        mint, // account
        walletPublicKey, // current authority
        AuthorityType.MintTokens, // 'FreezeAccount' for freeze authority
        null, // new authority
        [], // signers
        TOKEN_2022_PROGRAM_ID // program id
      );

      // Add instructions to new transaction
      const transaction = new Transaction().add(
        createAccountInstruction,
        initializeMetadataPointerInstruction,
        // initializeNonTransferableMintInstruction,
        // note: the above instructions are required before initializing the mint
        initializeMintInstruction,
        initializeMetadataInstruction,
        updateFieldInstruction,
        associatedTokenAccountInstruction,
        mintToInstruction
      );
      if (tokenRevokeMint == true) transaction.add(setAuthorityInstruction);

      if (tokenImmutable == true) transaction.add(updateAuthorityInstruction);

      // Setting the latest blockhash
      // transaction.feePayer = publicKey
      // let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      // transaction.recentBlockhash = blockhash;

      const signature = await sendTransaction(transaction, connection, { signers: [mintKeypair] });

      console.log("handleTokenDeploySolanaEND")

      const ToastLink = () => (
        <a
          href={`https://solana.fm/tx/${signature}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center rounded-md bg-dark px-4 py-2 font-brand text-base font-bold tracking-wider text-brand shadow-sm outline-none transition hover:bg-brand hover:text-dark"
        >
          {`https://solana.fm/tx/${signature}`}
        </a>
      );

      toast.success(ToastLink);
      setIsDeploying(false);
      setDeployedAddress(mint.toString());
      setDeployerStep("success");
    } catch (err) {
      console.log("err", err);
      setIsDeploying(false);
    }
  }, [
    walletPublicKey,
    connection,
    tokenDecimals,
    tokenDescription,
    tokenImage,
    tokenImmutable,
    tokenName,
    tokenRevokeFreeze,
    tokenRevokeMint,
    tokenTotalSupply,
    tokenSymbol,
    umi.uploader,
    sendTransaction,
    setIsDeploying,
  ]);

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="font-bold text-gray-200">Total fee</div>
        <div className="font-bold text-brand">1 SOL</div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="button" onClick={() => setDeployerStep("details")} className="flex w-full items-center gap-2">
          Edit <Pen className="h-4 w-4" />
        </Button>

        <Button type="button" onClick={() => handleTokenDeploySolana()} variant="brand" className="w-full">
          Deploy
        </Button>
      </div>
    </>
  );
};

export default TokenDeploySolana;
