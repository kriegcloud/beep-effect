import { Iconify } from "@beep/ui/atoms";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { alpha, keyframes } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { FormEvent, ReactNode } from "react";

const pulseRing = keyframes`
  0% {
    transform: scale(0.9);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.18;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.4;
  }
`;

interface PageContainerProps {
  children: ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <Box
    sx={(theme) => ({
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      py: { xs: 4, md: 6 },
      px: { xs: 2, sm: 3 },
      backgroundColor: "background.default",
      backgroundImage: `
        radial-gradient(circle at 18% 18%, ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.16)} 0%, transparent 55%),
        radial-gradient(circle at 82% 10%, ${rgbaFromChannel(theme.vars.palette.secondary.mainChannel, 0.14)} 0%, transparent 58%),
        linear-gradient(135deg, ${rgbaFromChannel(theme.vars.palette.background.defaultChannel, 0.98)} 0%, ${rgbaFromChannel(theme.vars.palette.background.paperChannel, 0.92)} 100%)
      `,
    })}
  >
    <Container maxWidth="md">
      <Stack spacing={{ xs: 5, md: 6 }}>{children}</Stack>
    </Container>
  </Box>
);

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => (
  <Stack spacing={2.5} alignItems="center" textAlign="center">
    <Box
      sx={(theme) => ({
        width: 64,
        height: 64,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 3,
        border: `1px solid ${rgbaFromChannel(theme.vars.palette.primary.lightChannel, 0.35)}`,
        backgroundImage: `linear-gradient(135deg, ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.16)}, ${rgbaFromChannel(theme.vars.palette.secondary.mainChannel, 0.12)})`,
        boxShadow: `0 18px 40px -26px ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.8)}`,
      })}
    >
      <Iconify icon="mdi:sparkles" width={32} />
    </Box>

    <Typography
      component="h1"
      variant="h3"
      sx={(theme) => ({
        fontWeight: 700,
        letterSpacing: "-0.01em",
        backgroundImage: `linear-gradient(90deg, ${alpha(theme.palette.common.white, 0.96)}, ${alpha(theme.palette.grey[300], 0.78)})`,
        color: "transparent",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      })}
    >
      {title}
    </Typography>

    <Typography variant="h6" color="text.secondary">
      {subtitle}
    </Typography>
  </Stack>
);

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Ask anything you want to know...",
  disabled = false,
}) => (
  <InputBase
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    sx={(theme) => ({
      flex: 1,
      width: "100%",
      px: { xs: 2.25, sm: 3 },
      py: { xs: 1.75, sm: 2 },
      borderRadius: 2,
      color: theme.palette.text.primary,
      fontSize: theme.typography.pxToRem(18),
      transition: theme.transitions.create(["background-color", "box-shadow"]),
      "&::placeholder": {
        color: rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.62),
        opacity: 1,
      },
      "&.Mui-disabled": {
        color: rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.4),
      },
    })}
  />
);

interface SearchButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ onClick, disabled = false, loading = false }) => (
  <Button
    type="submit"
    onClick={onClick}
    disabled={disabled || loading}
    sx={(theme) => ({
      width: { xs: "100%", sm: "auto" },
      alignSelf: { xs: "stretch", sm: "center" },
      px: { xs: 3, sm: 4 },
      py: { xs: 1.75, sm: 1.9 },
      borderRadius: 2.5,
      fontWeight: 600,
      letterSpacing: 0.1,
      backgroundImage: `linear-gradient(90deg, ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 1)}, ${rgbaFromChannel(theme.vars.palette.secondary.mainChannel, 1)})`,
      color: "common.white",
      boxShadow: `0 22px 36px -20px ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.75)}`,
      transition: theme.transitions.create(["transform", "box-shadow", "background-image"], {
        duration: theme.transitions.duration.shorter,
      }),
      "&:hover": {
        transform: "translateY(-2px)",
        backgroundImage: `linear-gradient(90deg, ${rgbaFromChannel(theme.vars.palette.primary.lightChannel, 1)}, ${rgbaFromChannel(theme.vars.palette.secondary.lightChannel, 1)})`,
        boxShadow: `0 26px 42px -22px ${rgbaFromChannel(theme.vars.palette.secondary.mainChannel, 0.78)}`,
      },
      "&.Mui-disabled": {
        backgroundImage: "none",
        backgroundColor: alpha(theme.palette.primary.main, 0.25),
        boxShadow: "none",
        color: alpha(theme.palette.common.white, 0.7),
      },
    })}
  >
    {loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:search-fill" width={20} />}
  </Button>
);

interface CancelButtonProps {
  onClick: () => void;
}

export const CancelButton: React.FC<CancelButtonProps> = ({ onClick }) => (
  <Box display="flex" justifyContent="center">
    <Button
      type="button"
      onClick={onClick}
      startIcon={<Iconify icon="solar:close-circle-bold" width={18} />}
      sx={(theme) => ({
        px: 3,
        py: 1.5,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: alpha(theme.palette.divider, 0.4),
        color: rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.78),
        backdropFilter: "blur(18px)",
        transition: theme.transitions.create(["border-color", "color", "background-color"]),
        "&:hover": {
          color: theme.palette.text.primary,
          borderColor: alpha(theme.palette.divider, 0.7),
          backgroundColor: rgbaFromChannel(theme.vars.palette.background.paperChannel, 0.28),
        },
      })}
    >
      Cancel
    </Button>
  </Box>
);

interface SearchFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, children }) => (
  <Box sx={{ position: "relative" }}>
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={(theme) => {
        const baseRadiusRaw =
          typeof theme.shape.borderRadius === "number"
            ? theme.shape.borderRadius
            : Number.parseFloat(theme.shape.borderRadius);
        const baseRadius = Number.isFinite(baseRadiusRaw) ? baseRadiusRaw : 8;

        return {
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: -18,
            borderRadius: baseRadius * 3,
            backgroundImage: `linear-gradient(90deg, ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.16)}, ${rgbaFromChannel(theme.vars.palette.secondary.mainChannel, 0.16)}, ${rgbaFromChannel(theme.vars.palette.info.mainChannel, 0.16)})`,
            filter: "blur(32px)",
            opacity: 0,
            transition: theme.transitions.create(["filter", "opacity"], {
              duration: 600,
            }),
            pointerEvents: "none",
          },
          "&:hover::before": {
            opacity: 1,
            filter: "blur(38px)",
          },
        };
      }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          borderRadius: 3,
          px: 1.25,
          py: 1.25,
          backdropFilter: "blur(28px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.32)}`,
          backgroundColor: rgbaFromChannel(
            theme.vars.palette.background.paperChannel,
            theme.palette.mode === "dark" ? 0.58 : 0.74
          ),
          boxShadow: `0 38px 54px -40px ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.65)}`,
        })}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 1 }}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          {children}
        </Stack>
      </Paper>
    </Box>
  </Box>
);

interface ProgressStepProps {
  label: string;
  icon: ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
}

export const ProgressStep: React.FC<ProgressStepProps> = ({ label, icon, isActive, isCompleted, isCancelled }) => (
  <Stack spacing={1.5} alignItems="center">
    <Box
      sx={(theme) => {
        const activeGradient = `linear-gradient(135deg, ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 1)}, ${rgbaFromChannel(theme.vars.palette.secondary.mainChannel, 1)})`;
        const completedGradient = `linear-gradient(135deg, ${rgbaFromChannel(theme.vars.palette.success.mainChannel, 1)}, ${rgbaFromChannel(theme.vars.palette.success.lightChannel, 1)})`;

        return {
          position: "relative",
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundImage: isCancelled ? "none" : isCompleted ? completedGradient : isActive ? activeGradient : "none",
          backgroundColor: isCancelled
            ? rgbaFromChannel(theme.vars.palette.background.paperChannel, theme.palette.mode === "dark" ? 0.28 : 0.42)
            : isActive || isCompleted
              ? "transparent"
              : rgbaFromChannel(theme.vars.palette.background.paperChannel, theme.palette.mode === "dark" ? 0.32 : 0.5),
          border: isActive || isCompleted || isCancelled ? "none" : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          boxShadow: isCancelled
            ? "none"
            : isActive
              ? `0 22px 40px -30px ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.8)}`
              : isCompleted
                ? `0 22px 40px -30px ${rgbaFromChannel(theme.vars.palette.success.mainChannel, 0.7)}`
                : "none",
          color: isCancelled
            ? rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.6)
            : isActive || isCompleted
              ? theme.palette.common.white
              : rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.78),
          "&::after":
            isActive && !isCancelled
              ? {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  backgroundImage: activeGradient,
                  opacity: 0.24,
                  animation: `${pulseRing} 1800ms ease-in-out infinite`,
                }
              : undefined,
        };
      }}
    >
      <Box
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isCancelled
            ? rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.6)
            : isActive || isCompleted
              ? theme.palette.common.white
              : rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.78),
        })}
      >
        {isCompleted ? <Iconify icon="solar:check-circle-bold" width={24} /> : icon}
      </Box>
    </Box>
    <Typography
      variant="body2"
      sx={(theme) => ({
        fontWeight: 600,
        letterSpacing: 0.2,
        color: isCancelled
          ? rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.52)
          : isActive
            ? theme.palette.text.primary
            : isCompleted
              ? theme.palette.success.main
              : rgbaFromChannel(theme.vars.palette.text.secondaryChannel, 0.74),
        transition: theme.transitions.create("color"),
      })}
    >
      {label}
    </Typography>
  </Stack>
);

interface ProgressConnectorProps {
  isLast?: boolean;
}

export const ProgressConnector: React.FC<ProgressConnectorProps> = ({ isLast = false }) =>
  isLast ? null : (
    <Box
      sx={(theme) => ({
        flexShrink: 0,
        width: { xs: 40, sm: 64 },
        height: 2,
        borderRadius: 999,
        backgroundImage: `linear-gradient(90deg, ${rgbaFromChannel(theme.vars.palette.background.paperChannel, theme.palette.mode === "dark" ? 0.32 : 0.18)}, ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.28)})`,
      })}
    />
  );

interface ProgressIndicatorProps {
  children: ReactNode;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ children }) => (
  <Stack
    direction="row"
    spacing={{ xs: 2, sm: 3 }}
    alignItems="center"
    justifyContent="center"
    sx={{ position: "relative" }}
  >
    {children}
  </Stack>
);

interface ResultsCardProps {
  children: ReactNode;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ children }) => (
  <Paper
    elevation={0}
    sx={(theme) => ({
      position: "relative",
      p: { xs: 4, md: 5 },
      borderRadius: 3,
      backdropFilter: "blur(36px)",
      border: `1px solid ${alpha(theme.palette.divider, 0.24)}`,
      backgroundColor: rgbaFromChannel(
        theme.vars.palette.background.paperChannel,
        theme.palette.mode === "dark" ? 0.55 : 0.72
      ),
      boxShadow: `0 46px 80px -60px ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.7)}`,
      "&::before": {
        content: '""',
        position: "absolute",
        inset: -32,
        borderRadius: 48,
        backgroundImage: `linear-gradient(120deg, ${rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.1)}, ${rgbaFromChannel(theme.vars.palette.secondary.mainChannel, 0.1)}, ${rgbaFromChannel(theme.vars.palette.info.mainChannel, 0.1)})`,
        opacity: 0,
        filter: "blur(48px)",
        transition: theme.transitions.create(["opacity", "filter"], { duration: 600 }),
        pointerEvents: "none",
      },
      "&:hover::before": {
        opacity: 1,
        filter: "blur(54px)",
      },
    })}
  >
    <Box
      sx={(theme) => {
        const baseRadiusRaw =
          typeof theme.shape.borderRadius === "number"
            ? theme.shape.borderRadius
            : Number.parseFloat(theme.shape.borderRadius);
        const baseRadius = Number.isFinite(baseRadiusRaw) ? baseRadiusRaw : 8;

        return {
          position: "relative",
          zIndex: 1,
          color: theme.palette.text.secondary,
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            color: theme.palette.text.primary,
            fontWeight: 700,
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(1.75),
          },
          "& p": {
            marginBottom: theme.spacing(2),
            lineHeight: 1.7,
          },
          "& strong": {
            color: theme.palette.text.primary,
            fontWeight: 600,
          },
          "& a": {
            color: theme.palette.primary.light,
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          },
          "& code": {
            fontFamily: `'Fira Code', 'Source Code Pro', monospace`,
            backgroundColor: rgbaFromChannel(theme.vars.palette.background.paperChannel, 0.5),
            borderRadius: baseRadius,
            padding: "0.08em 0.45em",
            fontSize: "0.92em",
          },
          "& pre": {
            backgroundColor: rgbaFromChannel(theme.vars.palette.background.paperChannel, 0.46),
            borderRadius: baseRadius * 1.4,
            padding: theme.spacing(2),
            overflowX: "auto",
          },
          "& ul, & ol": {
            paddingLeft: theme.spacing(3),
            marginBottom: theme.spacing(2),
          },
        };
      }}
    >
      {children}
    </Box>
  </Paper>
);

interface ErrorCardProps {
  icon?: ReactNode;
  children: ReactNode;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  icon = <Iconify icon="solar:danger-bold" width={20} />,
  children,
}) => (
  <Alert
    icon={icon}
    severity="error"
    sx={(theme) => ({
      borderRadius: 2.5,
      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
      backgroundColor: rgbaFromChannel(
        theme.vars.palette.background.paperChannel,
        theme.palette.mode === "dark" ? 0.42 : 0.62
      ),
      color: theme.palette.error.light,
      alignItems: "center",
      "& .MuiAlert-icon": {
        color: theme.palette.error.main,
      },
    })}
  >
    {children}
  </Alert>
);

interface ContentSectionProps {
  children: ReactNode;
}

export const ContentSection: React.FC<ContentSectionProps> = ({ children }) => <Stack spacing={3}>{children}</Stack>;
