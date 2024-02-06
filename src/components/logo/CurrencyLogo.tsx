import { Currency, Token } from "@brewlabs/sdk";
import React, { useMemo } from "react";
import { AppId } from "config/constants/types";
import useHttpLocations from "../../hooks/useHttpLocations";
import { WrappedTokenInfo } from "../../state/lists/hooks";
import getTokenLogoURL from "../../utils/getTokenLogoURL";
import Logo from "./Logo";
import TokenLogo from "./TokenLogo";

export default function CurrencyLogo({
  currency,
  size = "24px",
  style,
  appId,
}: {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
  appId?: AppId;
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined);

  const src: string[] = useMemo(() => {
    if (currency?.isNative) return getTokenLogoURL(currency.wrapped.address, currency.chainId);

    if (currency instanceof Token) {
      return getTokenLogoURL(currency.address, currency.chainId, currency["logo"], appId, currency.symbol);
    }

    return [];
  }, [currency, uriLocations, appId]);

  return <TokenLogo width={size} height={size} src={src} alt={""} style={style} classNames="rounded-full" />;
}
