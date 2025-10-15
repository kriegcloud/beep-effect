"use client";
import { Iconify } from "@beep/ui/atoms/iconify/iconify";
import { Form } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";

import * as A from "effect/Array";
import * as F from "effect/Function";
import React from "react";
import { criteriaQuery, passwordQuery, session } from "@/app/_rules";

export function View() {
  const theme = useTheme();
  const showPassword = useBoolean();
  const [, setIsValid] = React.useState<boolean>(false);
  const [criteria, setCriteria] = React.useState<Array<{ id: string; meetsCriteria: boolean }>>([]);

  React.useEffect(() => {
    passwordQuery.subscribeOne((password) => setIsValid(password?.Password.valid ?? false));
    criteriaQuery.subscribe((result) =>
      F.pipe(
        result,
        A.map(({ $criteria: { id, meetsCriteria } }) => ({
          id,
          meetsCriteria,
        })),
        setCriteria
      )
    );
  }, [passwordQuery.subscribeOne, criteriaQuery.subscribe, setCriteria, setIsValid]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Form>
        <Stack spacing={2}>
          <TextField
            autoComplete={"new password"}
            label={" Enter your password"}
            type={showPassword.value ? "text" : "password"}
            onChange={(e) =>
              session.insert({
                Password: {
                  password: e.target.value,
                },
              })
            }
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end">
                      <Iconify icon={showPassword.value ? "solar:eye-bold" : "solar:eye-closed-bold"} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <List sx={{ p: 0 }}>
            {A.map(criteria, (c, index) => {
              return (
                <ListItem key={index} sx={{ p: 0, paddingLeft: 1 }}>
                  <ListItemIcon sx={{ minWidth: 24, "& svg": { width: 18 } }}>
                    {c.meetsCriteria ? (
                      <Iconify icon={"eva:checkmark-fill"} fill={theme.palette.success.main} />
                    ) : (
                      <Iconify icon={"material-symbols:close"} fill={theme.palette.error.main} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    sx={(theme) => ({
                      color: c.meetsCriteria ? theme.palette.success.main : theme.palette.error.main,
                    })}
                  >
                    {c.id} is met?
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
        </Stack>
      </Form>
    </Box>
  );
}
