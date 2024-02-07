/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import orderBy from "lodash/orderBy";
import { useAccount } from "wagmi";

import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import PageHeader from "components/layout/PageHeader";
import WordHighlight from "components/text/WordHighlight";

import { Category } from "config/constants/types";
import { TokenPriceContext } from "contexts/TokenPriceContext";
import { useFarms } from "state/farms/hooks";
import { usePools } from "state/pools/hooks";
import { useIndexes } from "state/indexes/hooks";
import { useChainCurrentBlocks } from "state/block/hooks";
import { filterPoolsByStatus } from "utils";
import getCurrencyId from "utils/getCurrencyId";

import Banner from "views/directory/Banner";
import IndexDetail from "views/directory/IndexDetail";
import FarmingDetail from "views/directory/FarmingDetail";
import StakingDetail from "views/directory/StakingDetail";

import PoolList from "./PoolList";
import SelectionPanel from "./SelectionPanel";
import { DocSVG } from "@components/dashboard/assets/svgs";

///Solana
import { FC, useCallback } from 'react';
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
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
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
} from '@solana/spl-token';
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';

const Deployer = ({ page, type }: { page: number; type?: string }) => {
  const [curFilter, setCurFilter] = useState(page);
  const [criteria, setCriteria] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [curPool, setCurPool] = useState<{ type: Category; pid: number; chainId: number }>({
    type: 0,
    pid: 0,
    chainId: 0,
  });
  const [selectPoolDetail, setSelectPoolDetail] = useState(false);
  const [status, setStatus] = useState("active");

  const [deployerOpen, setDeployerOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [deployType, setDeployType] = useState("Yield Farm");

  useEffect(() => {
    setDeployType(type === "index" ? "Index" : type === "token" ? "Token" : "Yield Farm");
    setStep(type ? 1 : 0);
    setDeployerOpen(type ? true : false);
  }, [type]);

  const { pools, dataFetched } = usePools();
  const { data: farms } = useFarms();
  const { indexes } = useIndexes();
  const { address: account } = useAccount();
  // const account = "0x53Ff4a10A30DEB6D412F9B47CaEEc28Af7F8e799";

  const { tokenPrices, lpPrices } = useContext(TokenPriceContext);
  const currentBlocks = useChainCurrentBlocks();
  const totalPools = [
    ...pools.map((pool) => {
      let price = tokenPrices[getCurrencyId(pool.chainId, pool.stakingToken.address)];
      if (price > 500000) price = 0;
      return { ...pool, tvl: pool.totalStaked && price ? +pool.totalStaked * price : 0 };
    }),
    ...farms.map((farm) => {
      let price = lpPrices[getCurrencyId(farm.chainId, farm.lpAddress, true)];
      return { ...farm, tvl: farm.totalStaked && price ? +farm.totalStaked * price : 0 };
    }),
    ...indexes.map((_index) => {
      let tvl = 0;
      for (let i = 0; i < _index.tokens.length; i++) {
        let price = _index.tokenPrices?.[i] ?? tokenPrices[getCurrencyId(_index.chainId, _index.tokens[i].address)];
        tvl += _index.totalStaked?.[i] && price ? +_index.totalStaked[i] * price : 0;
      }
      return { ..._index, tvl };
    }),
  ];

  const allPools = totalPools.filter(
    (data) => data.deployer && account && data.deployer.toLowerCase() === account.toLowerCase()
  );
  const sortPools = (poolsToSort) => {
    switch (sortOrder) {
      case "apr":
        return orderBy(poolsToSort, (pool) => pool.apr ?? 0, "desc");
      case "earned":
        return orderBy(
          poolsToSort,
          (pool) => {
            const earningTokenPrice = +tokenPrices[getCurrencyId(pool.earningToken.chainId, pool.earningToken.address)];
            if (!pool.userData || !earningTokenPrice) {
              return 0;
            }
            return pool.userData.earnings.times(earningTokenPrice).toNumber();
          },
          "desc"
        );
      case "tvl":
        return orderBy(poolsToSort, (pool) => pool.tvl ?? 0, "desc");
      case "totalStaked":
        return orderBy(
          poolsToSort,
          (pool) => {
            let totalStaked = Number.NaN;
            if (pool.totalStaked !== Infinity && pool.totalStaked !== undefined) {
              totalStaked = +pool.totalStaked.toString();
            }
            return Number.isFinite(totalStaked) ? totalStaked : 0;
          },
          "desc"
        );
      case "chainId":
        return orderBy(poolsToSort, (pool) => pool.chainId, "asc");
      case "latest":
        return orderBy(poolsToSort, (pool) => pool.sortOrder, "desc");
      default:
        return orderBy(poolsToSort, (pool) => pool.sortOrder, "asc");
    }
  };

  let chosenPools;
  if (curFilter >= 0 || criteria) {
    const lowercaseQuery = criteria.toLowerCase();
    chosenPools = allPools
      .filter(
        (pool: any) =>
          pool.stakingToken?.name.toLowerCase().includes(lowercaseQuery) ||
          pool.stakingToken?.symbol.toLowerCase().includes(lowercaseQuery) ||
          pool.lpSymbol?.toLowerCase().includes(lowercaseQuery) ||
          pool.earningToken?.name.toLowerCase().includes(lowercaseQuery) ||
          pool.earningToken?.symbol.toLowerCase().includes(lowercaseQuery) ||
          pool.tokens?.filter(
            (t) => t.name.toLowerCase().includes(lowercaseQuery) || t.symbol.toLowerCase().includes(lowercaseQuery)
          ).length
      )
      .filter((data: any) => data.type === curFilter);
  }

  chosenPools = sortPools(filterPoolsByStatus(chosenPools, currentBlocks, status));

  const renderDetailPage = () => {
    switch (curPool.type) {
      case Category.POOL:
        return (
          <StakingDetail
            detailDatas={{
              open: selectPoolDetail,
              setOpen: setSelectPoolDetail,
              data: allPools.find(
                (pool: any) =>
                  pool.type === curPool.type && pool.sousId === curPool.pid && pool.chainId === curPool.chainId
              ),
            }}
          />
        );
      case Category.FARM:
        return (
          <FarmingDetail
            detailDatas={{
              open: selectPoolDetail,
              setOpen: setSelectPoolDetail,
              data: allPools.find(
                (pool: any) =>
                  pool.type === curPool.type && pool["pid"] === curPool.pid && pool.chainId === curPool.chainId
              ),
            }}
          />
        );
      case Category.INDEXES:
        return (
          <IndexDetail
            detailDatas={{
              data: allPools.find(
                (pool: any) =>
                  pool.type === curPool.type && pool["pid"] === curPool.pid && pool.chainId === curPool.chainId
              ),
            }}
          />
        );

      default:
        return "";
    }
  };

  // Create Token

  const { connection } = useConnection();
  // const connection = new Connection("https://nd-091-815-987.p2pify.com/4e6a4589de93c545f7817575cd159b4f", { wsEndpoint: "wss://ws-nd-091-815-987.p2pify.com/4e6a4589de93c545f7817575cd159b4f" });

  const { publicKey, sendTransaction } = useWallet();
  // console.log(publicKey)
  // const [tokenName, setTokenName] = useState('')
  // const [symbol, setSymbol] = useState('')
  // const [metadata, setMetadata] = useState('')
  // const [amount, setAmount] = useState('')
  // const [decimals, setDecimals] = useState('')

  const onClick = useCallback(async (form) => {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const mintKeypair = Keypair.generate();
    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);

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
            creators: null,
            sellerFeeBasisPoints: 0,
            uses: null,
            collection: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      },
    );
    console.log('createMetadataInstruction', createMetadataInstruction)
    return;
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
        form.decimals,
        publicKey,
        publicKey,
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
        form.amount * Math.pow(10, form.decimals),
      ),
      createMetadataInstruction
    );
    // createNewTokenTransaction.feePayer = publicKey
    // let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    // console.log("blockhash", blockhash)
    // createNewTokenTransaction.recentBlockhash = blockhash;
    console.log("createNewTokenTransaction", createNewTokenTransaction)
    console.log("connection", createNewTokenTransaction)
    console.log("mintKeypair", mintKeypair)
    const signature = await sendTransaction(createNewTokenTransaction, connection, { signers: [mintKeypair] });

    console.log('Token mint transaction sent. Signature:', signature);
  }, [publicKey, connection, sendTransaction]);

  const onClickCreateNTToken = useCallback(async (form) => {

    console.log("My address:", publicKey.toString());

    // Generate new keypair for Mint Account
    const mintKeypair = Keypair.generate();
    // Address for Mint Account
    const mint = mintKeypair.publicKey;
    // Decimals for Mint Account
    const decimals = 2;
    // Authority that can mint new tokens
    const mintAuthority = publicKey;

    // Size of Mint Account with extension
    const mintLen = getMintLen([ExtensionType.NonTransferable]);

    // Minimum lamports required for Mint Account
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);

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
      decimals, // Decimals of Mint
      mintAuthority, // Designated Mint Authority
      null, // Optional Freeze Authority
      TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
    );

    const associatedTokenAccountInstruction = createAssociatedTokenAccountInstruction(
      publicKey,
      tokenATA,
      publicKey,
      mintKeypair.publicKey,
    );

    const mintToInstruction = createMintToInstruction(
      mintKeypair.publicKey,
      tokenATA,
      publicKey,
      form.amount * Math.pow(10, form.decimals),
    );

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
            creators: null,
            sellerFeeBasisPoints: 0,
            uses: null,
            collection: null,
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

    return;
    const signature = await sendTransaction(transaction, connection, { signers: [mintKeypair] });

    console.log('Token mint transaction sent. Signature:', signature);
  }, [publicKey, connection, sendTransaction]);

  return (
    <PageWrapper>
      {renderDetailPage()}

      <AnimatePresence>
        {!selectPoolDetail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute left-0 top-0 max-h-screen w-full overflow-y-scroll">
              <PageHeader
                title={
                  <div className="text-[40px]">
                    <WordHighlight content="Product Deployer" />
                    <a
                      className="primary-shadow mt-2 flex w-fit items-center rounded bg-[#FFFFFF1A] p-2 font-roboto text-xs font-bold !text-primary transition hover:scale-[1.1]"
                      href="https://brewlabs.gitbook.io/welcome-to-brewlabs/brewlabs-defi-products/brewlabs-2023/live-product-deployer"
                      target="_blank"
                    >
                      <div>LEARN MORE</div>
                      <div className="ml-1 [&>svg]:!h-2.5 [&>svg]:!w-2.5">{DocSVG}</div>
                    </a>
                  </div>
                }
              />

              <Container className="pb-[180px] font-brand">
                <div className="mb-20 flex flex-col items-center justify-between sm:flex-row">
                  <div>
                    <div className="text-lg leading-[1.2] text-primary">Deploy smart contracts.</div>
                    <div className="mt-1.5 max-w-[1000px] text-sm leading-[1.2]">
                      The Brewlabs product deployer is a simple tool that uses a step-by-step wizard to assist in the
                      deployment of smart contracts across a range of networks. No matter if you are a novice or an
                      expert in the industry, this simple deployment tool enables teams to create tokens, supporting
                      utility smart contract, staking and yield farming and more. All contracts that are deployed by our
                      deployer tools are safe, transparent and verified to ensure user security.
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <SelectionPanel
                    pools={allPools}
                    curFilter={curFilter}
                    setCurFilter={setCurFilter}
                    criteria={criteria}
                    setCriteria={setCriteria}
                    activity={status}
                    setActivity={setStatus}
                  />
                </div>
                <div className="mb-[100px] mt-[18px]">
                  <PoolList
                    pools={chosenPools}
                    setSelectPoolDetail={setSelectPoolDetail}
                    setCurPool={setCurPool}
                    setSortOrder={setSortOrder}
                    loading={dataFetched}
                    deployerOpen={deployerOpen}
                    setDeployerOpen={setDeployerOpen}
                    step={step}
                    setStep={setStep}
                    deployType={deployType}
                    setDeployType={setDeployType}
                    curFilter={curFilter}
                  />
                </div>

                <button
                  className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
                  onClick={() => onClick({ decimals: 9, amount: 10000, metadata: "", symbol: "BRWT", tokenName: "Brew Sol" })}>
                  <span>Create Token</span>
                </button>

                <button
                  className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
                  onClick={() => onClickCreateNTToken({ decimals: 9, amount: 10000, metadata: "", symbol: "BRWT", tokenName: "Brew Sol" })}>
                  <span>Create None Trasferable</span>
                </button>

              </Container>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Deployer;
