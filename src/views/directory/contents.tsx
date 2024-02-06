import Link from "next/link";

const contents = {
  indexes: {
    link: "https://brewlabs.gitbook.io/welcome-to-brewlabs/brewlabs-defi-products/brewlabs-2023/live-brewlabs-indexes",
    header: "Brewlabs Indexes - Cryptocurrency ETF’s.",
    body: (
      <div>
        Brewlabs token indexes allow users to create baskets of tokens to trade, share, profit and dilute risk. Users
        can dilute a purchase of tokens by means of using a single payment transaction to purchase nominated tokens
        within the index. Tokens purchased are then retained in the index smart contract until liquidated for profit or
        loss at the discretion of the user. Indexes can be created and deployed for{" "}
        <span className="text-primary">free</span> by any user. Create an index and share it with your friends, earn a
        commission on every participant in your indexes!
      </div>
    ),
  },
  invest: {
    link: "https://app.gitbook.com/o/1FzuyucQ4vBCbx7UCqdf/s/GDV23RNtyJTrZnDeUSD9/brewlabs-defi-products/brewlabs-2022/live-brewlabs-staking",
    header: "Stake, farm, zap and earn",
    body: (
      <div>
        Brewlabs offers and layers a variety of decentralisd finance products for teams and users. Take advantage of
        token staking to earn reward tokens from your favourite projects, stake LP tokens to contribute to your project
        liquidity pools or even utilise some of the industry largest liquidity reward protocols all within one simple
        UI. Be sure to do your research on any project your looking to earn with to ensure your principal is secured,
        select a pool to find out more. If you are a team, you can also deploy some of these products for free by
        visiting the{" "}
        <Link href="/deployer" target="_blank" className="!text-primary">
          product deployer
        </Link>{" "}
        tool.
        <br />
        <br /> We have ensured the smart contracts positioned behind the invest products have been audited, you can
        check our audits{" "}
        <Link href="https://skynet.certik.com/projects/brewlabs" target="_blank" className="!text-white">
          here
        </Link>{" "}
        with the industry leaders, <span className="text-white">Certik.</span>
      </div>
    ),
  },
};

export default contents;
