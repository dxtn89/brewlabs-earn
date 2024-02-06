/* eslint-disable react-hooks/exhaustive-deps */
import { ChainId } from "@brewlabs/sdk";
import { NETWORKS } from "config/constants/networks";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import { useTokenList } from "state/home/hooks";
import { useAllLists } from "state/lists/hooks";
import { getTradingPairHistories } from "state/pair/fetchTradingPairs";
import { useTokenMarketChart } from "state/prices/hooks";
import styled from "styled-components";
import { isAddress } from "utils";
import { BigNumberFormat, getChainLogo } from "utils/functions";
import DropDown from "views/directory/IndexDetail/Dropdowns/Dropdown";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [selectedDisplayType, setSelectedDisplayType] = useState(0);
  const [histories, setHistories] = useState(null);

  const bscMarketData = useTokenMarketChart(ChainId.BSC_MAINNET);
  const polyMarketData = useTokenMarketChart(ChainId.POLYGON);
  const bscTokenList = useTokenList(ChainId.BSC_MAINNET);
  const polyTokenList = useTokenList(ChainId.POLYGON);

  const bscMarketDataStringified = JSON.stringify(bscMarketData);
  const polyMarketDataStringified = JSON.stringify(polyMarketData);

  const bscTokenListStringified = JSON.stringify(bscTokenList);
  const polyTokenListStringified = JSON.stringify(polyTokenList);

  const periodTypes = [
    { name: "24 HRS", period: 86400 },
    { name: "7 DAYS", period: 86400 * 7 },
    { name: "30 DAYS", period: 86400 * 30 },
  ];
  const showTypes = ["Volume USD", "TVL"];

  useEffect(() => {
    Promise.all([
      getTradingPairHistories(ChainId.BSC_MAINNET, periodTypes[selectedPeriod].period, bscMarketData, bscTokenList),
      getTradingPairHistories(ChainId.POLYGON, periodTypes[selectedPeriod].period, polyMarketData, polyTokenList),
    ])
      .then((result: any) => {
        let feeHistory = [],
          tvlHistory = [],
          volumeHistory = [];
        for (let i = 0; i < 10; i++) {
          let fee = 0,
            tvl = 0,
            volume = 0;
          for (let j = 0; j < result.length; j++) {
            fee += result[j].feeHistory[i];
            tvl += result[j].tvlHistory[i];
            volume += result[j].volumeHistory[i];
          }
          feeHistory.push(fee);
          tvlHistory.push(tvl);
          volumeHistory.push(volume);
        }
        setHistories({ feeHistory, tvlHistory, volumeHistory });
      })
      .catch((e) => console.log(e));
  }, [
    selectedPeriod,
    bscMarketDataStringified,
    polyMarketDataStringified,
    bscTokenListStringified,
    polyTokenListStringified,
  ]);

  const networks: any = [
    "All",
    NETWORKS[ChainId.ETHEREUM],
    NETWORKS[ChainId.BSC_MAINNET],
    NETWORKS[ChainId.POLYGON],
    NETWORKS[ChainId.ARBITRUM],
    NETWORKS[8453],
  ];

  const wrappedHistories = [histories?.volumeHistory ?? [], histories?.tvlHistory ?? []];
  const chartData: any = {
    series: [
      {
        name: showTypes[selectedDisplayType].replace("USD", ""),
        data: wrappedHistories[selectedDisplayType],
      },
      {
        name: "Fee",
        data: histories?.feeHistory ?? [],
      },
    ],
    options: {
      colors: ["#EEBB19"],
      fill: {
        gradient: {
          type: "vertical",
          shadeIntensity: 0.5,
          inverseColors: true,

          stops: [0, 100],
          colorStops: [
            {
              offset: 0,
              color: "#EEBB19",
              opacity: 1,
            },
            {
              offset: 100,
              color: "#EEBB19",
              opacity: 0,
            },
          ],
        },
      },
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
        width: 1,
      },
      xaxis: {
        labels: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      tooltip: {
        y: {
          format: "",
          formatter: (value: any) => {
            return "$" + BigNumberFormat(value);
          },
        },
      },
      grid: {
        show: false,
      },
      legend: {
        show: false,
      },
    },
  };

  return (
    <StyledContainer className="mb-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[#FFFFFF40]">BREWSWAP {showTypes[selectedDisplayType].replace("USD", "")}</div>
        <div className="flex items-center">
          <DropDown
            value={selectedPeriod}
            setValue={(i) => setSelectedPeriod(i)}
            data={periodTypes.map((period) => period.name)}
            className="!mr-2 !w-20 !text-xs !font-bold"
            rounded={"6px"}
          />
          <DropDown
            value={selectedNetwork}
            setValue={setSelectedNetwork}
            data={networks.map((network: any, i: number) => (
              <div
                className="switch-name flex h-full w-full items-center overflow-hidden text-ellipsis whitespace-nowrap"
                key={i}
              >
                <img
                  src={i === 0 ? "/images/networks/multichain.svg" : getChainLogo(parseInt(network.chainId))}
                  alt={""}
                  className="primary-shadow h-5 w-5 rounded-full"
                />
                <div className="relative ml-1.5 w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap !text-xs font-medium">
                  {i === 0 ? "ALL" : network.chainName}
                </div>
              </div>
            ))}
            height={"36px"}
            rounded={"6px"}
            className="!w-[100px] !bg-[#202023] !text-xs !text-white"
            bodyClassName="!bg-none !bg-[#202023]"
            itemClassName={`hover:!bg-[#29292b] !justify-start !px-2`}
            isBorder={true}
          />
        </div>
      </div>
      <div className="relative z-10 h-[200px]">
        {histories ? (
          <Chart options={chartData.options} series={chartData.series} type="area" height={190} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Oval
              width={30}
              height={30}
              color={"white"}
              secondaryColor="black"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </div>
        )}
      </div>
      <div className="flex items-center">
        <div className="mr-4 text-xs text-[#FFFFFF40]">Display</div>
        <DropDown
          value={selectedDisplayType}
          setValue={(i) => setSelectedDisplayType(i)}
          data={showTypes}
          className="!mr-2 !w-[100px] !text-xs !font-bold"
          rounded={"6px"}
        />
      </div>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  .apexcharts-tooltip {
    color: white;
    top: 50% !important;
    transform: translateY(-50%);
  }
  .apexcharts-tooltip.apexcharts-theme-light {
    background: #eebc199d;
  }
  .apexcharts-tooltip-title {
    display: none;
  }
  .apexcharts-xaxistooltip {
    display: none;
  }
  .apexcharts-tooltip-text-y-label {
    margin-left: 4px;
  }
  .apexcharts-tooltip.apexcharts-theme-light {
    border: none;
  }
  .apexcharts-tooltip-marker {
    margin-right: 0;
  }
  > div:nth-child(2) > div {
    min-height: unset !important;
    margin-top: -35px;
  }
`;
