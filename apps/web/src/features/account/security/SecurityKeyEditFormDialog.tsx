import { Iconify } from "@beep/ui/atoms";
import {
  Form,
  // useAppForm,
  // formOptionsWithSubmitEffect
} from "@beep/ui/form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  dialogClasses,
  IconButton,
  Stack,
  type SxProps,
  Typography,
} from "@mui/material";
import { useState } from "react";
// import PasswordTextField from 'components/common/PasswordTextField';
import type { ConnectedInDevice, LoggedInDevice } from "@/features/account/security/types";

interface SecurityKeyEditFormDialogProps {
  readonly open: boolean;
  readonly handleDialogClose: () => void;
  readonly device?: LoggedInDevice | ConnectedInDevice | undefined;
  readonly sx?: SxProps | undefined;
}
//
// interface SecurityKeyFormValues {
//   currentSecurityKey: string;
//   newSecurityKey: string;
//   confirmSecurityKey: string;
// }

// const securityKeySchema = yup.object().shape({
//   currentSecurityKey: yup.string().required('Current security key PIN is required'),
//   newSecurityKey: yup
//     .string()
//     .required('New security key PIN is required')
//     .min(4, 'Security key PIN must be at least 4 characters.'),
//   confirmSecurityKey: yup
//     .string()
//     .oneOf([yup.ref('newSecurityKey')], 'Security key PINs must match')
//     .required('Please confirm your security key PIN'),
// });

const SecurityKeyEditFormDialog = (props: SecurityKeyEditFormDialogProps) => {
  const { open, handleDialogClose, sx } = props;
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  // const methods = useForm<SecurityKeyFormValues>({
  //   resolver: yupResolver(securityKeySchema),
  // });
  // const { enqueueSnackbar } = useSnackbar();
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  // } = methods;

  // const onSubmit: SubmitHandler<SecurityKeyFormValues> = (data) => {
  //   console.log(data);
  //   handleDialogClose();
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };

  return (
    <Form>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        component="form"
        // onSubmit={handleSubmit(onSubmit)}
        sx={{
          [`& .${dialogClasses.paper}`]: {
            maxWidth: 463,
            overflow: "visible",
            ...sx,
          },
        }}
      >
        <DialogTitle
          component="h6"
          sx={{
            pt: 3,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Edit Security Key
          <IconButton onClick={handleDialogClose}>
            <Iconify icon="material-symbols:close" sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <DialogContentText component={Typography} variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Enter your security key PIN for this device to proceed securely. You also have the option to remove this
            connection.
          </DialogContentText>
          <Stack direction="column" spacing={1} pb={0.125}>
            {/*<PasswordTextField*/}
            {/*  placeholder="Current security key PIN"*/}
            {/*  label="Current security key PIN"*/}
            {/*  error={!!errors.currentSecurityKey}*/}
            {/*  helperText={errors.currentSecurityKey?.message}*/}
            {/*  {...register('currentSecurityKey')}*/}
            {/*/>*/}
            {/*<PasswordTextField*/}
            {/*  placeholder="New security key PIN"*/}
            {/*  label="New security key PIN"*/}
            {/*  error={!!errors.newSecurityKey}*/}
            {/*  helperText={errors.newSecurityKey?.message}*/}
            {/*  {...register('newSecurityKey')}*/}
            {/*/>*/}
            {/*<PasswordTextField*/}
            {/*  placeholder="Confirm security key PIN"*/}
            {/*  label="Confirm security key PIN"*/}
            {/*  error={!!errors.confirmSecurityKey}*/}
            {/*  helperText={errors.confirmSecurityKey?.message}*/}
            {/*  {...register('confirmSecurityKey')}*/}
            {/*/>*/}
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
          }}
        >
          <Button color="error" size="small" onClick={() => setConfirmDialogOpen(true)}>
            Remove
          </Button>
          <Button
            variant="soft"
            color="neutral"
            onClick={() => {
              handleDialogClose();
              // reset();
            }}
            sx={{ ml: "auto !important" }}
          >
            Discard
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {/* Nested Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        sx={{
          [`& .${dialogClasses.paper}`]: {
            maxWidth: 463,
            borderRadius: 6,
          },
        }}
      >
        <DialogTitle
          component="h6"
          sx={{
            pt: 3,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Are you sure?
          <IconButton onClick={() => setConfirmDialogOpen(false)}>
            <Iconify icon="material-symbols:close" sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <DialogContentText component={Typography} variant="body2" sx={{ color: "text.secondary" }}>
            You won’t be able to use this security key anymore. You can set up a new connection anytime.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
          }}
        >
          <Button variant="soft" color="neutral" onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => {
              // reset();
              setConfirmDialogOpen(false);
              handleDialogClose();
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
};

export default SecurityKeyEditFormDialog;
