import { Type } from "@sinclair/typebox";
import { convertJsonSchemaToCustomSchema } from "../convertJsonSchematoFoundrySchema";

const EXAMPLE_DEFINITION = {
  isFirstName: {
    input: Type.Object({
      firstName: Type.String(),
    }),
    output: Type.Boolean(),
  },
};

const CHAT_DEFINITION = {
  chat: {
    input: Type.Object({
      messages: Type.Array(
        Type.Object({
          role: Type.String(),
          content: Type.String(),
        })
      ),
      temperature: Type.Number(),
      max_tokens: Type.Number(),
      optionalField: Type.Optional(Type.String())
    }),
    output: Type.Object({
      messages: Type.Array(Type.String()),
    }),
  },
};

describe("Type tests", () => {
  it("should have the same types as a simple definition", () => {
    const schema = convertJsonSchemaToCustomSchema(
      "isFirstName",
      EXAMPLE_DEFINITION.isFirstName.input,
      EXAMPLE_DEFINITION.isFirstName.output
    );
    expect(schema).toStrictEqual({
      functionName: "isFirstName",
      inputs: [
        {
          name: "firstName",
          required: true,
          dataType: {
            type: "string",
            string: {},
          },
          constraints: [],
        },
      ],
      output: {
        type: "single",
        single: {
          dataType: {
            type: "boolean",
            boolean: {},
          },
        },
      },
    });
  });

  it("should have the same types as a chat definition", () => {
    const schema = convertJsonSchemaToCustomSchema(
      "chat",
      CHAT_DEFINITION.chat.input,
      CHAT_DEFINITION.chat.output
    );
    expect(schema).toStrictEqual({
      functionName: "chat",
      inputs: [
        {
          name: "messages",
          required: true,
          dataType: {
            type: "list",
            list: {
              elementsType: {
                type: "anonymousCustomType",
                anonymousCustomType: {
                  fields: {
                    role: {
                      type: "string",
                      string: {},
                    },
                    content: {
                      type: "string",
                      string: {},
                    },
                  },
                },
              },
            },
          },
          constraints: [],
        },
        {
          name: "temperature",
          required: true,
          dataType: {
            type: "float",
            float: {},
          },
          constraints: [],
        },
        {
          name: "max_tokens",
          required: true,
          dataType: {
            type: "float",
            float: {},
          },
          constraints: [],
        },
        {
          name: "optionalField",
          required: false,
          dataType: {
            type: "optionalType",
            optionalType: {
              wrappedType: {
                type: "string",
                string: {}
              }
            }
          },
          constraints: [],
        }
      ],
      output: {
        type: "single",
        single: {
          dataType: {
            type: "anonymousCustomType",
            anonymousCustomType: {
              fields: {
                messages: {
                  type: "list",
                  list: {
                    elementsType: {
                      type: "string",
                      string: {},
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });
});
