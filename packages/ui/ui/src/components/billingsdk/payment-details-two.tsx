"use client";

import { Button } from "@beep/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@beep/ui/components/card";
import { Input } from "@beep/ui/components/input";
import { Label } from "@beep/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/ui/components/select";
import { Textarea } from "@beep/ui/components/textarea";
import { detectCardType, formatCardNumber, formatExpiryDate, validateLuhn } from "@beep/ui/lib/card-validation";
import { cn } from "@beep/ui-core/utils";
import {
  CheckIcon as Check,
  CaretLeftIcon as ChevronLeft,
  CaretRightIcon as ChevronRight,
  CreditCardIcon as CreditCard,
  ShieldIcon as Shield,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { City, Country, State } from "country-state-city";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export interface PaymentFormData {
  nameOnCard?: string;
  cardNumber?: string;
  validTill?: string;
  cvv?: string;
  firstName?: string;
  middleLastName?: string;
  country?: string;
  state?: string;
  city?: string;
  billingAddress?: string;
  pinCode?: string;
  contactNumber?: string;
  general?: string;
}

interface PaymentDetailsTwoProps {
  className?: string;
  onSubmit?: (data: PaymentFormData) => Promise<void> | void;
  onDiscard?: () => void;
  countries?: { name: string; isoCode: string }[];
  states?: { name: string; isoCode: string }[];
  cities?: { name: string }[];
}

const cardDefaultValues: PaymentFormData = {
  nameOnCard: "",
  cardNumber: "",
  validTill: "",
  cvv: "",
  firstName: "",
  middleLastName: "",
  country: "",
  state: "",
  city: "",
  billingAddress: "",
  pinCode: "",
  contactNumber: "",
};

const CardLogo = ({ type }: { type: string }) => {
  switch (type) {
    case "visa":
      return (
        <div className="flex h-5 w-10 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
          VISA
        </div>
      );
    case "mastercard":
      return (
        <div className="flex items-center">
          <div className="h-5 w-5 rounded-full bg-red-500" />
          <div className="-ml-2 h-5 w-5 rounded-full bg-orange-400" />
        </div>
      );
    case "amex":
      return (
        <div className="flex h-6 w-10 items-center justify-center rounded bg-blue-500 text-xs font-bold text-white">
          AMEX
        </div>
      );
    case "rupay":
      return (
        <div className="flex h-5 w-10 items-center justify-center rounded bg-green-600 text-xs font-bold text-white">
          RuPay
        </div>
      );
    case "discover":
      return (
        <div className="flex h-6 w-10 items-center justify-center rounded bg-orange-600 text-xs font-bold text-white">
          DISC
        </div>
      );
    default:
      return <CreditCard className="text-muted-foreground h-5 w-5" />;
  }
};

export function PaymentDetailsTwo({
  className,
  onSubmit,
  onDiscard,
  countries,
  states,
  cities,
}: PaymentDetailsTwoProps) {
  const [step, setStep] = useState(1);
  const [cardType, setCardType] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  const [defaultCountries, setDefaultCountries] = useState<{ name: string; isoCode: string }[]>([]);
  const [defaultStates, setDefaultStates] = useState<{ name: string; isoCode: string }[]>([]);
  const [defaultCities, setDefaultCities] = useState<{ name: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const form = useForm<PaymentFormData>({
    defaultValues: cardDefaultValues,
    onSubmit: async ({ value }) => {
      if (!onSubmit) {
        return;
      }

      await onSubmit(value);
      setIsSaved(true);
    },
  });

  const values = form.state.values;
  const isSubmitting = form.state.isSubmitting;

  useEffect(() => {
    if (countries && countries.length > 0) {
      setDefaultCountries(countries);
    } else {
      setDefaultCountries(Country.getAllCountries());
    }
  }, [countries]);

  useEffect(() => {
    if (states && states.length > 0) {
      setDefaultStates(states);
    } else {
      setDefaultStates(State.getStatesOfCountry(selectedCountry));
    }
  }, [selectedCountry, states]);

  useEffect(() => {
    if (cities && cities.length > 0) {
      setDefaultCities(cities);
    } else {
      setDefaultCities(City.getCitiesOfState(selectedCountry, selectedState));
    }
  }, [selectedCountry, selectedState, cities]);

  const clearError = (field: keyof PaymentFormData) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return { ...prev, [field]: undefined };
    });
  };

  const setFieldValue = <K extends keyof PaymentFormData>(field: K, value: string) => {
    form.setFieldValue(field, value);
    clearError(field);
  };

  const validateStepOne = () => {
    const nextErrors: Partial<Record<keyof PaymentFormData, string>> = {};
    const cardNumber = values.cardNumber ?? "";
    const expiry = values.validTill ?? "";
    const cvv = values.cvv ?? "";

    if (!(values.nameOnCard ?? "").trim()) {
      nextErrors.nameOnCard = "Name is required";
    }

    if (!cardNumber || validateLuhn(cardNumber) !== true) {
      nextErrors.cardNumber = "Card number is invalid";
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      nextErrors.validTill = "Valid expiry date is required (MM/YY)";
    } else {
      const [mm, yy] = expiry.split("/").map(Number);
      const now = new Date();
      const expiryDate = new Date(2000 + yy, mm - 1, 1);
      if (mm < 1 || mm > 12) {
        nextErrors.validTill = "Invalid month";
      } else if (expiryDate < now) {
        nextErrors.validTill = "Card expired";
      }
    }

    const expectedCvvLength = cardType === "amex" ? 4 : 3;
    if (cvv.length !== expectedCvvLength) {
      nextErrors.cvv = `CVV must be ${expectedCvvLength} digits`;
    }

    return nextErrors;
  };

  const validateStepTwo = () => {
    const nextErrors: Partial<Record<keyof PaymentFormData, string>> = {};

    if (!(values.firstName ?? "").trim()) {
      nextErrors.firstName = "Required";
    }

    if (!(values.middleLastName ?? "").trim()) {
      nextErrors.middleLastName = "Required";
    }

    if (!(values.billingAddress ?? "").trim()) {
      nextErrors.billingAddress = "Required";
    }

    if (!/^[0-9]{6}$/.test(values.pinCode ?? "")) {
      nextErrors.pinCode = "Invalid pincode";
    }

    if (!/^[0-9]{10}$/.test(values.contactNumber ?? "")) {
      nextErrors.contactNumber = "Invalid number";
    }

    return nextErrors;
  };

  const handleDiscardClick = () => {
    if (onDiscard) {
      onDiscard();
      return;
    }

    form.reset();
    setStep(1);
    setCardType("");
    setIsSaved(false);
    setErrors({});
  };

  const formatAndSetCard = (value: string) => {
    const formatted = formatCardNumber(value.replace(/\s+/g, ""));
    setFieldValue("cardNumber", formatted);
    setCardType(detectCardType(formatted));
  };

  const handleNext = () => {
    const nextErrors = validateStepOne();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStep(2);
  };

  const handleFormSubmit = async () => {
    const nextErrors = {
      ...validateStepOne(),
      ...validateStepTwo(),
    };

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    try {
      await form.handleSubmit();
    } catch {
      setErrors((prev) => ({
        ...prev,
        general: "Failed to save payment details. Please try again.",
      }));
    }
  };

  return (
    <Card className={cn("mx-auto w-full max-w-2xl pb-0", className)}>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription className="mt-1.5">
            {step === 1 ? "Enter your card information" : "Enter your billing address"}
          </CardDescription>
          {errors.general && <p className="text-destructive mt-2 text-sm">{errors.general}</p>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
              )}
            >
              1
            </div>
            <div className="bg-border h-1 flex-1 rounded-full">
              <div
                className={cn(
                  "bg-primary h-full rounded-full transition-all duration-300",
                  step === 2 ? "w-full" : "w-0"
                )}
              />
            </div>
          </div>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
              step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            2
          </div>
        </div>
      </CardHeader>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleFormSubmit();
        }}
      >
        <CardContent className="min-h-[420px] py-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="nameOnCard">Name on card</Label>
                  <Input
                    id="nameOnCard"
                    placeholder="John Doe"
                    value={values.nameOnCard ?? ""}
                    onChange={(event) => setFieldValue("nameOnCard", event.target.value)}
                  />
                  {errors.nameOnCard && <p className="text-destructive text-sm">{errors.nameOnCard}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card number</Label>
                  <div className="relative">
                    <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
                      <CardLogo type={cardType} />
                    </div>
                    <Input
                      id="cardNumber"
                      className="pl-14 font-mono tracking-wide"
                      placeholder="1234 5678 9012 3456"
                      maxLength={20}
                      inputMode="numeric"
                      pattern="[0-9 ]*"
                      value={values.cardNumber ?? ""}
                      onChange={(event) => formatAndSetCard(event.target.value)}
                    />
                  </div>
                  {errors.cardNumber && <p className="text-destructive text-sm">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validTill">Expiry date</Label>
                    <Input
                      id="validTill"
                      className="font-mono"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={values.validTill ?? ""}
                      onChange={(event) => setFieldValue("validTill", formatExpiryDate(event.target.value))}
                    />
                    {errors.validTill && <p className="text-destructive text-sm">{errors.validTill}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Shield className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                      <Input
                        id="cvv"
                        type="password"
                        className="pl-10 font-mono"
                        placeholder="123"
                        maxLength={4}
                        inputMode="numeric"
                        pattern="[0-9 ]*"
                        value={values.cvv ?? ""}
                        onChange={(event) => {
                          const numericValue = event.target.value.replace(/\D/g, "");
                          const maxLength = cardType === "amex" ? 4 : 3;
                          setFieldValue("cvv", numericValue.slice(0, maxLength));
                        }}
                      />
                    </div>
                    {errors.cvv && <p className="text-destructive text-sm">{errors.cvv}</p>}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={values.firstName ?? ""}
                      onChange={(event) => setFieldValue("firstName", event.target.value)}
                    />
                    {errors.firstName && <p className="text-destructive text-sm">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleLastName">Last name</Label>
                    <Input
                      id="middleLastName"
                      placeholder="Doe"
                      value={values.middleLastName ?? ""}
                      onChange={(event) => setFieldValue("middleLastName", event.target.value)}
                    />
                    {errors.middleLastName && <p className="text-destructive text-sm">{errors.middleLastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={values.country ?? ""}
                      onValueChange={(value) => {
                        setFieldValue("country", value);
                        setFieldValue("state", "");
                        setFieldValue("city", "");
                        setSelectedCountry(value);
                        setSelectedState("");
                      }}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultCountries.map((country) => (
                          <SelectItem key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={values.state ?? ""}
                      onValueChange={(value) => {
                        setFieldValue("state", value);
                        setFieldValue("city", "");
                        setSelectedState(value);
                      }}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultStates.length > 0 ? (
                          defaultStates.map((state) => (
                            <SelectItem key={state.isoCode} value={state.isoCode}>
                              {state.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no-state-found">
                            No state found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select value={values.city ?? ""} onValueChange={(value) => setFieldValue("city", value)}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultCities.length > 0 ? (
                          defaultCities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no-city-found">
                            No city found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Textarea
                    id="billingAddress"
                    placeholder="Enter Billing Address"
                    value={values.billingAddress ?? ""}
                    onChange={(event) => setFieldValue("billingAddress", event.target.value)}
                  />
                  {errors.billingAddress && <p className="text-destructive text-sm">{errors.billingAddress}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pinCode">Pincode</Label>
                    <Input
                      id="pinCode"
                      placeholder="110024"
                      value={values.pinCode ?? ""}
                      onChange={(event) => {
                        const numericValue = event.target.value.replace(/\D/g, "").slice(0, 6);
                        setFieldValue("pinCode", numericValue);
                      }}
                    />
                    {errors.pinCode && <p className="text-destructive text-sm">{errors.pinCode}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Mobile</Label>
                    <Input
                      id="contactNumber"
                      placeholder="9991023558"
                      value={values.contactNumber ?? ""}
                      onChange={(event) => {
                        const numericValue = event.target.value.replace(/\D/g, "").slice(0, 10);
                        setFieldValue("contactNumber", numericValue);
                      }}
                    />
                    {errors.contactNumber && <p className="text-destructive text-sm">{errors.contactNumber}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="bg-muted/30 flex justify-between border-t py-6">
          {step === 1 ? (
            <>
              <Button type="button" variant="ghost" onClick={handleDiscardClick}>
                Cancel
              </Button>
              <Button type="button" onClick={handleNext} className="min-w-[100px]">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting || isSaved} className="min-w-[120px]">
                <AnimatePresence mode="wait" initial={false}>
                  {isSubmitting ? (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      <span>Saving...</span>
                    </motion.div>
                  ) : isSaved ? (
                    <motion.div
                      key="saved"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>Saved</span>
                    </motion.div>
                  ) : (
                    <motion.span key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Save Changes
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
