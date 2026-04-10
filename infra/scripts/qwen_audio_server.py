#!/usr/bin/env python3
import argparse
import os
from dataclasses import dataclass
from io import BytesIO
from typing import Any
from urllib.error import URLError
from urllib.request import urlopen

import librosa
import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from huggingface_hub import snapshot_download
from pydantic import BaseModel, Field
from transformers import AutoProcessor, Qwen2AudioForConditionalGeneration


def _env(name: str, default: str) -> str:
    value = os.environ.get(name)
    return value if value is not None and value != "" else default


def _env_bool(name: str, default: bool) -> bool:
    value = os.environ.get(name)
    if value is None or value == "":
        return default

    return value.lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class ServiceConfig:
    model_id: str
    host: str
    port: int
    cache_dir: str
    token: str | None
    trust_remote_code: bool

    @classmethod
    def from_env(cls) -> "ServiceConfig":
        token = os.environ.get("HUGGING_FACE_HUB_TOKEN")
        return cls(
            model_id=_env("QWEN_SERVICE_MODEL_ID", "Qwen/Qwen2-Audio-7B-Instruct"),
            host=_env("QWEN_SERVICE_HOST", "127.0.0.1"),
            port=int(_env("QWEN_SERVICE_PORT", "8011")),
            cache_dir=_env("QWEN_SERVICE_CACHE_DIR", os.path.expanduser("~/.cache/huggingface")),
            token=token if token else None,
            trust_remote_code=_env_bool("QWEN_SERVICE_TRUST_REMOTE_CODE", False),
        )


def download_model_artifacts(config: ServiceConfig) -> None:
    snapshot_download(
        repo_id=config.model_id,
        cache_dir=config.cache_dir,
        token=config.token,
    )


class ChatMessage(BaseModel):
    role: str
    content: Any


class ChatCompletionsRequest(BaseModel):
    messages: list[ChatMessage]
    max_tokens: int = Field(default=256, ge=1)
    temperature: float = Field(default=0.2, ge=0)


@dataclass(frozen=True)
class NormalizedMessageContent:
    content: str | list[dict[str, str]]
    audios: list[Any]


class QwenRuntime:
    def __init__(self, config: ServiceConfig) -> None:
        self.config = config
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.processor = AutoProcessor.from_pretrained(
            config.model_id,
            cache_dir=config.cache_dir,
            token=config.token,
            trust_remote_code=config.trust_remote_code,
        )
        self.model = Qwen2AudioForConditionalGeneration.from_pretrained(
            config.model_id,
            cache_dir=config.cache_dir,
            token=config.token,
            device_map="auto" if self.device == "cuda" else None,
            torch_dtype=self.dtype,
            trust_remote_code=config.trust_remote_code,
        )

        if self.device != "cuda":
            self.model.to(self.device)

    def _resolve_audio_url(self, item: dict[str, Any]) -> str:
        audio_url = item.get("audio_url")

        if isinstance(audio_url, str):
            return audio_url

        if isinstance(audio_url, dict):
            nested_url = audio_url.get("url")
            if isinstance(nested_url, str):
                return nested_url

        raise HTTPException(
            status_code=400,
            detail="Audio content items must include a string `audio_url` field.",
        )

    def _load_audio(self, audio_url: str) -> Any:
        try:
            with urlopen(audio_url, timeout=30) as response:
                audio_bytes = response.read()

            return librosa.load(BytesIO(audio_bytes), sr=self.processor.feature_extractor.sampling_rate)[0]
        except (OSError, URLError, ValueError) as error:
            raise HTTPException(
                status_code=400,
                detail=f"Unable to load audio content from {audio_url!r}: {error}",
            ) from error

    def _normalize_message_content(self, content: Any) -> NormalizedMessageContent:
        if isinstance(content, str):
            return NormalizedMessageContent(content=content, audios=[])

        if isinstance(content, list):
            parts: list[dict[str, str]] = []
            audios: list[Any] = []
            for item in content:
                if not isinstance(item, dict):
                    raise HTTPException(status_code=400, detail="Message content items must be objects.")

                item_type = item.get("type")
                if item_type == "text":
                    text = item.get("text")
                    if not isinstance(text, str):
                        raise HTTPException(status_code=400, detail="Text content items must include a string `text` field.")

                    parts.append({"type": "text", "text": text})
                    continue

                if item_type == "audio":
                    audio_url = self._resolve_audio_url(item)
                    audios.append(self._load_audio(audio_url))
                    parts.append({"type": "audio", "audio_url": audio_url})
                    continue

                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported content type: {item_type!r}. Supported content types are 'text' and 'audio'.",
                )

            return NormalizedMessageContent(content=parts, audios=audios)

        raise HTTPException(
            status_code=400,
            detail="Message content must be either a string or an array of text or audio content items.",
        )

    def _chat_prompt(self, messages: list[ChatMessage]) -> tuple[list[dict[str, Any]], list[Any]]:
        prompt_messages: list[dict[str, Any]] = []
        audios: list[Any] = []

        for message in messages:
            normalized = self._normalize_message_content(message.content)
            content = normalized.content

            if content == "" or content == []:
                continue

            prompt_messages.append(
                {
                    "role": message.role,
                    "content": content,
                }
            )
            audios.extend(normalized.audios)

        return prompt_messages, audios

    def chat(self, body: ChatCompletionsRequest) -> dict[str, Any]:
        prompt_messages, audios = self._chat_prompt(body.messages)

        if len(prompt_messages) == 0:
            raise HTTPException(status_code=400, detail="At least one text or audio message is required.")

        text_prompt = self.processor.apply_chat_template(
            prompt_messages,
            add_generation_prompt=True,
            tokenize=False,
        )

        processor_args: dict[str, Any] = {
            "text": text_prompt,
            "return_tensors": "pt",
        }

        if len(audios) > 0:
            processor_args["audio"] = audios
            processor_args["padding"] = True

        inputs = self.processor(**processor_args)
        inputs = inputs.to(self.model.device)
        use_sampling = body.temperature > 0

        generated_ids = self.model.generate(
            **inputs,
            max_new_tokens=body.max_tokens,
            do_sample=use_sampling,
            **({"temperature": body.temperature} if use_sampling else {}),
        )
        new_tokens = generated_ids[:, inputs.input_ids.shape[1] :]
        text = self.processor.batch_decode(new_tokens, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]

        return {
            "id": "chatcmpl-local-qwen-audio",
            "object": "chat.completion",
            "model": self.config.model_id,
            "choices": [
                {
                    "index": 0,
                    "finish_reason": "stop",
                    "message": {
                        "role": "assistant",
                        "content": text,
                    },
                }
            ],
        }

    def health(self) -> dict[str, Any]:
        return {
            "status": "ok",
            "modelId": self.config.model_id,
            "device": self.device,
            "cudaAvailable": torch.cuda.is_available(),
        }


def build_app(runtime: QwenRuntime) -> FastAPI:
    app = FastAPI(title="beep V2T Qwen Audio Server")

    @app.get("/healthz")
    def healthz() -> dict[str, Any]:
        return runtime.health()

    @app.get("/v1/models")
    def models() -> dict[str, Any]:
        return {
            "object": "list",
            "data": [{"id": runtime.config.model_id, "object": "model"}],
        }

    @app.post("/v1/chat/completions")
    def chat_completions(body: ChatCompletionsRequest) -> dict[str, Any]:
        return runtime.chat(body)

    return app


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--download-only", action="store_true")
    args = parser.parse_args()

    config = ServiceConfig.from_env()

    if args.download_only:
        download_model_artifacts(config)
        print(f"downloaded {config.model_id} into {config.cache_dir}")
        return

    runtime = QwenRuntime(config)
    app = build_app(runtime)
    uvicorn.run(app, host=config.host, port=config.port, log_level="info")


if __name__ == "__main__":
    main()
