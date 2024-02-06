import React, { useEffect, useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { isArray } from "lodash";

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */

const BAD_SRCS: { [tokenAddress: string]: true } = {};

const TokenLogo = ({ src, classNames, large, alt, ...rest }: any) => {
  const [, refresh] = useState<number>(0);

  const wrappedSRC = isArray(src) ? src : [src];
  const _src: string | undefined = wrappedSRC.find((s) => !BAD_SRCS[s]);

  const { width }: any = { ...rest };

  if (_src) {
    return (
      <div className={`relative ${classNames ?? ""}`}>
        <img
          {...rest}
          alt={alt}
          src={_src}
          onError={() => {
            if (_src) BAD_SRCS[_src] = true;
            refresh((i) => i + 1);
          }}
          className="w-full rounded-full"
          style={{ width: width ?? "100%" }}
        />
      </div>
    );
  }
  return (
    <div className={`relative ${classNames ?? ""}`}>
      <img
        {...rest}
        alt={alt ?? ""}
        src={"/images/unknown.png"}
        className="w-full rounded-full"
        style={{ width: width ?? "100%" }}
      />
      <div className={`absolute -right-1 ${large ? "scale-1 top-0" : "-top-1"}`} style={large ? {} : { width: "50%" }}>
        <img src={"/images/question.png"} alt={""} />
      </div>
    </div>
  );
};

export default TokenLogo;
