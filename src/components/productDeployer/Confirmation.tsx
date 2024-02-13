import { formatEther } from "viem";
import { Button } from "components/ui/button";
import { numberWithCommas } from "utils/functions";
import { useDeployerState } from "state/deploy/deployer.store";
import { getNativeSymbol } from "lib/bridge/helpers";
import { useTokenFactory } from "state/deploy/hooks";
import { useActiveChainId } from "hooks/useActiveChainId";

///Solana
import { FC, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';
import * as web3 from '@solana/web3.js';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  ExtensionType,
  createInitializeNonTransferableMintInstruction,
  getMintLen,
  mintTo,
  createAccount,
  transfer,
  burn,
  closeAccount,
  createSetAuthorityInstruction,
} from '@solana/spl-token';
import {
  PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
  // createV1,
  // mintV1,
  // createAndMint,
  TokenStandard,
  // mplTokenMetadata,
  Collection, Creator, Uses,
  //  CreateV1InstructionAccounts,
  // CreateV1InstructionData,
  CollectionDetails, PrintSupply,
  // UpdateV1InstructionAccounts, 
  Data
} from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
// import {
//   percentAmount,
//   generateSigner,
//   signerIdentity,
//   createSignerFromKeypair,
//   publicKey,
//   PublicKey,
//   none
// } from '@metaplex-foundation/umi'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { nftStorageUploader } from '@metaplex-foundation/umi-uploader-nft-storage'
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import * as bs58 from "bs58";

// const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
//   'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
// );

const Confirmation = () => {
  const [{ tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply, tokenDescription }] = useDeployerState("tokenInfo");
  const { chainId } = useActiveChainId();

  // const factory = useTokenFactory(chainId);

  // Create Token
  const { connection } = useConnection();

  const { publicKey, sendTransaction } = useWallet();
  const wallet = useWallet();
  wallet.connect()
  // const umi = useMemo(() =>
  //   createUmi(clusterApiUrl("devnet"))
  //     .use(walletAdapterIdentity(wallet))
  //     .use(mplCandyMachine())
  //     .use(mplTokenMetadata())
  //     .use(nftStorageUploader({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNiQzVGMTk4ZmNjNjIxQ2FDOTU1N0U1OTYxMTM0RTMxMjAyOTExM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNzQyMDI1OTgyOCwibmFtZSI6IlVNSSB1cGxvYWQifQ.HR_aJn-tNB4ESPbxbVmCJEFx5VjSM1oum2iOnlnz7D0' })),
  //   [wallet, walletAdapterIdentity, mplTokenMetadata, , mplCandyMachine, createUmi, clusterApiUrl, nftStorageUploader]
  // );

  const umi = useMemo(() =>
    createUmi(clusterApiUrl("devnet"))
      .use(nftStorageUploader({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNiQzVGMTk4ZmNjNjIxQ2FDOTU1N0U1OTYxMTM0RTMxMjAyOTExM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNzQyMDI1OTgyOCwibmFtZSI6IlVNSSB1cGxvYWQifQ.HR_aJn-tNB4ESPbxbVmCJEFx5VjSM1oum2iOnlnz7D0' })),
    [createUmi, nftStorageUploader]
  );

  // const [tokenName, setTokenName] = useState('')
  // const [symbol, setSymbol] = useState('')
  // const [metadata, setMetadata] = useState('')
  // const [amount, setAmount] = useState('')
  // const [decimals, setDecimals] = useState('')

  const onClick = useCallback(async ({ isMutable, revokeFreeze, revokeMint }) => {
    // console.log(form)
    // return;
    console.log("wallet.connected", wallet.connected)
    if (wallet.connected == false)
      wallet.connect()
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const mintKeypair = Keypair.generate();
    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);

    const uri = await umi.uploader.uploadJson({
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      description: tokenDescription,
      image: "https://example.com/nft-image-001.jpg",
    });
    console.log("uri", uri)

    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
          ],
          PROGRAM_ID,
        )[0],
        mint: mintKeypair.publicKey,
        mintAuthority: publicKey,
        payer: publicKey,
        updateAuthority: publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: tokenName,
            symbol: tokenSymbol,
            uri: uri,
            creators: null,
            sellerFeeBasisPoints: 0,
            uses: null,
            collection: null,
          },
          isMutable: isMutable,
          collectionDetails: null,
        },
      },
    );
    // console.log('createMetadataInstruction', createMetadataInstruction)
    // return;
    const freezeAuthority = revokeFreeze ? null : publicKey;
    console.log(freezeAuthority, "freezeAuthority")
    const setAuthorityInstruction =
      createSetAuthorityInstruction(
        mintKeypair.publicKey, // account
        publicKey, //  authority
        0, // type - 'FreezeAccount' for freeze authority
        publicKey, // new authority
      );

    const createNewTokenTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        tokenDecimals,
        publicKey,
        freezeAuthority,
        TOKEN_PROGRAM_ID),
      createAssociatedTokenAccountInstruction(
        publicKey,
        tokenATA,
        publicKey,
        mintKeypair.publicKey,
      ),
      createMintToInstruction(
        mintKeypair.publicKey,
        tokenATA,
        publicKey,
        tokenTotalSupply * Math.pow(10, tokenDecimals),
      ),
      createMetadataInstruction,
    );
    if (revokeMint == true)
      createNewTokenTransaction.add(setAuthorityInstruction)

    // createNewTokenTransaction.feePayer = publicKey
    // let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    // console.log("blockhash", blockhash)
    // createNewTokenTransaction.recentBlockhash = blockhash;
    console.log("createNewTokenTransaction", createNewTokenTransaction)
    console.log("connection", connection)
    console.log("mintKeypair", mintKeypair.publicKey)
    const signature = await sendTransaction(createNewTokenTransaction, connection, { signers: [mintKeypair] });

    console.log('Token mint transaction sent. Signature:', signature);
  }, [publicKey, connection, sendTransaction]);
  /*
    const onClickCreateNTToken = useCallback(async (form) => {
      // Generate new keypair for Mint Account
      const mintKeypair = Keypair.generate();
      // Address for Mint Account
      const mint = mintKeypair.publicKey;
      // Authority that can mint new tokens
      const mintAuthority = publicKey;
  
      // Size of Mint Account with extension
      const mintLen = getMintLen([ExtensionType.NonTransferable]);
  
      // Minimum lamports required for Mint Account
      const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
  
      const tokenATA = await getAssociatedTokenAddressSync(mintKeypair.publicKey, publicKey, false, TOKEN_2022_PROGRAM_ID);
  
      // Instruction to invoke System Program to create new account
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: publicKey, // Account that will transfer lamports to created account
        newAccountPubkey: mint, // Address of the account to create
        space: mintLen, // Amount of bytes to allocate to the created account
        lamports, // Amount of lamports transferred to created account
        programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
      });
  
      // Instruction to initialize the NonTransferable Extension
      const initializeNonTransferableMintInstruction =
        createInitializeNonTransferableMintInstruction(
          mint, // Mint Account address
          TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
        );
  
      // Instruction to initialize Mint Account data
      const initializeMintInstruction = createInitializeMintInstruction(
        mint, // Mint Account Address
        form.decimals, // Decimals of Mint
        mintAuthority, // Designated Mint Authority
        null, // Optional Freeze Authority
        TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
      );
  
      const associatedTokenAccountInstruction = createAssociatedTokenAccountInstruction(
        publicKey,
        tokenATA,
        publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      );
  
      const mintToInstruction = createMintToInstruction(
        mintKeypair.publicKey,
        tokenATA,
        publicKey,
        form.amount * Math.pow(10, form.decimals),
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
  
      console.log("PROGRAM_DI", PROGRAM_ID)
  
      const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
        {
          metadata: PublicKey.findProgramAddressSync(
            [
              Buffer.from("metadata"),
              PROGRAM_ID.toBuffer(),
              mintKeypair.publicKey.toBuffer(),
            ],
            PROGRAM_ID,
          )[0],
          mint: mintKeypair.publicKey,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: form.tokenName,
              symbol: form.symbol,
              uri: form.metadata,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        },
      );
      console.log('createMetadataInstruction', createMetadataInstruction)
      // Add instructions to new transaction
      const transaction = new Transaction().add(
        createAccountInstruction,
        initializeNonTransferableMintInstruction,
        initializeMintInstruction,
        associatedTokenAccountInstruction,
        mintToInstruction,
        createMetadataInstruction
      );
  
      // Send transaction
      // const transactionSignature = await sendAndConfirmTransaction(
      //   connection,
      //   transaction,
      //   [payer, mintKeypair], // Signers
      // );
  
      // console.log(
      //   "\nCreate Mint Account:",
      //   `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
      // );
  
      // createNewTokenTransaction.feePayer = publicKey
      // let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      // console.log("blockhash", blockhash)
      // createNewTokenTransaction.recentBlockhash = blockhash;
      console.log("NT transation", transaction)
      // return;
      const signature = await sendTransaction(transaction, connection, { signers: [mintKeypair] });
  
      console.log('Token mint transaction sent. Signature:', signature);
    }, [publicKey, connection, sendTransaction]);
    */
  /*
   const onClickCreateUMI = useCallback(async (form) => {
     console.log("wallet.connected", wallet.connected)
     if (!wallet.connected) {
       // Initialize wallet adapter
       await wallet.connect();
       console.log("wallet.connected", wallet.connected)
     }
     console.log("wallet.connected", wallet.connected)
     // Generate new keypair for Mint Account
     const mintKeypair = Keypair.generate();
     // Address for Mint Account
     // const mint = mintKeypair.publicKey;
     // Authority that can mint new tokens
     const mintAuthority = publicKey;
 
     // Size of Mint Account with extension
     const mintLen = getMintLen([ExtensionType.NonTransferable]);
 
     // Minimum lamports required for Mint Account
     const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
 
     // const tokenATA = await getAssociatedTokenAddressSync(mintKeypair.publicKey, publicKey, false, TOKEN_2022_PROGRAM_ID);
 
     const uri = await umi.uploader.uploadJson({
       name: "umi token 7",
       symbol: "UMI7",
       decimals: 9,
       description: "My description",
       image: "https://example.com/nft-image-001.jpg",
     });
     console.log("uri", uri)
 
     const mint = generateSigner(umi)
 
     // console.log("mint", mint)
 
     // const mint = fromWeb3JsPublicKey(mintKeypair.publicKey)
     // console.log("mint1", mint)
 
     // return;
 
     await wallet.connect()
     /*
     const ourMetadata = { // TODO change those values!
       name: "Asvoria",
       symbol: "ASV",
       description: "Asvoria’s utility token is $ASV, which will be used as the default currency in Asvoria’s entire ecosystem consisting of the metaverse, NFT marketplace, and other upcoming ventures.",
       uri,
     }
 
     const onChainData = {
       ...ourMetadata,
       // we don't need that
       sellerFeeBasisPoints: percentAmount(0, 2),
       creators: none<Creator[]>(),
       collection: none<Collection>(),
       uses: none<Uses>(),
     }
     const accounts: CreateV1InstructionAccounts = {
       mint: mint,
       authority: umi.identity,
 
       splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
     }
 
     const data: CreateV1InstructionData = {
       ...onChainData,
 
 
       isMutable: true,
       discriminator: 0,
       tokenStandard: TokenStandard.Fungible,
       collectionDetails: none<CollectionDetails>(),
       ruleSet: none<PublicKey>(),
       createV1Discriminator: 0,
       primarySaleHappened: true,
       decimals: none<number>(),
       printSupply: none<PrintSupply>(),
     }
 
     const txid = await createV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
     console.log(bs58.encode(txid.signature))
 */
  /*
      const createRes = await createV1(umi, {
        mint,
        authority: umi.identity,
        name: "my token",
        // symbol: "UMI6",
        // decimals: 9,
        uri,
        isMutable: true,
        splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
        tokenStandard: TokenStandard.Fungible,
        collectionDetails: none<CollectionDetails>(),
        ruleSet: none<PublicKey>(),
        primarySaleHappened: true,
        printSupply: none<PrintSupply>(),
        sellerFeeBasisPoints: percentAmount(5.5),
        creators: none<Creator[]>(),
        collection: none<Collection>(),
        uses: none<Uses>(),
      }).sendAndConfirm(umi)
  
      console.log("create txid", bs58.encode(createRes.signature))
  
      const mintRes = await mintV1(umi, {
        mint: mint.publicKey,
        authority: umi.identity,
        amount: 1000,
        tokenOwner: umi.identity.publicKey,
        splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
        tokenStandard: TokenStandard.Fungible,
      }).sendAndConfirm(umi)
      console.log("mint txid", bs58.encode(mintRes.signature))
 */
  /*
      createAndMint(umi, {
        mint,
        authority: umi.identity,
        name: "umi token 7",
        symbol: "UMI7",
        uri,
        decimals: 9,
        isMutable: true,
        amount: 1000000_000000000,
        tokenOwner: umi.identity.publicKey,
  
        // splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
        tokenStandard: TokenStandard.Fungible,
        collectionDetails: none<CollectionDetails>(),
        ruleSet: none<PublicKey>(),
        primarySaleHappened: true,
        printSupply: none<PrintSupply>(),
        sellerFeeBasisPoints: percentAmount(5.5),
        creators: none<Creator[]>(),
        collection: none<Collection>(),
        uses: none<Uses>(),
      }).sendAndConfirm(umi).then(() => {
        console.log("Successfully minted 1 million tokens (", mint.publicKey, ")");
      });
  
    }, [publicKey, connection, createV1, mintV1, createAndMint, umi]);
  */
  return (
    <div className="my-8 max-w-xl">
      <h4 className="mb-6 text-xl">Summary</h4>

      <p className="my-8">You are about to deploy a new token contract on the X network. Please confirm the details.</p>

      <dl className="mt-8 divide-y divide-gray-600 text-sm lg:col-span-7 lg:mt-0 lg:pr-8">
        <div className="flex items-center justify-between pb-4">
          <dt className="text-gray-400">Token name</dt>
          <dd className="font-medium text-gray-200">{tokenName}</dd>
        </div>

        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-400">Token symbol</dt>
          <dd className="font-medium text-gray-200">{tokenSymbol}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-400">Token decimals</dt>
          <dd className="font-medium text-gray-200">{tokenDecimals}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className=" text-gray-400">Total supply</dt>
          <dd className="font-medium text-gray-200">
            {numberWithCommas(Number(tokenTotalSupply))} {tokenSymbol}
          </dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-bold text-gray-200">Total fee</dt>
          <dd className="font-bold text-brand">
            {/* {formatEther(BigInt(factory.serviceFee))} {getNativeSymbol(chainId)} */}
          </dd>
        </div>
      </dl>

      <Button
        variant="brand" className="w-full"
        onClick={() => onClick({ isMutable: true, revokeFreeze: false, revokeMint: false })}>
        <span>Deploy</span>
      </Button>
      <Button
        variant="brand" className="w-full"
        onClick={() => onClick({ isMutable: false, revokeFreeze: false, revokeMint: false })}>
        <span>Deploy Immutable</span>
      </Button>
      <Button
        variant="brand" className="w-full"
        onClick={() => onClick({ isMutable: true, revokeFreeze: true, revokeMint: false })}>
        <span>Deploy Revoke Freeze</span>
      </Button>
      <Button
        variant="brand" className="w-full"
        onClick={() => onClick({ isMutable: true, revokeFreeze: false, revokeMint: true })}>
        <span>Deploy Revoke Mint</span>
      </Button>

      {/* <Button
        variant="brand" className="w-full"
        onClick={() => onClickCreateNTToken({ decimals: 9, amount: 10000, metadata: "", symbol: "NONTRANS", tokenName: "Non Transter" })}>
        <span>Deploy Non Transfer</span>
      </Button> */}
      {/* <Button
        variant="brand" className="w-full"
        onClick={() => onClickCreateUMI({ decimals: 9, amount: 10000, metadata: "", symbol: "UMI", tokenName: "Umi token" })}>
        <span>CreatewithUMI</span>
      </Button> */}
    </div>
  );
};

export default Confirmation;
