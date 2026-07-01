/**
 *
 */
import {Fn} from "@beep/schema";

import * as S from "effect/Schema";
import { $ScratchpadId } from "@beep/identity";
import { PromiseSchema } from "@beep/schema"

export {
	AddOptions,
	AddResult,
	CognifyOptions,
	CognifyResult,
	SearchTypeString,
	RecallScopeString,
	SearchOptions,
	SearchResponse,
	RecallOptions,
	RecallResult,
	RememberOptions,
	RememberResult,
	MemoryEntry,
	MemifyOptions,
	MemifyResult,
	ImproveOptions,
	DataInput,
	ImproveResult,
	ForgetTarget,
	ForgetResult,
	UpdateOptions,
	UpdateResult,
	PruneSystemOptions,
	PruneResult,
	Dataset,
	Data,
	Value,
	DeleteResult,
	User,
	Notebook,
	SessionQAEntry,
	VisualizeOptions,
} from "./Cognee.models.ts";
import { SchemaUtils } from "@beep/schema";
import type { AddResult } from "./Cognee.models.ts";

const $I = $ScratchpadId.create("cognee/models/Cognee.task");

const NativeBox = S.ObjectKeyword.pipe(
	S.brand("NativeBox"),
	$I.annoteSchema("NativeBox", {
		description: "A native box.",
	})
);

type NativeBox = typeof NativeBox.Type;

export const TaskFn = Fn({
	input: S.Tuple([Value, S.OptionFromUndefinedOr()]),
	output:
})

//----------------------------------------------------------------------------------------------------------------------
// RUNTIME
//----------------------------------------------------------------------------------------------------------------------

export const Init = Fn({ output: S.Void }).pipe(
	$I.annoteSchema("Init", {
		description: "Initializes the task.",
	})
)

export type Init = typeof Init.Type;

export const InitWithThreads = Fn({ input: S.Finite, output: S.Void }).pipe(
	$I.annoteSchema("Init", {
		description: "Initializes the task.",
	})
)
export type InitWithThreads = typeof InitWithThreads.Type;

export const Shutdown = Fn({ output: S.Void }).pipe(
	$I.annoteSchema("Shutdown", {
		description: "Shuts down the task.",
	})
)

export type Shutdown = typeof Shutdown.Type;


export const New = Fn({ input: S.OptionFromUndefinedOr(S.Union([S.ObjectKeyword, S.String])), output: NativeBox }).pipe(
	$I.annoteSchema("New", {
		description: "Creates a new .",
	})
)

export type New = typeof New.Type;

export const Warm = Fn({
	input: NativeBox,
	output: PromiseSchema<void>()
})

export type Warm = typeof Warm.Type;

export const WarmId = Fn({
	input: NativeBox,
	output: PromiseSchema<string>()
})


export const Add = Fn({
	input: S.Struct({
		handle: NativeBox,
		dataInput: S.Union([DataInput, S.Array(DataInput)]),
		datasetName: S.String,
		opts: AddOptions.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
	}),
	output: PromiseSchema<AddResult>()
})

export const Cognify = Fn({
	input: S.Struct({
		handle: NativeBox,
		dataInput: S.Union([DataInput, S.Array(DataInput)]),
	})
})