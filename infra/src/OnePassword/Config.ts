import type { GeneratorRecipe } from "@1password/connect";
import { FullItem, OPConnect } from "@1password/connect";
import { FullItemAllOfFields } from "@1password/connect/dist/model/fullItemAllOfFields.js";
import type { ItemFile, ItemUrls } from "@1password/connect/dist/model/models.js";
import type { TUnsafe } from "@beep/types";
import * as pulumi from "@pulumi/pulumi";
import * as jsondiffpatch from "jsondiffpatch";
import * as jsonpatch from "jsondiffpatch/formatters/jsonpatch";

export const TypeEnum = FullItemAllOfFields.TypeEnum;
export type TypeEnum = FullItemAllOfFields.TypeEnum;
export const PurposeEnum = FullItemAllOfFields.PurposeEnum;
export type PurposeEnum = FullItemAllOfFields.PurposeEnum;
export const CategoryEnum = FullItem.CategoryEnum;
export type CategoryEnum = FullItem.CategoryEnum;

export interface OPClientItemFields {
  [key: string]: FullItemAllOfFields;
}

export interface OPClientItemFiles {
  [key: string]: ItemFile;
}

export interface OPClientItemSections {
  [key: string]: {
    fields: OPClientItemFields;
    files: OPClientItemFiles;
  };
}

export interface OPClientItem {
  category: FullItem.CategoryEnum;
  fields: OPClientItemFields;
  files: OPClientItemFiles;
  sections: OPClientItemSections;
  tags: string[];
  title: string;
  urls: ItemUrls[];
}

export interface OnePasswordItemFieldInput {
  entropy?: pulumi.Input<number>;
  generate?: pulumi.Input<boolean>;
  otp?: pulumi.Input<string>;
  purpose?: pulumi.Input<PurposeEnum>;
  recipe?: pulumi.Input<GeneratorRecipe>;
  type?: pulumi.Input<TypeEnum>;
  value?: pulumi.Input<string | undefined>;
}

export interface OnePasswordItemFileInput {
  content?: pulumi.Input<string>;
  content_path?: pulumi.Input<string>;
}

export interface OnePasswordItemSectionInput {
  fields?: pulumi.Input<Record<string, pulumi.Input<OnePasswordItemFieldInput>>>;
  files?: pulumi.Input<Record<string, pulumi.Input<OnePasswordItemFileInput>>>;
}

export interface OnePasswordItemInputs {
  category: pulumi.Input<CategoryEnum>;
  fields?: pulumi.Input<Record<string, pulumi.Input<OnePasswordItemFieldInput>>>;
  files?: pulumi.Input<Record<string, pulumi.Input<OnePasswordItemFileInput>>>;
  sections?: pulumi.Input<Record<string, pulumi.Input<OnePasswordItemSectionInput>>>;
  tags?: pulumi.Input<pulumi.Input<string>[]>;
  title: pulumi.Input<string>;
  urls?: pulumi.Input<ItemUrls[]>;
}

export interface OnePasswordItemFieldOutput {
  id: pulumi.Output<string>;
  otp: pulumi.Output<string>;
  purpose: pulumi.Output<PurposeEnum>;
  type: pulumi.Output<TypeEnum>;
  value: pulumi.Output<string>;
}

export interface OnePasswordItemFileOutput {
  content: pulumi.Output<string>;
  content_path: pulumi.Output<string>;
  id: pulumi.Output<string>;
  name: pulumi.Output<string>;
}

export interface OnePasswordItemSectionOutput {
  fields: pulumi.Output<Record<string, pulumi.Output<OnePasswordItemFieldOutput>>>;
  files: pulumi.Output<Record<string, pulumi.Output<OnePasswordItemFileOutput>>>;
  id: pulumi.Output<string>;
}

export interface OnePasswordItemOutputs {
  category: pulumi.Output<CategoryEnum>;
  fields: pulumi.Output<Record<string, pulumi.Output<OnePasswordItemFieldOutput>>>;
  files: pulumi.Output<Record<string, pulumi.Output<OnePasswordItemFileOutput>>>;
  sections: pulumi.Output<Record<string, pulumi.Output<OnePasswordItemSectionOutput>>>;
  tags: pulumi.Output<pulumi.Output<string>[]>;
  title: pulumi.Output<string>;
  urls: pulumi.Output<ItemUrls[]>;
}

export interface OnePasswordItemProviderOutputs {
  category: pulumi.Output<number>;
  fields: pulumi.Output<Record<string, OnePasswordItemFieldOutput>>;
  files: pulumi.Output<Record<string, OnePasswordItemFileOutput>>;
  id: string;
  sections: pulumi.Output<Record<string, OnePasswordItemSectionOutput>>;
  tags: pulumi.Output<string[]>;
  title: string;
  urls: pulumi.Output<ItemUrls[]>;
}

export interface OnePasswordItem extends OnePasswordItemOutputs {}

export interface OPClientItem {
  category: FullItem.CategoryEnum;
  fields: OPClientItemFields;
  files: OPClientItemFiles;
  sections: OPClientItemSections;
  tags: string[];
  title: string;
  urls: ItemUrls[];
}

export type OPClientItemInput = Pick<OPClientItem, "title" | "category"> &
  Partial<Omit<OPClientItem, "title" | "category">>;

export class OPClient {
  public client: OPConnect;

  /**
   *
   */
  constructor() {
    this.client = new OPConnect({
      serverURL: process.env.CONNECT_HOST!,
      token: process.env.CONNECT_TOKEN!,
      keepAlive: true,
    });
  }

  private async getVaultUuid(vaultName: string) {
    const vaults = await this.client.listVaults();
    const personalVault = vaults.find((v) => v.name === vaultName);
    if (!personalVault) {
      throw new Error("No vault found in 1Password Connect");
    }
    return personalVault.id!;
  }

  public async createItem(item: OPClientItemInput) {
    const vaultUuid = await this.getVaultUuid("Eris");
    return this.mapItem(
      await this.client.createItem(vaultUuid, {
        ...this.mapToFullItem(item),
        vault: { id: vaultUuid },
      } as TUnsafe.Any),
      undefined
    );
  }

  public async updateItem(id: string, item: OPClientItemInput) {
    const vaultUuid = await this.getVaultUuid("Eris");
    try {
      const result = await this.client.updateItem(vaultUuid, {
        id,
        ...this.mapToFullItem(item),
        vault: { id: vaultUuid },
      } as TUnsafe.Any);
      return this.mapItem(result, id);
    } catch (e) {
      console.error("Error updating item", e);
      throw e;
    }
  }

  public async deleteItem(id: string) {
    const vaultUuid = await this.getVaultUuid("Eris");
    return this.client.deleteItem(vaultUuid, id);
  }

  public async getItemById(itemId: string) {
    const vaultUuid = await this.getVaultUuid("Eris");
    return this.mapItem(await this.client.getItemById(vaultUuid, itemId), itemId);
  }

  public async getItemByTitle(itemTitle: string) {
    const vaultUuid = await this.getVaultUuid("Eris");
    try {
      return this.mapItem(await this.client.getItemByTitle(vaultUuid, itemTitle), undefined);
    } catch (e) {
      return this.mapItem(await this.client.getItemById(vaultUuid, itemTitle), undefined);
    }
  }

  public async listItemsByTitleContains(contains: string) {
    const vaultUuid = await this.getVaultUuid("Eris");
    const items = await this.client.listItemsByTitleContains(vaultUuid, contains);
    return items.map((item) => this.mapItem(item, item.id));
  }

  public mapToFullItem(
    item: OPClientItemInput & {
      id?: string;
    }
  ): Omit<FullItem, "vault" | "extractOTP"> {
    const sections = Object.entries(item.sections ?? {}).map(([key, s]) => ({
      id: key,
      label: key,
    }));
    const fields = Object.entries(item.fields ?? {}).map(([fieldKey, field]) => ({
      id: fieldKey,
      ...field,
      label: fieldKey,
    }));
    const sectionFields = Object.entries(item.sections ?? {}).flatMap(([sectionKey, section]) =>
      Object.entries(section.fields ?? {}).map(([fieldKey, field]) => ({
        id: `${sectionKey}-${fieldKey}`,
        ...field,
        section: { id: sectionKey },
        label: fieldKey,
      }))
    );

    const files = Object.entries(item.files ?? {}).map(([fileKey, file]) => ({
      id: fileKey,
      ...file,
      name: fileKey,
    }));

    const sectionFiles = Object.entries(item.sections ?? {}).flatMap(([sectionKey, section]) =>
      Object.entries(section.files ?? {}).map(([fileKey, file]) => ({
        id: `${sectionKey}-${fileKey}`,
        ...file,
        section: { id: sectionKey },
        name: fileKey,
      }))
    );

    // console.log("mapToFullItem", { input: { fields: item.fields, sections: item.sections }, output: result.fields });
    return {
      id: item.id!,
      title: item.title!,
      category: item.category!,
      urls: item.urls!,
      tags: item.tags!,
      sections,
      fields: [...sectionFields, ...fields],
      files: [...sectionFiles, ...files],
    };
  }

  public mapItem(
    item: Omit<FullItem, "vault" | "extractOTP">,
    id: string | undefined
  ): {
    id: string;
    title: string;
    category: FullItem.CategoryEnum;
    urls: ItemUrls[];
    tags: string[];
    sections: {
      [key: string]: {
        id: string;
        fields: {
          [key: string]: Omit<FullItemAllOfFields, "section" | "label">;
        };
        files: {
          [key: string]: Omit<ItemFile, "section" | "label">;
        };
      };
    };
    fields: {
      [key: string]: Omit<FullItemAllOfFields, "section" | "label">;
    };
    files: {
      [key: string]: Omit<ItemFile, "section" | "label">;
    };
  } {
    const fields = item.fields ?? [];
    const sections = item.sections ?? [];
    const files = item.files ?? [];
    const rootFields: [string, FullItemAllOfFields][] = [];
    const rootFiles: [string, ItemFile][] = [];
    for (const field of fields) {
      if (field.value === undefined || (field.section && field.section.id !== "add more")) continue;
      rootFields.push([field.label!, field] as const);
    }
    for (const file of files) {
      if (file.content === undefined || (file.section && file.section.id !== "add more")) continue;
      rootFiles.push([file.name!, file] as const);
    }
    const sectionParts: [
      string,
      {
        id: string;
        label: string;
        fields: {
          [key: string]: FullItemAllOfFields;
        };
        files: {
          [key: string]: ItemFile;
        };
      },
    ][] = [];
    for (const section of sections) {
      if (section.id === undefined || section.id === "add more") {
        continue;
      }
      const sectionFields = fields.filter((f) => f.section?.id === section.id).map((f) => [f.label!, f] as const);
      const sectionFiles = files.filter((f) => f.section?.id === section.id).map((f) => [f.name!, f] as const);
      sectionParts.push([
        section.id!,
        {
          id: section.id!,
          label: section.label ?? section.id!,
          fields: Object.fromEntries(sectionFields),
          files: Object.fromEntries(sectionFiles),
        },
      ] as const);
    }

    return {
      id: item.id ?? id!,
      title: item.title!,
      category: item.category!,
      urls: item.urls ?? [],
      tags: item.tags ?? [],
      sections: Object.fromEntries(sectionParts),
      fields: Object.fromEntries(rootFields),
      files: Object.fromEntries(rootFiles),
    };
  }
}

export interface OnePasswordItemProviderOutputs {
  category: pulumi.Output<number>;
  fields: pulumi.Output<Record<string, OnePasswordItemFieldOutput>>;
  files: pulumi.Output<Record<string, OnePasswordItemFileOutput>>;
  id: string;
  sections: pulumi.Output<Record<string, OnePasswordItemSectionOutput>>;
  tags: pulumi.Output<string[]>;
  title: string;
  urls: pulumi.Output<ItemUrls[]>;
}

class OnePasswordItemProvider implements pulumi.dynamic.ResourceProvider {
  async create(inputs: OPClientItemInput) {
    const client = new OPClient();

    const item = await this.retry(() => client.createItem(inputs));

    return {
      // biome-ignore lint/suspicious/noNonNullAssertedOptionalChain: lazy rn
      id: item?.id!,
      outs: {
        ...item,
        // biome-ignore lint/suspicious/noNonNullAssertedOptionalChain: lazy rn.
        id: item?.id!,
      },
    };
  }

  async update(id: string, inputs: OPClientItemInput) {
    const client = new OPClient();

    const item = await this.retry(() => client.updateItem(id, inputs));
    return {
      outs: {
        ...item,
        id,
      },
    };
  }

  async retry<T>(action: () => Promise<NonNullable<T>>) {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await action();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
      }
    }
    return Promise.reject(new Error("Max retries reached"));
  }

  async delete(id: string) {
    const client = new OPClient();
    await client.deleteItem(id);
  }

  async read(id: string, props: OPClientItemInput) {
    const client = new OPClient();
    const item = await client.getItemById(id);
    return {
      id,
      props: {
        ...props,
        ...item,
        id,
      },
    };
  }

  async diff(id: string, oldOutputs: pulumi.Unwrap<OnePasswordItemProviderOutputs>, newInputs: OPClientItemInput) {
    const client = new OPClient();
    const replaces: string[] = [];
    const allowedProperties = ["title", "category", "urls", "tags", "sections", "fields", "files"];

    const differ = jsondiffpatch.create({
      propertyFilter(name, context) {
        if (name === "__provider") return false;
        return !(context.childName === undefined && !allowedProperties.some((p) => p === name));
      },
    });

    const fullNewInputs = client.mapItem(client.mapToFullItem(newInputs), id);

    const compareOlds = Object.fromEntries(
      Object.keys(fullNewInputs)
        .filter((z) => !z.startsWith("_"))
        .map((key) => [key, (oldOutputs as TUnsafe.Any)[key]] as const)
    );
    const compareNews = Object.fromEntries(
      Object.keys(fullNewInputs)
        .filter((z) => !z.startsWith("_"))
        .map((key) => [key, (fullNewInputs as TUnsafe.Any)[key]] as const)
    );
    const delta = differ.diff(compareOlds, compareNews);
    const patch = jsonpatch
      .format(delta)
      .filter((z) => z.op !== "move")
      .filter((change) => {
        if (change.op === "remove" && (change.path.endsWith("/id") || change.path.endsWith("/section"))) return false;
        if (change.path.startsWith("/fields") && change.path.endsWith("/id")) return false;
        return !change.path.endsWith("/label");
      });

    // if (patch.length > 0) {
    //   pulumi.log.info(`OnePasswordItem diff for item ${id}: ${JSON.stringify({ old: compareOlds, new: compareNews, patch }, null, 2)}`);
    // }

    for (const change of patch) {
      replaces.push(change.path.substring(1));
    }
    if (patch.length === 0) {
      void pulumi.log.info(`OnePasswordItem no changes detected for item ${id}`);
      return {};
    }

    void pulumi.log.info(`OnePasswordItem changes detected for item ${id}: ${JSON.stringify(patch, null, 2)}`);
    return {
      replaces: replaces,
      changes: patch.length > 0,
      stables: [],
      deleteBeforeReplace: true,
    };
  }
}

export interface OnePasswordItem extends OnePasswordItemOutputs {}

export class OnePasswordItem extends pulumi.dynamic.Resource implements OnePasswordItemOutputs {
  constructor(name: string, props: OnePasswordItemInputs, opts?: pulumi.CustomResourceOptions) {
    super(new OnePasswordItemProvider(), name, props, {
      deleteBeforeReplace: true,
      replaceOnChanges: ["*"],
      ...opts,
    });
  }
}
