import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          This accordion allows multiple items to be open at the same time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>
          Try opening this while Section 1 is still open.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>
          All sections can be expanded simultaneously.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Accordion type="single" defaultValue="item-2" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Item</AccordionTrigger>
        <AccordionContent>Content for the first item.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Item (Default Open)</AccordionTrigger>
        <AccordionContent>This item is open by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Item</AccordionTrigger>
        <AccordionContent>Content for the third item.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const LeftIcon: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger icon="left">Icon on the left</AccordionTrigger>
        <AccordionContent>
          The chevron icon is positioned on the left side of the trigger.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger icon="left">Another item</AccordionTrigger>
        <AccordionContent>More content here.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const NoAnimation: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger transitionIcon={false}>No Icon Animation</AccordionTrigger>
        <AccordionContent disableAnimations>
          This accordion has animations disabled.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger transitionIcon={false}>Another Item</AccordionTrigger>
        <AccordionContent disableAnimations>
          The content appears without animation.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const FAQ: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
          <AccordionContent>
            We accept all major credit cards (Visa, MasterCard, American Express), PayPal,
            and bank transfers. For enterprise customers, we also offer invoicing options.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
          <AccordionContent>
            You can cancel your subscription at any time from your account settings.
            Navigate to Settings &gt; Billing &gt; Cancel Subscription. Your access will
            continue until the end of your current billing period.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is there a free trial available?</AccordionTrigger>
          <AccordionContent>
            Yes! We offer a 14-day free trial for all new users. No credit card required.
            You&apos;ll have access to all features during the trial period.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
          <AccordionContent>
            We offer a 30-day money-back guarantee for all paid plans. If you&apos;re not
            satisfied with our service, contact our support team for a full refund.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Nested: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Parent Item 1</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">This accordion has nested content:</p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="nested-1">
              <AccordionTrigger>Nested Item A</AccordionTrigger>
              <AccordionContent>Content for nested item A.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="nested-2">
              <AccordionTrigger>Nested Item B</AccordionTrigger>
              <AccordionContent>Content for nested item B.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Parent Item 2</AccordionTrigger>
        <AccordionContent>Regular content without nesting.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
