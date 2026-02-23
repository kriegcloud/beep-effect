/**
 * Email compose node set for the canonical LexicalEditor.
 *
 * These 10 nodes support the email-compose use case: rich text formatting,
 * lists, links, images, mentions, emojis, and horizontal rules.
 */
import { HorizontalRuleNode } from "@lexical/extension";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { Klass, LexicalNode } from "lexical";

import { EmojiNode } from "./EmojiNode";
import { ImageNode } from "./ImageNode";
import { MentionNode } from "./MentionNode";

export const EMAIL_COMPOSE_NODES: ReadonlyArray<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
  ImageNode,
  MentionNode,
  EmojiNode,
];
