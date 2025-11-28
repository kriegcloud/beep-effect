import { useEffect, useState } from "react";

export const useDebouncePendingClick = ({ isPending, onClick }: { isPending?: boolean; onClick?: () => void }) => {
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
