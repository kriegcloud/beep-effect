import { useEffect, useState } from "react";

export const useDebouncePendingClick = ({
  isPending,
  onClick,
}: {
  isPending?: undefined | boolean;
  onClick?: undefined | (() => void);
}) => {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (onClick && disabled && !isPending) {
      setDisabled(false);
      onClick();
    }
  }, [disabled, isPending, onClick]);

  return {
    disabled,
    onClick: onClick
      ? () => {
          if (isPending) {
            setDisabled(true);

            return;
          }

          onClick?.();
        }
      : undefined,
  };
};
