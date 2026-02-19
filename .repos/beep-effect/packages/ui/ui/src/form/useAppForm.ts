"use client";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import React from "react";

const Submit = React.lazy(() => import("@beep/ui/form/SubmitButton"));
const FormDialog = React.lazy(() => import("@beep/ui/form/FormDialog"));
const Autocomplete = React.lazy(() => import("@beep/ui/inputs/AutocompleteField"));
const Checkbox = React.lazy(() => import("@beep/ui/inputs/CheckboxField"));
const Country = React.lazy(() => import("@beep/ui/inputs/CountryField"));
const MultiCheckbox = React.lazy(() => import("@beep/ui/inputs/MultiCheckboxField"));
const MultiSelect = React.lazy(() => import("@beep/ui/inputs/MultiSelectField"));
const MultiSwitch = React.lazy(() => import("@beep/ui/inputs/MultiSwitchField"));
const Radio = React.lazy(() => import("@beep/ui/inputs/RadioField"));
const RadioGroup = React.lazy(() => import("@beep/ui/inputs/RadioGroupField"));
const Rating = React.lazy(() => import("@beep/ui/inputs/RatingField"));
const Select = React.lazy(() => import("@beep/ui/inputs/SelectField"));
const Switch = React.lazy(() => import("@beep/ui/inputs/SwitchField"));
const Text = React.lazy(() => import("@beep/ui/inputs/TextField"));
const Slider = React.lazy(() => import("@beep/ui/inputs/SliderField"));
const DatePicker = React.lazy(() => import("@beep/ui/inputs/DatePickerField"));
const OTP = React.lazy(() => import("@beep/ui/inputs/OTPField"));
const DateTimePicker = React.lazy(() => import("@beep/ui/inputs/DateTimePickerField"));
const Phone = React.lazy(() => import("@beep/ui/inputs/PhoneField"));
const UploadAvatar = React.lazy(() => import("@beep/ui/inputs/UploadAvatarField"));
const Upload = React.lazy(() => import("@beep/ui/inputs/UploadField"));
const UploadBox = React.lazy(() => import("@beep/ui/inputs/UploadBoxField"));
const Color = React.lazy(() => import("@beep/ui/inputs/ColorField"));
const Emoji = React.lazy(() => import("@beep/ui/inputs/EmojiField"));
export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    UploadAvatar,
    Upload,
    UploadBox,
    DatePicker,
    Phone,
    OTP,
    DateTimePicker,
    Autocomplete,
    Checkbox,
    RadioGroup,
    Color,
    Country,
    MultiCheckbox,
    MultiSelect,
    MultiSwitch,
    Slider,
    Radio,
    Rating,
    Select,
    Switch,
    Text,
    Emoji,
  },
  formComponents: {
    Submit,
    FormDialog,
  },
  fieldContext,
  formContext,
});
