/* eslint-disable react-hooks/exhaustive-deps */
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { NFTStorage } from "nft.storage";
import Dropzone from "react-dropzone";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useAccount } from "wagmi";
import StyledInput from "@components/StyledInput";
import { useContext, useState } from "react";
import DropDown from "@components/dashboard/TokenList/Dropdown";
import { getChainLogo } from "utils/functions";
import { NETWORKS } from "config/constants/networks";
import { InfoSVG, TelegramSVG, TwitterSVG, WebSiteSVG, chevronLeftSVG } from "@components/dashboard/assets/svgs";
import StyledButton from "views/directory/StyledButton";
import useTokenInfo from "@hooks/useTokenInfo";
import { ethers } from "ethers";
import RequireAlert from "@components/RequireAlert";
import { CommunityContext } from "contexts/CommunityContext";
import { Puff } from "react-loader-spinner";
import LoadingText from "@components/LoadingText";

const storage = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEFCZDcyZUNhQjhEODY5QjNEMmU2QzFGYmJFNmUzNDFjMTc3RjUxNDQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MjI5OTUyNTkxOCwibmFtZSI6IkFydHdpc2UgVXBsb2FkIn0.46kPCGNhJGZrXlxriT2XVs1tMxB-TtYSkftTZKh75g4",
});

const CommunityModal = ({ open, setOpen }) => {
  const { address: account } = useAccount();
  // const account = "0xaE837FD1c51705F3f8f232910dfeCB9180541B27";

  const [title, setTitle] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [description, setDescription] = useState("");

  const [communityType, setCommunityType] = useState(4);
  const [selectedChainId, setSelectedChainId] = useState(0);
  const [contractType, setContractType] = useState(0);
  const [quoroumReq, setQuoroumReq] = useState(0);
  const [maxProposal, setMaxProposal] = useState(0);

  const [feeForProposal, setFeeForProposal] = useState(0);
  const [feeProposalAmount, setFeeProposalAmount] = useState("");
  const [feeProposalWallet, setFeeProposalWallet] = useState("");

  const [feeForVote, setFeeForVote] = useState(0);
  const [feeVoteAmount, setFeeVoteAmount] = useState("");
  const [feeVoteWallet, setFeeVoteWallet] = useState("");

  const [communityImage, setCommunityImage] = useState("");
  const [uploadImage, setUploadedImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [website, setWebsite] = useState("");
  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");

  const [submitClicked, setSubmitClicked] = useState(true);

  const chains = [NETWORKS[1], NETWORKS[56], NETWORKS[137], NETWORKS[42161]];
  const contractTypes = ["Token", "NFT", "Both"];
  const communityTypes = ["Team", "Group", "Influencer", "Guild", "Community", "Rabble", "Degens", "Traders"];
  const quoroumReqs = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const maxProposals = [7, 14, 30];

  const { owner, deployer, name, symbol, decimals, totalSupply } = useTokenInfo(
    contractAddress,
    parseInt(chains[selectedChainId].chainId)
  );

  const { addCommunity }: any = useContext(CommunityContext);

  let isOwnerOrDeployer =
    owner?.toLowerCase() === account?.toLowerCase() || deployer?.toLowerCase() === account?.toLowerCase();

  isOwnerOrDeployer = isOwnerOrDeployer ?? false;

  const isInValid =
    !title ||
    !isOwnerOrDeployer ||
    !description ||
    !feeProposalAmount ||
    !feeVoteAmount ||
    !ethers.utils.isAddress(feeProposalWallet) ||
    !ethers.utils.isAddress(feeVoteWallet) ||
    !uploadImage;

  const dropHandler = async (acceptedFiles: any[]) => {
    setIsUploading(true);
    try {
      const [File] = acceptedFiles;
      const path = await storage.storeBlob(File);
      setUploadedImage(`https://maverickbl.mypinata.cloud/ipfs/${path}`);
      setCommunityImage(URL.createObjectURL(File));
    } catch (e) {
      console.log(e);
    }
    setIsUploading(false);
  };

  const onSubmitCommunity = async () => {
    setSubmitClicked(true);
    if (isInValid || !submitClicked) return;
    const chainId = parseInt(chains[selectedChainId].chainId);
    let currencies = new Object();
    currencies[chainId] = { chainId, decimals, name, symbol, address: contractAddress };
    await addCommunity({
      name: title,
      members: [],
      logo: uploadImage,
      currencies,
      type: contractTypes[contractType],
      socials: {
        telegram,
        twitter,
        website,
      },
      coreChainId: chainId,
      description: description,
      proposals: [],
      totalSupply: totalSupply.toString(),
      treasuries: { [chainId]: [ethers.constants.AddressZero, "0x000000000000000000000000000000000000dead"] },
      feeToProposal: {
        type: ["Yes", "No"][feeForProposal],
        address: feeProposalWallet,
        amount: ethers.utils.parseUnits(feeProposalAmount, decimals).toString(),
      },
      feeToVote: {
        type: ["Yes", "No", "Sometimes"][feeForVote],
        address: feeVoteWallet,
        amount: ethers.utils.parseUnits(feeVoteAmount, decimals).toString(),
      },
      maxProposal: maxProposal,
      communityType: communityTypes[communityType],
      quoroumReq: quoroumReqs[quoroumReq],
    });
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      className="fixed inset-0 z-[100] overflow-y-auto bg-gray-300 bg-opacity-90 font-brand backdrop-blur-[2px] dark:bg-zinc-900 dark:bg-opacity-80"
      onClose={() => {}}
    >
      <div className="flex min-h-full items-center justify-center p-4 ">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.75,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              ease: "easeOut",
              duration: 0.15,
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.75,
            transition: {
              ease: "easeIn",
              duration: 0.15,
            },
          }}
          transition={{ duration: 0.25 }}
        >
          <div className="primary-shadow relative w-[calc(100vw-24px)] max-w-[800px]  rounded bg-[#18181B] p-[38px_4px_40px_12px] text-white md:p-[38px_32px_40px_64px] ">
            <div className="greyScroll max-h-[600px] overflow-y-scroll pr-2">
              <div>
                <div className="text-xl text-primary">New Community</div>
                <div className="mt-1 overflow-hidden text-ellipsis text-sm text-[#FFFFFF80] ">
                  <span className="text-white">By</span> {account} (Must be contract owner or deployer).
                  <br /> All fields need completion below.
                </div>
              </div>

              <div className="mt-4 flex flex-col-reverse justify-between xsm:flex-row">
                <div className="flex-1">
                  <div>Community title</div>
                  <StyledInput
                    value={title}
                    setValue={setTitle}
                    placeholder="Write your title here"
                    className="h-fit w-full p-[6px_10px]"
                    isValid={!submitClicked || title}
                  />
                </div>
                <div className="mb-2 ml-0 xsm:mb-0 xsm:ml-4 sm:xsm:ml-12">
                  <div>Type</div>
                  <DropDown
                    value={communityType}
                    setValue={setCommunityType}
                    values={communityTypes}
                    type={"secondary"}
                    width="w-[120px]"
                    className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary "
                  />
                </div>
              </div>

              <div className="mt-2 flex flex-col-reverse justify-between xsm:flex-row">
                <div className="flex-1">
                  <div>Contract address</div>
                  <StyledInput
                    value={contractAddress}
                    setValue={setContractAddress}
                    placeholder="0x...."
                    className="h-fit w-full p-[6px_10px]"
                    isValid={!submitClicked || isOwnerOrDeployer}
                    requireText="Not owner or deployer"
                  />
                </div>
                <div className="mb-2 ml-0 xsm:mb-0 xsm:ml-4 sm:xsm:ml-12">
                  <div>Network</div>
                  <div className="flex w-[120px] items-center justify-between">
                    <DropDown
                      value={selectedChainId}
                      setValue={setSelectedChainId}
                      values={chains.map((data) => data.nativeCurrency.symbol)}
                      type={"secondary"}
                      width="w-[72px]"
                      className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary"
                    />
                    <img
                      src={getChainLogo(parseInt(chains[selectedChainId].chainId))}
                      alt={""}
                      className="h-6 w-6 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div>
                  Community description <span className="text-[#FFFFFF80]">*1000 Characters</span>
                </div>
                <StyledInput
                  type={"textarea"}
                  value={description}
                  setValue={setDescription}
                  placeholder="Write about your community here..."
                  className="h-28 w-full !p-2.5"
                  isValid={!submitClicked || description}
                />
              </div>

              <div className="mt-1.5 flex flex-col sm:flex-row">
                <div>
                  <div className="text-sm">Smart contract type</div>
                  <DropDown
                    value={contractType}
                    setValue={setContractType}
                    values={contractTypes}
                    type={"secondary"}
                    width="sm:w-24 w-full"
                    className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary"
                  />
                </div>

                <div className="mx-0 my-2 sm:mx-10 sm:my-0">
                  <div className="text-sm">Quoroum Req.</div>
                  <DropDown
                    value={quoroumReq}
                    setValue={setQuoroumReq}
                    values={quoroumReqs.map((data) => data.toFixed(2) + "%")}
                    type={"secondary"}
                    width="sm:w-24 w-full"
                    className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary"
                  />
                </div>

                <div>
                  <div className="text-sm">Max proposal duration</div>
                  <DropDown
                    value={maxProposal}
                    setValue={setMaxProposal}
                    values={maxProposals.map((data) => data + " Days")}
                    type={"secondary"}
                    width="sm:w-24 w-full"
                    className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary"
                  />
                </div>
              </div>

              <div className="mt-[22px] flex flex-col items-start justify-between md:flex-row">
                <div className="flex items-center">
                  <div
                    className="mr-2.5 mt-[18px] cursor-pointer text-tailwind hover:text-white [&>svg]:!h-6 [&>svg]:!w-6"
                    id={"A fee for proposal is recommended to avoid proposal spam."}
                  >
                    {InfoSVG}
                  </div>
                  <div>
                    <div className="text-sm">Fee for proposal</div>
                    <DropDown
                      value={feeForProposal}
                      setValue={setFeeForProposal}
                      values={["Yes", "No"]}
                      type={"secondary"}
                      width="w-24"
                      className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]  !p-[6px_10px] text-sm text-primary"
                    />
                  </div>
                </div>
                {feeForProposal !== 1 ? (
                  <div className="mt-4 flex w-full flex-col items-start xsm:flex-row md:mt-0 md:w-fit">
                    <div className=" w-full w-full flex-1 md:w-fit md:flex-none">
                      <div className="text-sm">Fee Amount</div>
                      <StyledInput
                        type={"number"}
                        value={feeProposalAmount}
                        setValue={setFeeProposalAmount}
                        placeholder="Enter round num...."
                        className="!h-fit w-full !rounded-none !p-[6px_10px] md:w-[200px]"
                        isValid={!submitClicked || feeProposalAmount}
                      />
                    </div>
                    <div className="ml-0 mt-2 w-full flex-1 xsm:ml-3 xsm:mt-0 md:w-fit md:flex-none">
                      <div className="text-sm">Fee wallet</div>
                      <StyledInput
                        value={feeProposalWallet}
                        setValue={setFeeProposalWallet}
                        placeholder="0x...."
                        className="!h-fit w-full !rounded-none !p-[6px_10px] md:w-[273px]"
                        isValid={!submitClicked || ethers.utils.isAddress(feeProposalWallet)}
                        requireText="Please input valid address"
                      />
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>

              <div className="mt-3 flex flex-col items-start justify-between md:flex-row">
                <div className="flex items-center">
                  <div
                    className="mr-2.5 mt-[18px] cursor-pointer text-tailwind hover:text-white [&>svg]:!h-6 [&>svg]:!w-6"
                    id={"A fee for proposal is recommended to avoid proposal spam."}
                  >
                    {InfoSVG}
                  </div>
                  <div>
                    <div className="text-sm">Fee to vote</div>
                    <DropDown
                      value={feeForVote}
                      setValue={setFeeForVote}
                      values={["Yes", "No", "Sometimes"]}
                      type={"secondary"}
                      width="w-24"
                      className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]  !p-[6px_10px] text-sm text-primary"
                    />
                  </div>
                </div>
                {feeForVote !== 1 ? (
                  <div className="mt-4 flex w-full flex-col items-start xsm:flex-row md:mt-0 md:w-fit">
                    <div className="w-full w-full flex-1 md:w-fit md:flex-none">
                      <div className="text-sm">Fee Amount</div>
                      <StyledInput
                        type={"number"}
                        value={feeVoteAmount}
                        setValue={setFeeVoteAmount}
                        placeholder="Enter round num...."
                        className="!h-fit w-full !rounded-none !p-[6px_10px] md:w-[200px]"
                        isValid={!submitClicked || feeVoteAmount}
                      />
                    </div>
                    <div className="ml-0 mt-2 w-full flex-1 xsm:ml-3 xsm:mt-0 md:w-fit md:flex-none">
                      <div className="text-sm">Fee wallet</div>
                      <StyledInput
                        value={feeVoteWallet}
                        setValue={setFeeVoteWallet}
                        placeholder="0x...."
                        className="!h-fit w-full !rounded-none !p-[6px_10px] md:w-[273px]"
                        isValid={!submitClicked || ethers.utils.isAddress(feeVoteWallet)}
                        requireText="Please input valid address"
                      />
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>

              <div className="mx-auto mt-3 max-w-[600px]">
                <div className="text-sm">
                  Community image <span className="text-[#FFFFFF80]">*150x150px</span>
                </div>
                <div className="flex flex-col items-center justify-between sm:flex-row ">
                  <Dropzone
                    maxFiles={1}
                    accept={
                      [
                        "image/png",
                        "image/jpeg",
                        "image/gif",
                        "video/mp4",
                        "video/quicktime",
                        "audio/mpeg",
                        "audio/wav",
                        "audio/mp3",
                      ] as any
                    }
                    onDrop={(acceptedFiles) => dropHandler(acceptedFiles)}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <div
                        {...getRootProps()}
                        className="primary-shadow flex h-[150px] w-[220px] cursor-pointer items-center justify-center border border-dashed border-transparent bg-[#202023] transition hover:border-primary"
                      >
                        <input {...getInputProps()} />

                        {isUploading ? (
                          <div className="flex h-full w-full flex-col items-center justify-center">
                            <Puff width={45} height={45} color={"#ffffff9e"} secondaryColor="black" />
                            <div className="mt-2 text-sm text-[#ffffff9e]">
                              <LoadingText text={"Uploading Image"} />
                            </div>
                          </div>
                        ) : communityImage ? (
                          <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded">
                            <img src={communityImage} className="w-full rounded" alt={""} />
                          </div>
                        ) : (
                          <div className="relative flex h-full w-full items-end justify-center">
                            <div className="absolute mb-5 flex h-full w-full items-center justify-center text-2xl">
                              +
                            </div>
                            <StyledButton className="mb-5 !h-fit !w-fit p-[10px_12px] !font-normal">
                              <span className="font-bold">Upload</span> &nbsp;community image
                            </StyledButton>
                          </div>
                        )}
                      </div>
                    )}
                  </Dropzone>
                  <div className="my-2 rotate-90 -scale-x-100 sm:my-0 sm:rotate-0">{chevronLeftSVG}</div>
                  <div className="flex flex-col items-center sm:flex-row">
                    <div className="flex flex-col items-center">
                      <div className="primary-shadow flex h-[150px] w-[150px] items-center justify-center bg-[#0e2130]">
                        <div className="flex h-[110px] w-[110px] items-center justify-center overflow-hidden rounded">
                          <img src={communityImage} className="w-full rounded" alt={""} />
                        </div>
                      </div>
                      <div className="mt-0.5 text-xs text-[#FFFFFF80]">Example profile image</div>
                    </div>
                  </div>
                </div>
                <RequireAlert text="Upload Image" value={communityImage || !submitClicked} />
              </div>

              <div className="mt-1.5">
                <div className="mt-9 flex items-center">
                  <div className="text-tailwind [&>svg]:!h-6 [&>svg]:!w-6">{WebSiteSVG}</div>
                  <div className="relative ml-2.5 flex-1">
                    <StyledInput
                      value={website}
                      setValue={setWebsite}
                      placeholder="https://"
                      className="!h-fit w-full max-w-[333px] !p-[6px_8px]"
                    />
                    <div className="absolute -top-6 left-0">Website</div>
                  </div>
                </div>

                <div className="mt-7 flex items-center">
                  <div className="text-tailwind [&>svg]:!h-6 [&>svg]:!w-6">{TelegramSVG}</div>
                  <div className="relative ml-2.5 flex-1">
                    <StyledInput
                      value={telegram}
                      setValue={setTelegram}
                      placeholder="https://"
                      className="!h-fit w-full max-w-[333px] !p-[6px_8px]"
                    />
                    <div className="absolute -top-6 left-0">Telegram</div>
                  </div>
                </div>

                <div className="mt-7 flex items-center">
                  <div className="text-tailwind [&>svg]:!h-6 [&>svg]:!w-6">{TwitterSVG}</div>
                  <div className="relative ml-2.5 flex-1">
                    <StyledInput
                      value={twitter}
                      setValue={setTwitter}
                      placeholder="https://"
                      className="!h-fit w-full max-w-[333px] !p-[6px_8px]"
                    />
                    <div className="absolute -top-6 left-0">Twitter</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center justify-end xsm:flex-row">
                <div className="mb-4 mr-0 max-w-full text-xs leading-[1.2] text-[#FFFFFF80] xsm:mb-0 xsm:mr-2 xsm:max-w-[160px]">
                  Updates can be made later by contacting Brewlabs.
                </div>
                <StyledButton
                  className="!h-fit !w-fit p-[10px_12px] !font-normal"
                  onClick={() => onSubmitCommunity()}
                  disabled={isInValid && submitClicked}
                >
                  <span className="font-semibold">Submit</span>&nbsp; my community
                </StyledButton>
              </div>
            </div>
            <button
              onClick={() => {
                setOpen(false);
              }}
              className="absolute -right-2 -top-2 rounded-full bg-white p-2 dark:bg-zinc-900 sm:dark:bg-zinc-800"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6 dark:text-slate-400" />
            </button>
          </div>
        </motion.div>
      </div>
      <ReactTooltip
        anchorId={"A fee for proposal is recommended to avoid proposal spam."}
        place="right"
        content="A fee for proposal is recommended to avoid proposal spam."
      />
    </Dialog>
  );
};

export default CommunityModal;
