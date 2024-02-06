import { priceFormat } from "utils/functions";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

const StyledPrice = ({
  price,
  itemClassName,
  decimals = 6,
}: {
  price: any;
  itemClassName?: string;
  decimals?: number;
}) => {
  const wrappedPrice = Number(price);
  if (isNaN(price)) return;
  return (
    <div>
      {wrappedPrice >= 0.001 ? (
        wrappedPrice.toFixed(decimals)
      ) : (
        <div>
          0.0<span className={`text-sm ${itemClassName}`}>{priceFormat(wrappedPrice).count}</span>
          {priceFormat(wrappedPrice).value}
        </div>
      )}
    </div>
  );
};

export default StyledPrice;
