import { Atom, useAtom } from "@effect-atom/atom-react";
import * as Duration from "effect/Duration";
import type { ExternalToast } from "sonner";
import { toast } from "sonner";

const isCopiedAtom = Atom.make<boolean>(false);

type UseCopyToClipboardProps = {
  readonly timeout?: undefined | Duration.Duration;
};

type CopyToClipBoardOptions = {
  readonly data?: ExternalToast | undefined;
  readonly tooltip?: string | undefined;
};

export const useCopyToClipboard = ({ timeout = Duration.millis(2000) }: UseCopyToClipboardProps = {}) => {
  const [isCopied, setIsCopied] = useAtom(isCopiedAtom);

  const copyToClipboard = (value: string, { data, tooltip }: CopyToClipBoardOptions = {}) => {
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
      }, Duration.toMillis(timeout));
    });

    if (tooltip) {
      toast.success(tooltip, data);
    }
  };

  return { copyToClipboard, isCopied } as const;
};
