import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * MUI primitives rendered through the shared `@beep/ui` theme, which the global
 * Storybook decorator supplies. This story is the dark-mode proof: with the
 * light/dark toolbar the Card surface, Typography, Button, and TextField must
 * all recolor — not just the Tailwind page background. It imports no `@beep/ui`
 * theme objects, so a correct render proves the decorator wires the provider
 * end to end.
 */
const meta = {
  title: "Themes/MUI",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A MUI Card whose surface, text, and controls recolor with the light/dark toolbar. */
export const Default: Story = {
  render: () => (
    <Card sx={{ maxWidth: 360 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">MUI theme check</Typography>
          <Typography variant="body2" color="text.secondary">
            Surface, text, and controls should recolor with the light/dark toolbar.
          </Typography>
          <TextField label="Label" defaultValue="Value" size="small" fullWidth />
          <Stack direction="row" spacing={1}>
            <Button variant="contained">Contained</Button>
            <Button variant="outlined">Outlined</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("MUI theme check")).toBeVisible();
  },
};
