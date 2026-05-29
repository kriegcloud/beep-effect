import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@beep/ui/components/pagination";
import { A } from "@beep/utils";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Pagination` is a navigation landmark for splitting long result sets across pages. Compose the
 * root `Pagination` (a labelled `<nav>`) with a single `PaginationContent` list, then place one
 * `PaginationItem` per control. Inside the items use `PaginationPrevious`/`PaginationNext` for the
 * step controls, `PaginationLink` for each page number (set `isActive` on the current page so it
 * renders as an outlined, `aria-current="page"` button), and `PaginationEllipsis` to indicate
 * skipped page ranges. Each link is a button-styled `<a>`, so wire `href` (or `onClick`) to drive
 * navigation.
 *
 * Imported from `@beep/ui/components/pagination`.
 */
const meta = {
  title: "Components/Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  argTypes: {
    "aria-label": {
      control: "text",
      description: "Accessible name for the navigation landmark.",
      table: { defaultValue: { summary: "pagination" } },
    },
    className: {
      control: "text",
      description: "Additional classes merged onto the root `<nav>` wrapper.",
    },
    children: {
      control: false,
      description: "The `PaginationContent` list of items composing the control.",
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

const pages = A.makeBy(3, (index) => index + 1);

/**
 * The default pagination control with previous/next steppers, numbered page links, an ellipsis, and
 * an active page. The play test confirms the active page is marked `aria-current="page"` and that
 * clicking a sibling page link fires its handler.
 */
export const Default: Story = {
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(event) => {
              event.preventDefault();
              args.onClick?.(event);
            }}
          >
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const activePage = canvas.getByRole("button", { name: "2" });
    expect(activePage).toHaveAttribute("aria-current", "page");
    const thirdPage = canvas.getByRole("button", { name: "3" });
    expect(thirdPage).not.toHaveAttribute("aria-current");
    return userEvent.click(thirdPage).then(() => {
      expect(args.onClick).toHaveBeenCalled();
    });
  },
};

/**
 * A minimal control with only the previous and next steppers, useful when total page count is
 * unknown or hidden. The play test exercises the next stepper and asserts its handler fires.
 */
export const PreviousNextOnly: Story = {
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(event) => {
              event.preventDefault();
              args.onClick?.(event);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole("button", { name: "Go to next page" });
    expect(next).toBeVisible();
    return userEvent.click(next).then(() => {
      expect(args.onClick).toHaveBeenCalled();
    });
  },
};

/**
 * A compact run of numbered pages generated from a list, with the first page active and no ellipsis.
 * Use this when the full page set fits without truncation.
 */
export const NumberedPages: Story = {
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        {A.map(pages, (page) => (
          <PaginationItem key={page}>
            <PaginationLink href="#" isActive={page === 1}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

/**
 * A large result set truncated with leading and trailing ellipses, keeping the first page, a window
 * around the current page, and the last page reachable. The play test asserts both ellipses render
 * as hidden decorations.
 */
export const WithEllipsis: Story = {
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">5</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            6
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">7</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">20</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ellipses = canvas.getAllByText("More pages");
    expect(ellipses.length).toBe(2);
    return Promise.resolve();
  },
};

/**
 * On the first page, the previous stepper is disabled so the user cannot page backwards. The play
 * test asserts the previous link is disabled and clicking it does not fire its handler.
 */
export const FirstPage: Story = {
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" aria-disabled onClick={(event) => event.preventDefault()} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByLabelText("Go to previous page");
    expect(previous).toHaveAttribute("aria-disabled", "true");
    const activePage = canvas.getByRole("button", { name: "1" });
    expect(activePage).toHaveAttribute("aria-current", "page");
    return Promise.resolve();
  },
};
