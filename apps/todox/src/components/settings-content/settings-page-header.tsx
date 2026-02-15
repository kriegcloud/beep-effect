interface SettingsPageHeaderProps {
  readonly title?: string;
  readonly description?: string;
  readonly learnMoreHref?: string;
}

export function SettingsPageHeader({
  title = "General",
  description = "Update your profile, display name, timezone, and language preferences.",
  learnMoreHref = "#",
}: SettingsPageHeaderProps) {
  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-y-4">
        <div className="space-y-0.5">
          <h1 className="text-shade-gray-1200 text-2xl font-bold">{title}</h1>
          <p className="text-shade-gray-800 text-sm leading-relaxed">
            {description}{" "}
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={learnMoreHref}
              className="text-primary hover:text-primary/80"
            >
              Learn more.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
