# Process for adding better-auth client plugin and core execution boundaries

Right now I am in the process of implementing adapters for all the better-auth <add context7 mcp tool call reference> 
methods and plugin <add context7 mcp tool call reference> methods which contain execution boundaries. An execution 
boundary is a method that the betterAuthClient <add context7 mcp tool call reference> exposes which uses async await 
to interact with the better-auth api. The goal is to wrap each of these methods for the extensive list of plugins and 
core methods we have enabled in our better-auth configuration. See the following areas of concern for:
- [Core Better Auth configuration options](packages/iam/infra/src/adapters/better-auth/Auth.service.ts)
- [Plugin configuration options](packages/iam/infra/src/adapters/better-auth/plugins/plugins.ts)
- [Client configuration options](packages/iam/sdk/src/adapters/better-auth/client.ts)

I have created three main constructs for creating better-auth method adapters in `packages/iam/sdk/src/contract-kit/*`. 
The first is [Contract](packages/iam/sdk/src/contract-kit/Contract.ts) for defining the shape of:
- Input parameters
- Output response
- Errors

The second is [ContractSet](packages/iam/sdk/src/contract-kit/ContractSet.ts) for grouping Adapter Contract's together 
and declaratively defining the Implementations which need to be provided.

The third is [failure-continuation](packages/iam/sdk/src/contract-kit/failure-continuation.ts) for raising errors returned from
better-auth client method `fetchOptions.onError` onError callback into effect failures mapping them to the
[IamError](packages/iam/sdk/src/errors.tspackages/iam/sdk/src/errors.ts) error class.

Examples of how these are used can be found in the following places: 
- [signInEmail](packages/iam/sdk/src/clients/sign-in/sign-in.contracts.ts)
- [signInSocial](packages/iam/sdk/src/clients/sign-in/sign-in.contracts.ts)

The process for defining a better-auth adapter using these contracts is the following:
- use the context7 mcp tool to fetch documentation regarding the better-auth client method you are trying to implement
  - Determine the request payload parameters and create an effect/Schema using the `BS.Class` schema from `@beep/schema`
    - if the method has no payload make the contracts parameters property `{}` 
  - Determine the response payload parameters and create an effect/Schema using the `BS.Class` schema from `@beep/schema`
    - if the response payload is void the use `S.Void`.
  - Set the `failures` parameter of the `Contract` to be `S.instanceOf(IamError)`
  - Ensure the `Contract` is exported from the adjacent `index.ts` file in the same directory as the implementation file.
  - after creating the `Contract` ensure that the format and layout of the code conforms with existing contracts in the `@beep/iam-sdk/clients` directory
  - ensure that a corresponding `namespace` is declared for the `Payload` and `Success` schemas if they where created exporting a `Type` and `Encoded` type from that declared namespace.
    - the namespace should be named the same as the schema its for so that the `Type` can be accessed like so `SignInPayload.Type` / `SignInPayload.Encoded`
  - Run `bun run build --filter=@beep/iam-sdk` and fix all type errors until it passes
  - Add the contract to that directories `ContractSet` at the bottom of the `.contracts.ts` file. If the `ContractSet` for the client method does not exist create it.
  - Open the adjacent `.implementations.ts` file and create an implementation `Effect` using the `Effect.fn` method.
  - If the corresponding contract for the `Handler` implementation has a payload specify the payload as a parameter to the handler `Effect.fn("BetterAuthMethodHandler")(function* (payload: BetterAuthMethodPayload.Type) {})`
  - construct the `continuation` using the `makeFailureContinuation` specifying the contract and `metadata` properties
    ```ts
    const BetterAuthMethodHandler = Effect.fn("BetterAuthMethodHandler")(function* (payload: BetterAuthMethodPayload.Type) {
     const continuation = makeFailureContinuation({
      contract: "BetterAuthMethod",
      metadata: () => ({
        plugin: "plugin-name",
        method: "betterAuthClientMethodName",
      }),
     });
    
     const result = yield* continuation.run((handlers) => client.betterAuthClientMethodName({
      payloadParam1: payload.payloadParam1,
      payloadParam2: payload.payloadParam2,
      fetchOptions: handlers.signal ?
      {
        signal: handlers.signal,
        onError: handlers.onError,
      } : 
      {
       onError: handlers.onError
      }
    }))
    // ensures the result.error is raised to an effect failure
    yield* continuation.raiseResult(result)
    
    // if the contract contains a success schema that's not `S.Void` return decode and return the result ensuring it aligns with the domain
    return yield* S.decodeUnknown(BetterAuthMethodSuccess)(result.data)
    }, 
    // Ensure that the only Error in the effects error channel is `IamDomain` via the failure continuation throwing a Defect using `Effect.dieMessage` for any others in the error channel
    Effect.catchTags({
      ParseError: (e) => Effect.dieMessage(`BetterAuthMethodHandler Failed to decode response: ${e}`),
    }));
    ```
  - Add the implementation handler to  `ContractSet.of` at the bottom of the file
  - Ensure that the Implementation of the contract aligns with other contracts in the `clients` directory
  - run `bun run build --filter=@beep/iam-sdk` and fix any type errors until they all pass.
  - repeat and do the next method for the core/plugin group (the folder name which contains the `.implementations.ts` and `.contracts.ts` files is the group)
  - if all methods for the group are complete make sure the `.implementations.ts` & `.contracts.ts` files are exported from the groups `index.ts` file.
