/**
 * Native OIP contact form.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

"use client";

import { useEffect, useState } from "react";
import type { ContactSubmissionStatus } from "../contact";

const inputClass =
  "min-h-11 rounded-md border border-[color-mix(in_oklab,var(--oip-on-soil)_22%,transparent)] bg-[color-mix(in_oklab,var(--oip-soil)_18%,transparent)] px-3 py-2 text-sm text-[var(--oip-on-soil)] outline-none transition-colors placeholder:text-[color-mix(in_oklab,var(--oip-on-soil)_52%,transparent)] focus:border-[var(--oip-gold)] focus:ring-3 focus:ring-[color-mix(in_oklab,var(--oip-gold)_35%,transparent)]";
const labelClass = "grid gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--oip-on-burgundy-accent)]";
const submitButtonClass =
  "inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-transparent bg-primary bg-clip-padding px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";

/**
 * Renders the OIP contact form.
 *
 * @example
 * ```tsx
 * import { ContactForm } from "@beep/oip-web/components/ContactForm"
 *
 * const form = <ContactForm email="tom@example.com" status={undefined} />
 * console.log(form.type)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function ContactForm({
  email,
  status,
}: {
  readonly email: string;
  readonly status: ContactSubmissionStatus | undefined;
}) {
  const [submittedAt, setSubmittedAt] = useState(0);

  useEffect(() => {
    setSubmittedAt(Math.trunc(performance.timeOrigin + performance.now()));
  }, []);

  return (
    <form
      action="/api/contact"
      className="grid gap-4 rounded-lg border border-[color-mix(in_oklab,var(--oip-on-soil)_22%,transparent)] bg-[color-mix(in_oklab,var(--oip-soil)_30%,transparent)] p-6"
      method="post"
    >
      <input aria-hidden="true" className="hidden" name="website" tabIndex={-1} autoComplete="off" />
      <input name="submittedAt" type="hidden" value={submittedAt} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <input className={inputClass} name="name" required minLength={2} autoComplete="name" />
        </label>
        <label className={labelClass}>
          Email
          <input className={inputClass} name="email" required type="email" autoComplete="email" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Company
          <input className={inputClass} name="company" autoComplete="organization" />
        </label>
        <label className={labelClass}>
          Phone
          <input className={inputClass} name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
      <label className={labelClass}>
        Technology
        <input className={inputClass} name="technology" />
      </label>
      <label className={labelClass}>
        Posture
        <input className={inputClass} name="posture" />
      </label>
      <label className={labelClass}>
        Message
        <textarea className={`${inputClass} min-h-32 resize-y`} name="message" required minLength={12} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button className={submitButtonClass} type="submit">
          Send note
        </button>
        <a
          className="font-[family-name:var(--font-oip-mono)] text-xs uppercase tracking-[0.12em] text-[var(--oip-on-burgundy-accent)]"
          href={`mailto:${email}`}
        >
          Email directly
        </a>
      </div>
      <p
        className="text-sm text-[var(--oip-gold-bright)] empty:hidden"
        id="contact-form-status"
        role={status === undefined ? undefined : "status"}
      >
        {status === "accepted" ? "Your note was received." : null}
      </p>
      {status === "rejected" && (
        <p className="text-sm text-[color-mix(in_oklab,var(--oip-on-soil)_88%,transparent)]" role="status">
          Your note could not be sent here. Email directly instead.
        </p>
      )}
    </form>
  );
}
