import { useRef } from "react";
import { useRouter } from "next/router";
import { Tooltip as ReactTooltip } from "react-tooltip";
import styled from "styled-components";
import Carousel from "react-multi-carousel";

import TokenLogo from "@components/logo/TokenLogo";
import { SkeletonComponent } from "components/SkeletonComponent";
import { useGlobalState } from "state";
import { useIndexes } from "state/indexes/hooks";
import { getChainLogo, getIndexName } from "utils/functions";
import getTokenLogoURL from "utils/getTokenLogoURL";

import { InfoSVG } from "./assets/svgs";
import { useMediaQuery } from "react-responsive";

const responsive = {
  desktop: {
    breakpoint: { max: 10000, min: 720 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 768, min: 530 },
    items: 1,
  },
  small: {
    breakpoint: { max: 530, min: 0 },
    items: 1,
  },
};

const IndexPerformance = () => {
  const { indexes } = useIndexes();
  const carouselRef: any = useRef();
  const router = useRouter();
  let splitIndex: any = [];
  const [isOpen, setIsOpen] = useGlobalState("userSidebarOpen");

  const isMd = useMediaQuery({ query: "(max-width: 640px)" });

  const CustomDot = ({ onClick, ...rest }: any) => {
    const { active } = rest;

    // onMove means if dragging or swiping in progress.
    // active is provided by this lib for checking if the item is active or not.
    return <DotGroup active={active} onClick={() => onClick()} />;
  };

  let sortedIndexes = indexes.map((data) => {
    let sortedPercentChanges = data.priceChanges;
    if (!sortedPercentChanges) sortedPercentChanges = [undefined, undefined, undefined, undefined];
    else {
      sortedPercentChanges = sortedPercentChanges.map((data) => data.percent);
    }
    return { ...data, sortedPercentChanges };
  });

  sortedIndexes = sortedIndexes.sort((a, b) => b.sortedPercentChanges[2] - a.sortedPercentChanges[2]);

  for (let i = 0; i < Math.min(Math.ceil(sortedIndexes.length / 3), 3); i++)
    splitIndex.push(sortedIndexes.slice(i * 3, i * 3 + 3));

  return (
    <StyledContainer className="-mt-2 w-full">
      <div className="relative  ml-4 text-yellow xsm:ml-0">
        Index Performance
        <div className="absolute -left-4 top-1.5 [&>*:first-child]:!opacity-100" id={"Top9"}>
          {InfoSVG}
        </div>
        <ReactTooltip anchorId={"Top9"} place="right" content="Top 9 Brewlabs Indexes based on performance." />
      </div>
      <div className="mx-auto w-full max-w-[652px] sm:max-w-[676px]">
        {isOpen ? (
          <Carousel
            arrows={false}
            responsive={responsive}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={4000000}
            ref={carouselRef}
            customDot={<CustomDot onClick={() => {}} />}
            showDots={true}
          >
            {splitIndex.map((indexes, i) => {
              return (
                <div className="w-full" key={i}>
                  {indexes.map((data: any, i) => {
                    return (
                      <div
                        key={i}
                        className="flex cursor-pointer items-center justify-between rounded p-[12px_4px_12px_8px] transition hover:bg-[rgba(50,50,50,0.4)] sm:p-[12px_12px_12px_24px] "
                        onClick={() => {
                          router.push(`/indexes/${data.chainId}/${data.pid}`);
                          setIsOpen(0);
                        }}
                      >
                        <div className="flex flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap">
                          <div className="flex w-[64px]">
                            {data.tokens.map((data, i) => {
                              return (
                                <TokenLogo
                                  key={i}
                                  src={getTokenLogoURL(data.address, data.chainId, data.logo)}
                                  classNames="-mr-3 h-6 w-6"
                                />
                              );
                            })}
                          </div>
                          <img src={getChainLogo(data.chainId)} alt={""} className="ml-3 h-5 w-5" />
                          <div className="ml-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-brand text-xs text-white">
                            {getIndexName(data.tokens)}
                          </div>
                        </div>
                        <div className="flex">
                          {data.sortedPercentChanges.map((data, i) => {
                            if ((isMd && i != 0) || i > 2) return;
                            const names = ["24hrs", "7D", "30D"];
                            return (
                              <div
                                key={i}
                                className="mr-0 w-[50px] text-right text-xs xsm:mr-2 xsm:w-fit sm:xsm:mr-5 sm:text-left"
                              >
                                {data ? (
                                  <div className={data < 0 ? "text-danger" : "text-green"}>
                                    {data >= 0 ? "+" : ""} {data.toFixed(2)}% {names[i]}
                                  </div>
                                ) : (
                                  <SkeletonComponent />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </Carousel>
        ) : (
          ""
        )}
      </div>
    </StyledContainer>
  );
};

const DotGroup = styled.div<{ active?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #ffde00;
  background: ${({ active }) => (active ? "#FFDE00" : "transparent")};
  transition: all 0.15s;
  :hover {
    background: ${({ active }) => (active ? "#FFDE00" : "#ffdd004c")};
  }
  margin-right: 8px;
  z-index: 100;
`;

const StyledContainer = styled.div`
  .react-tooltip {
    z-index: 100;
    font-size: 13px;
    line-height: 125%;
    text-align: center;
  }
  .react-multi-carousel-list {
    overflow: unset !important;
    overflow-x: clip !important;
  }
  .react-multi-carousel-dot-list {
    bottom: -20px !important;
  }
`;

export default IndexPerformance;
