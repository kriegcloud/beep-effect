#!/usr/bin/env python3
import argparse
import os
from dataclasses import dataclass
from typing import Any

import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoProcessor, Qwen2AudioForConditionalGeneration


def _env(name: str, default: str) -> str:
    value = os.environ.get(name)
    return value if value is not None and value != "" else default


@dataclass(frozen=True)
class ServiceConfig:
    model_id: str
    host: str
    port: int
    cache_dir: str
    token: str | None

    @classmethod
    def from_env(cls) -> "ServiceConfig":
        token = os.environ.get("HUGGING_FACE_HUB_TOKEN")
        return cls(
            model_id=_env("QWEN_SERVICE_MODEL_ID", "Qwen/Qwen2-Audio-7B-Instruct"),
            host=_env("QWEN_SERVICE_HOST", "127.0.0.1"),
            port=int(_env("QWEN_SERVICE_PORT", "8011")),
            cache_dir=_env("QWEN_SERVICE_CACHE_DIR", os.path.expanduser("~/.cache/huggingface")),
            token=token if token else None,
        )


class ChatMessage(BaseModel):
    role: str
    content: Any


class ChatCompletionsRequest(BaseModel):
    messages: list[ChatMessage]
    max_tokens: int = 256
    temperature: float = 0.2


class QwenRuntime:
    def __init__(self, config: ServiceConfig) -> None:
        self.config = config
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.processor = AutoProcessor.from_pretrained(
            config.model_id,
            cache_dir=config.cache_dir,
            token=config.token,
            trust_remote_code=True,
        )
        self.model = Qwen2AudioForConditionalGeneration.from_pretrained(
            config.model_id,
            cache_dir=config.cache_dir,
            token=config.token,
            device_map="auto" if self.device == "cuda" else None,
            torch_dtype=self.dtype,
            trust_remote_code=True,
        )

        if self.device != "cuda":
            self.model.to(self.device)

    def _normalize_message_content(self, content: Any) -> str:
        if isinstance(content, str):
            return content

        if isinstance(content, list):
            parts: list[str] = []
            for item in content:
                if not isinstance(item, dict):
                    raise HTTPException(status_code=400, detail="Message content items must be objects.")

                item_type = item.get("type")
                if item_type == "text":
                    text = item.get("text")
                    if not isinstance(text, str):
                        raise HTTPException(status_code=400, detail="Text content items must include a string `text` field.")

                    parts.append(text)
                    continue

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "This local Qwen service currently supports only text content items. "
                        f"Unsupported content type: {item_type!r}."
                    ),
                )

            return "\n".join(parts)

        raise HTTPException(
            status_code=400,
            detail="Message content must be either a string or an array of text content items.",
        )

    def _chat_prompt(self, messages: list[ChatMessage]) -> list[dict[str, Any]]:
        prompt_messages: list[dict[str, Any]] = []

        for message in messages:
            content = self._normalize_message_content(message.content)
            if content == "":
                continue

            prompt_messages.append(
                {
                    "role": message.role,
                    "content": [{"type": "text", "text": content}],
                }
            )

        return prompt_messages

    def chat(self, body: ChatCompletionsRequest) -> dict[str, Any]:
        prompt_messages = self._chat_prompt(body.messages)

        if len(prompt_messages) == 0:
            raise HTTPException(status_code=400, detail="At least one text message is required.")

        text_prompt = self.processor.apply_chat_template(
            prompt_messages,
            add_generation_prompt=True,
            tokenize=False,
        )

        inputs = self.processor(text=text_prompt, return_tensors="pt")
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
    runtime = QwenRuntime(config)

    if args.download_only:
        print(f"downloaded {config.model_id} into {config.cache_dir}")
        return

    app = build_app(runtime)
    uvicorn.run(app, host=config.host, port=config.port, log_level="info")


if __name__ == "__main__":
    main()
