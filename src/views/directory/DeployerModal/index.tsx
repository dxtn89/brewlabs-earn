import { XMarkIcon } from "@heroicons/react/24/outline";
import Carousel from "react-multi-carousel";
import styled from "styled-components";

import { checkCircleSVG, chevronLeftSVG, UploadSVG } from "components/dashboard/assets/svgs";

import FarmDeployer from "./FarmDeployer";
import PoolDeployer from "./PoolDeployer";
import IndexDeployer from "./IndexDeployer";
import TokenDeployer from "../../../components/productDeployer/TokenDeployer";
import Soon from "@components/Soon";
import Modal from "@components/Modal";

const responsive = {
  desktop: {
    breakpoint: { max: 10000, min: 600 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 600, min: 370 },
    items: 2,
  },
  small: {
    breakpoint: { max: 370, min: 0 },
    items: 1,
  },
};

const HeroSection = ({
  deployType,
  setDeployType,
  setStep,
}: {
  deployType: string;
  setDeployType: any;
  setStep: any;
}) => {
  const CustomRightArrow = ({ onClick }) => {
    return (
      <div onClick={() => onClick()} className="absolute -right-5 -scale-150 cursor-pointer text-[#7a7a7c]">
        {chevronLeftSVG}
      </div>
    );
  };

  const CustomLeftArrow = ({ onClick }) => {
    return (
      <div onClick={() => onClick()} className="absolute -left-5 scale-150 cursor-pointer text-[#7a7a7c]">
        {chevronLeftSVG}
      </div>
    );
  };
  return (
    <div className="text-white">
      <p className="mb-2 mt-3.5 text-gray-500 [text-wrap:balance]">
        Welcome to the Brewlabs product deployer wizard. Using this wizard will allow you to deploy a range of Brewlabs
        products.
      </p>
      <div className="my-1">Select:</div>
      <CarouselPanel>
        <Carousel
          responsive={responsive}
          infinite={false}
          draggable={false}
          autoPlay={false}
          autoPlaySpeed={100000000}
          arrows={true}
          customRightArrow={<CustomRightArrow onClick={undefined} />}
          customLeftArrow={<CustomLeftArrow onClick={undefined} />}
        >
          {["Yield Farm", "Index", "Token"].map((data, i) => {
            return (
              <DeployItem
                key={i}
                className="primary-shadow mx-2 flex h-[140px] w-[140px] cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-[#FFFFFFBF] transition-all hover:border-solid hover:border-primary"
                onClick={() => setDeployType(data)}
                active={deployType === data}
              >
                <div>{data}</div>
                <div className="mt-7 scale-125">{UploadSVG}</div>
                {deployType === data ? <div className="absolute right-0 top-0 scale-[0.6]">{checkCircleSVG}</div> : ""}
                {data === "Token" ? (
                  <Soon text={"New"} className="!left-2 !top-2 !rounded !px-0.5 !py-0.5 !text-[10px]" />
                ) : (
                  ""
                )}
              </DeployItem>
            );
          })}
        </Carousel>
      </CarouselPanel>
      <div className="mb-4 mt-5 text-sm text-gray-500">
        *Staking pools, yield farms and indexes will deploy also the Brewlabs directory, you can find the latest pools
        easily be filtering with the “New” category.
      </div>
      <div className="divider" />

      <button
        type="button"
        onClick={() => setStep(1)}
        className="mx-auto flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-600 px-6 py-3 font-roboto font-bold text-zinc-700 ring-1 ring-zinc-900 transition-all hover:text-zinc-900 hover:shadow-xl hover:shadow-yellow-600/40"
      >
        Next
      </button>
    </div>
  );
};

const DeployerModal = ({
  open,
  setOpen,
  step,
  setStep,
  deployType,
  setDeployType,
}: {
  open: boolean;
  setOpen: any;
  step: any;
  setStep: any;
  deployType: any;
  setDeployType: any;
}) => {
  return (
    <Modal open={open}>
      <div className="p-8">
        <div className="mt-3 sm:mt-5">
          <h3 className="mb-6 text-lg font-medium leading-6 text-gray-900">Brewlabs Project Deployer</h3>

          {step === 0 ? (
            <HeroSection deployType={deployType} setDeployType={setDeployType} setStep={setStep} />
          ) : deployType === "Staking Pool" ? (
            <PoolDeployer setOpen={setOpen} />
          ) : deployType === "Yield Farm" ? (
            <FarmDeployer setOpen={setOpen} step={step} setStep={setStep} />
          ) : deployType === "Index" ? (
            <IndexDeployer setOpen={setOpen} step={step} setStep={setStep} />
          ) : (
            <TokenDeployer />
          )}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute -right-2 -top-2 rounded-full bg-zinc-900 p-2 sm:bg-zinc-800"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-6 w-6 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

const DeployItem = styled.div<{ active: boolean }>`
  border: 1px ${({ active }) => (active ? "solid #ffde00" : "dashed #ffffff50")};
  > div > svg {
    color: ${({ active }) => (active ? "#ffde00" : "white")};
  }
  position: relative;
`;

const CarouselPanel = styled.div`
  width: calc(100% - 30px);
  margin: 0 auto;
  .react-multi-carousel-list {
    position: unset !important;
    padding: 8px 0;
  }
  position: relative;
  .react-multi-carousel-item {
    display: flex;
    justify-content: center;
  }
`;

export default DeployerModal;
