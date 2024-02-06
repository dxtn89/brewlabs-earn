/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";

import { InfoSVG } from "@components/dashboard/assets/svgs";
import StyledInput from "@components/StyledInput";
import { DashboardContext } from "contexts/DashboardContext";
import StyledButton from "views/directory/StyledButton";
import { getAddress, isAddress } from "ethers/lib/utils.js";

const SetWalletModal = ({
  open,
  setOpen,
  onClick,
  title,
  prevWallet = "",
}: {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  onClick: (address: string) => void;
  title: string;
  prevWallet?: string;
}) => {
  const { pending }: any = useContext(DashboardContext);
  const [address, setAddress] = useState("");

  const isUpdatable = isAddress(address) && getAddress(address) !== getAddress(prevWallet);

  return (
    <Dialog
      open={open}
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-300 bg-opacity-90 font-brand dark:bg-zinc-900 dark:bg-opacity-80"
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
          <div className="relative w-[calc(100vw-24px)] max-w-[500px] rounded border-[2px] border-brand bg-[rgb(24,24,27)] p-[40px_33px_30px_37px] text-white">
            <div className="relative text-lg">
              Set wallet for {title}
              <div className="absolute -left-5 top-1 text-white [&>svg]:h-4 [&>svg]:w-4 [&>svg]:opacity-100">
                {InfoSVG}
              </div>
            </div>
            <div className="mb-4 mt-2 text-sm">Nominate your target wallet for this swap fee category.</div>
            <StyledInput
              value={address}
              setValue={setAddress}
              placeholder={prevWallet ?? "0x........."}
              className="w-full"
            />
            <div className="mt-2.5 flex">
              <StyledButton
                className="!h-9 !w-28 !bg-[#B9B8B81A] text-xs !font-normal !text-[#FFFFFFBF]"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Back
              </StyledButton>
              <div className="mr-3" />
              <StyledButton
                className="!h-9 !w-28 text-xs !font-normal"
                onClick={() => {
                  onClick(address);
                }}
                disabled={pending || !isUpdatable}
              >
                Confirm
              </StyledButton>
            </div>
            <button
              disabled={pending}
              onClick={() => setOpen(false)}
              className="absolute -right-3 -top-1 rounded-full bg-white p-2 dark:bg-zinc-900 sm:dark:bg-zinc-800"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6 dark:text-slate-400" />
            </button>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
};

export default SetWalletModal;
