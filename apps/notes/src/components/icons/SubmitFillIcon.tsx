import type { LucideProps } from "lucide-react";

export function SubmitFillIcon(props: LucideProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height={24}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={12} cy={12} r={10} />
      <path d="M16 12l-4-4-4 4M12 16V8" fill="none" stroke="white" />
    </svg>
  );
}
