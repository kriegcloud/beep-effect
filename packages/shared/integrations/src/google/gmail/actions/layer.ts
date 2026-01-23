import { Wrap } from "@beep/wrap";
import { BatchModify } from "./batch-modify";
import { CreateLabel } from "./create-label";
import { DeleteEmail } from "./delete-email";
import { DeleteLabel } from "./delete-label";
import { GetEmail } from "./get-email";
import { ListEmails } from "./list-emails";
import { ListLabels } from "./list-labels";
import { ModifyEmail } from "./modify-email";
import { SearchEmails } from "./search-emails";
import { TrashEmail } from "./trash-email";
import { UpdateLabel } from "./update-label";

export const Group = Wrap.WrapperGroup.make(
  BatchModify.Wrapper,
  CreateLabel.Wrapper,
  DeleteEmail.Wrapper,
  DeleteLabel.Wrapper,
  GetEmail.Wrapper,
  ListEmails.Wrapper,
  ListLabels.Wrapper,
  ModifyEmail.Wrapper,

  SearchEmails.Wrapper,

  TrashEmail.Wrapper,
  UpdateLabel.Wrapper
);

export const layer = Group.toLayer({
  BatchModify: BatchModify.Handler,
  CreateLabel: CreateLabel.Handler,
  DeleteEmail: DeleteEmail.Handler,
  DeleteLabel: DeleteLabel.Handler,
  ListEmails: ListEmails.Handler,
  ListLabels: ListLabels.Handler,
  ModifyEmail: ModifyEmail.Handler,
  SearchEmails: SearchEmails.Handler,
  UpdateLabel: UpdateLabel.Handler,
  GetEmail: GetEmail.Handler,
  TrashEmail: TrashEmail.Handler,
});
