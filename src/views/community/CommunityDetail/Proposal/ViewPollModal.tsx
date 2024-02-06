/* eslint-disable react-hooks/exhaustive-deps */
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { checkCircleSVG } from "@components/dashboard/assets/svgs";
import StyledButton from "views/directory/StyledButton";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "contexts/DashboardContext";
import { toast } from "react-toastify";
import { handleWalletError } from "lib/bridge/helpers";
import { getBep20Contract } from "utils/contractHelpers";
import { useSigner } from "utils/wagmi";
import { useActiveChainId } from "@hooks/useActiveChainId";
import { useAccount } from "wagmi";
import { CommunityContext } from "contexts/CommunityContext";

const ViewPollModal = ({ open, setOpen, community, poll, setIsVoted }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

  const { pending, setPending }: any = useContext(DashboardContext);
  const { voteOnPoll }: any = useContext(CommunityContext);
  const { data: signer } = useSigner();
  const { chainId } = useActiveChainId();
  const { address: account } = useAccount();

  const stringifiedPoll = JSON.stringify(poll);
  useEffect(() => {
    setSelectedOption(0);
  }, [stringifiedPoll]);

  const showError = (errorMsg: string) => {
    if (errorMsg) toast.error(errorMsg);
  };

  async function onSubmitAnswer() {
    setPending(true);
    try {
      if (community.feeToVote.type === "Yes" || (community.feeToVote.type === "Sometimes" && poll.isFeeToVote)) {
        const tokenContract = getBep20Contract(chainId, community.currencies[chainId].address, signer);
        const estimateGas = await tokenContract.estimateGas.transfer(
          community.feeToVote.address,
          community.feeToVote.amount
        );

        const tx = await tokenContract.transfer(community.feeToVote.address, community.feeToVote.amount, {
          gasLimit: Math.ceil(Number(estimateGas) * 1.2),
        });
        await tx.wait();
      }
      const success = await voteOnPoll(account, community.pid, poll.index, selectedOption);
      if (success) {
        setIsVoted(true);
        setTimeout(() => {
          setIsVoted(false);
        }, 5000);
      }
      setOpen(false);
    } catch (e) {
      console.log(e);
      handleWalletError(e, showError);
    }
    setPending(false);
  }

  const coreCurrency = community.currencies[community.coreChainId];

  return (
    <Dialog
      open={open}
      className="fixed inset-0 z-[100] overflow-y-auto bg-gray-300 bg-opacity-90 font-brand backdrop-blur-[2px] dark:bg-zinc-900 dark:bg-opacity-80"
      onClose={() => setOpen(false)}
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
                <div className="text-xl text-primary">{poll.title}</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                  By <span className="text-[#FFFFFF80]">{poll.owner}</span>
                </div>
              </div>
              <div className="primary-shadow flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-[#0E2130]">
                <img src={community.logo} alt={""} className="w-10 rounded" />
              </div>
            </div>

            <div className="mt-[18px]">
              <div>Poll description</div>
              <div className="font-roboto text-xs text-[#FFFFFF80]">
                <div className={`break-all ${detailOpen ? "line-clamp-[100]" : "line-clamp-[3]"}`}>
                  {poll.description}
                </div>
                <div className="cursor-pointer text-right hover:text-white" onClick={() => setDetailOpen(!detailOpen)}>
                  {detailOpen ? "(show less)" : "(details)"}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-between sm:flex-row">
              <div>Poll choices</div>
              <div className="mt-4 max-w-[400px] flex-1 sm:mt-0">
                {poll.options.map((poll, i) => (
                  <div key={i} className="mb-1.5 flex text-sm">
                    <div className={`mt-2 ${selectedOption === i ? "text-primary" : "text-[#FFFFFF80]"}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div
                      className={`${
                        selectedOption === i ? "border-primary text-white" : "border-transparent text-[#FFFFFF80]"
                      } primary-shadow mx-2 flex h-8 flex-1 cursor-pointer items-center border bg-[#202023] px-2 font-roboto transition hover:scale-[1.03]`}
                      onClick={() => setSelectedOption(i)}
                    >
                      {poll}
                    </div>
                    <div
                      className={`mt-2 ${
                        selectedOption === i ? "text-primary" : "text-tailwind"
                      } [&>svg]:!h-4 [&>svg]:!w-4`}
                    >
                      {checkCircleSVG}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-xs text-[#FFFFFF80]">
              Submit community proposal fee {community.feeToVote.amount / Math.pow(10, coreCurrency.decimals)}{" "}
              {coreCurrency.symbol} token.
            </div>

            <div className="mt-2 flex justify-end font-roboto text-xs text-[#FFFFFF80]">
              <StyledButton
                className={`mt-0 !w-fit whitespace-nowrap ${
                  pending ? "p-[10px_40px_10px_12px]" : "p-[10px_12px]"
                } !font-normal`}
                onClick={() => onSubmitAnswer()}
                disabled={pending}
                pending={pending}
              >
                <span className="!font-roboto font-bold">Submit</span>&nbsp;answer
              </StyledButton>
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

export default ViewPollModal;
