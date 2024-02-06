/* eslint-disable react-hooks/exhaustive-deps */
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import { NETWORKS } from "config/constants/networks";
import { CommunityContext } from "contexts/CommunityContext";
import { DashboardContext } from "contexts/DashboardContext";
import { useActiveChainId } from "hooks/useActiveChainId";
import { useSwitchNetwork } from "hooks/useSwitchNetwork";
import { handleWalletError } from "lib/bridge/helpers";
import { getBep20Contract } from "utils/contractHelpers";
import { useSigner } from "utils/wagmi";

import DropDown from "components/dashboard/TokenList/Dropdown";
import { InfoSVG } from "components/dashboard/assets/svgs";
import StyledInput from "components/StyledInput";
import StyledButton from "views/directory/StyledButton";

const ProposalModal = ({ open, setOpen, community }) => {
  const coreCurrency = community.currencies[community.coreChainId];

  const [isFeeToVote, setIsFeeToVote] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);

  const { addProposal }: any = useContext(CommunityContext);
  const { chainId } = useActiveChainId();
  const { address: account } = useAccount();
  const { data: signer } = useSigner();
  const { canSwitch, switchNetwork } = useSwitchNetwork();
  const { pending, setPending }: { pending: boolean; setPending: (pending: boolean) => {} } =
    useContext(DashboardContext);

  const showError = (errorMsg: string) => {
    if (errorMsg) toast.error(errorMsg);
  };

  const onSubmitProposal = async () => {
    if (!title || !description) return;
    setPending(true);
    try {
      if (community.feeToProposal.type === "Yes") {
        const tokenContract = getBep20Contract(chainId, community.currencies[chainId].address, signer);
        const estimateGas = await tokenContract.estimateGas.transfer(
          community.feeToProposal.address,
          community.feeToProposal.amount
        );

        const tx = await tokenContract.transfer(community.feeToProposal.address, community.feeToProposal.amount, {
          gasLimit: Math.ceil(Number(estimateGas) * 1.2),
        });
        await tx.wait();
      }
      const durations = [3600 * 24 * 7, 3600 * 24 * 14, 3600 * 24 * 30];
      await addProposal(
        {
          title,
          description,
          isFeeToVote: isFeeToVote === 0,
          duration: durations[duration] * 1000,
          owner: account.toLowerCase(),
          createdTime: Date.now(),
          yesVoted: [],
          noVoted: [],
        },
        community.pid
      );
      setOpen(false);
    } catch (e: any) {
      console.log(e);
      handleWalletError(e, showError);
    }
    setPending(false);
  };

  const durations = [7, 14, 30].filter((data, i) => i <= community.maxProposal);
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
          <div className="primary-shadow relative w-[calc(100vw-24px)] max-w-[720px] rounded bg-[#18181B] p-[38px_12px_40px_12px] text-white md:p-[38px_47px_40px_64px] ">
            <div className="flex justify-between">
              <div className="flex-1 overflow-hidden">
                <div className="text-xl text-primary">New proposal</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                  By <span className="text-[#FFFFFF80]">{account}</span>
                </div>
              </div>
              <div className="primary-shadow flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-[#0E2130]">
                <img src={community.logo} alt={""} className="w-10 rounded" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end text-sm">
              {community.feeToVote.type === "Sometimes" ? (
                <div className="flex items-center">
                  <div className="relative mr-3">
                    Fee to vote?
                    <div
                      className="absolute -left-5 top-0.5 cursor-pointer text-tailwind transition hover:text-white [&>*:first-child]:!h-3.5 [&>*:first-child]:!w-3.5"
                      id="A small fee is charged on each user wallet vote sent to project nominated address."
                    >
                      {InfoSVG}
                    </div>
                  </div>
                  <DropDown
                    value={isFeeToVote}
                    setValue={setIsFeeToVote}
                    values={["Yes", "No"]}
                    type={"secondary"}
                    width="w-[72px]"
                    className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary"
                  />
                </div>
              ) : (
                ""
              )}
              <div className="mx-3">Duration</div>
              <DropDown
                value={duration}
                setValue={setDuration}
                values={durations.map((data) => data + " Days")}
                type={"secondary"}
                width="w-[100px]"
                className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary"
              />
            </div>
            <div>
              <div>Proposal title</div>
              <StyledInput
                value={title}
                setValue={setTitle}
                placeholder="Write your title here"
                className="w-full !rounded-none"
                isValid={!submitClicked || title}
              />
            </div>
            <div className="mt-[18px]">
              <div>Description</div>
              <StyledInput
                type={"textarea"}
                value={description}
                setValue={setDescription}
                placeholder="Write about your proposal here..."
                className="h-[183px] w-full !rounded-none"
                isValid={!submitClicked || description}
              />
            </div>
            <div className="ml-4 mt-4 flex flex-col justify-end text-xs leading-[1.2] text-[#FFFFFF80] md:ml-0 md:flex-row">
              <ul className="max-w-full list-disc md:max-w-[200px]">
                <li>
                  Submit community proposal fee {community.feeToProposal.amount / Math.pow(10, coreCurrency.decimals)}{" "}
                  {coreCurrency.symbol} token.
                </li>
              </ul>
              <ul className="mb-4 ml-0 mr-0 max-w-full list-disc md:mb-0 md:ml-6 md:mr-3 md:max-w-[200px]">
                <li>You can only post one proposal at a time. </li>
                <li>Proposals with profanities will be removed.</li>
              </ul>
              {Object.keys(community.currencies).includes(chainId.toString()) ? (
                <StyledButton
                  className={`!w-fit ${pending ? "p-[10px_40px_10px_12px]" : "p-[10px_12px]"} whitespace-nowrap`}
                  onClick={() => {
                    setSubmitClicked(true);
                    onSubmitProposal();
                  }}
                  pending={pending}
                  disabled={pending}
                >
                  Submit my proposal
                </StyledButton>
              ) : (
                <StyledButton
                  className="!w-fit whitespace-nowrap p-[10px_12px]"
                  onClick={() => {
                    switchNetwork(community.coreChainId);
                  }}
                  disabled={!canSwitch}
                >
                  Switch {NETWORKS[community.coreChainId].chainName}
                </StyledButton>
              )}
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
        anchorId={"A small fee is charged on each user wallet vote sent to project nominated address."}
        place="top"
        content="A small fee is charged on each user wallet vote sent to project nominated address."
      />
    </Dialog>
  );
};

export default ProposalModal;
