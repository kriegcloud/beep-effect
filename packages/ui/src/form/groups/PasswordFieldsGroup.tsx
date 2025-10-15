"use client";
import { Iconify } from "@beep/ui/atoms/iconify/iconify";
import { useBoolean } from "@beep/ui/hooks/use-boolean";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import * as A from "effect/Array";
import * as F from "effect/Function";
import React from "react";
import { withFieldGroup } from "../useAppForm";

type PasswordFields = {
  password: string;
  passwordConfirm: string;
};

const defaultValues: PasswordFields = {
  password: "",
  passwordConfirm: "",
};

type CheckPasswordOptions = {
  minLength?: number;
  allowedSpecialChar?: string;
};

type PasswordsComplexityPass = {
  pass: boolean;
  message: string;
  key?: string;
};

type ComplexityKeys = "minLength" | "lowerCase" | "upperCase" | "number";

type DefaultErrorOption = Record<ComplexityKeys, PasswordsComplexityPass>;

type ErrorOption = DefaultErrorOption & Record<"specialCharacters", PasswordsComplexityPass>;

type Check = {
  pass: boolean;
  key: keyof ErrorOption;
};

type PasswordCheckListResult = {
  validationMessages: PasswordsComplexityPass[];
  allChecksPassed: boolean;
};

type ValidationMessages = {
  minLength: string;
  lowerCase: string;
  upperCase: string;
  number: string;
  specialCharacters: string;
};

export type PasswordChecklistProps = {
  /**
   * class name for the input field
   */
  className?: string;
  /**
   * custom options for password validation
   */
  options?: CheckPasswordOptions;
  /**
   * custom validation messages for each password validation
   */
  validationMessages?: ValidationMessages;
};

export const validatePasswordChecklist = (
  password: string,
  messages?: ValidationMessages,
  options?: CheckPasswordOptions
): PasswordCheckListResult => {
  // -------------- default options -------------- //
  const passwordMinLength = options?.minLength || 8;
  const allowedSpecialChar = options?.allowedSpecialChar || "!@#$%^&*(),.?\":{}|<>\\[\\]\\\\/`~;'_+=-";

  // ----------- default error messages ---------- //
  const {
    minLength = `Must be at least ${passwordMinLength} characters`,
    lowerCase = "Must contain at least one lowercase letter",
    upperCase = "Must contain at least one uppercase letter",
    number = "Must contain at least one number",
    specialCharacters = "Must contain at least one special character",
  } = messages || {};

  if (!password) return { allChecksPassed: false, validationMessages: [] };

  /**
   * all criteria checks
   */
  const checks: Check[] = [
    // password length
    {
      pass: password.length >= passwordMinLength,
      key: "minLength",
    },
    // password has lowercase
    {
      pass: /[a-z]/.test(password),
      key: "lowerCase",
    },
    // password has uppercase
    {
      pass: /[A-Z]/.test(password),
      key: "upperCase",
    },
    // password has number
    {
      pass: /\d/.test(password),
      key: "number",
    },
  ];

  const validationMessages: DefaultErrorOption = {
    minLength: { pass: false, message: minLength },
    lowerCase: { pass: false, message: lowerCase },
    upperCase: { pass: false, message: upperCase },
    number: { pass: false, message: number },
  };

  // password has special character
  if (allowedSpecialChar) {
    checks.push({
      pass: new RegExp(`[${allowedSpecialChar}]`).test(password),
      key: "specialCharacters",
    });

    (validationMessages as ErrorOption).specialCharacters = {
      pass: false,
      message: specialCharacters,
    };
  }

  let allChecksPassed = false;

  checks.forEach((check: Check) => {
    if ((validationMessages as ErrorOption)[check.key]) {
      // check if the password passes the criteria
      if (check.pass) {
        (validationMessages as ErrorOption)[check.key] = {
          ...(validationMessages as ErrorOption)[check.key],
          pass: true,
          key: check.key,
        };
        allChecksPassed = true;
      } else {
        (validationMessages as ErrorOption)[check.key] = {
          ...(validationMessages as ErrorOption)[check.key],
          key: check.key,
        };
        allChecksPassed = false;
      }
    }
  });

  return {
    validationMessages: Object.values(validationMessages),
    allChecksPassed,
  };
};

export const PasswordFieldsGroup = withFieldGroup({
  defaultValues,
  render: function Render({ group }) {
    const [rules, setRules] = React.useState<PasswordCheckListResult["validationMessages"]>([]);
    const showPassword = useBoolean();
    const showPasswordConfirm = useBoolean();

    const theme = useTheme();
    return (
      <Stack spacing={2}>
        <group.AppField
          name={"password"}
          validators={{
            onChange: ({ value }) => F.pipe(validatePasswordChecklist(value).validationMessages || [], setRules),
          }}
          children={(field) => (
            <field.Text
              label={"Password"}
              type={showPassword.value ? "text" : "password"}
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
          )}
        />
        <List sx={{ p: 0 }}>
          {A.map(rules, (error, index) => (
            <ListItem key={index} sx={{ p: 0, paddingLeft: 1 }}>
              <ListItemIcon sx={{ minWidth: 24, "& svg": { width: 18 } }}>
                {error.pass ? (
                  <Iconify icon={"eva:checkmark-fill"} fill={theme.palette.success.main} />
                ) : (
                  <Iconify icon={"material-symbols:close"} fill={theme.palette.error.main} />
                )}
              </ListItemIcon>
              <ListItemText
                sx={{
                  color: (theme) => (error.pass ? theme.palette.success.main : theme.palette.error.main),
                }}
              >
                {error.message}
              </ListItemText>
            </ListItem>
          ))}
        </List>
        <group.AppField
          name={"passwordConfirm"}
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue("password")) {
                return "Passwords do not match";
              }
              return undefined;
            },
          }}
          children={(field) => (
            <field.Text
              label={"Confirm Password"}
              type={showPasswordConfirm.value ? "text" : "password"}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={showPasswordConfirm.onToggle} edge="end">
                        <Iconify icon={showPasswordConfirm.value ? "solar:eye-bold" : "solar:eye-closed-bold"} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Stack>
    );
  },
});
