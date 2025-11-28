import * as React from "react";

import { type ExternalToast, toast } from "sonner";

export const useCopyToClipboard = ({ timeout = 2000 }: { timeout?: number } = {}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = (value: string, { data, tooltip }: { data?: ExternalToast; tooltip?: string } = {}) => {
    if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }
    if (!value) {
      return;
    }

    void navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    });

    if (tooltip) {
      toast.success(tooltip, data);
    }
  };

  return { copyToClipboard, isCopied };
};
