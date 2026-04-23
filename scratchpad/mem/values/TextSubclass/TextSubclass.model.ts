/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {MappedLiteralKit} from "@beep/schema";


const $I = $ScratchId.create("mem/values/TextSubclass/TextSubclass.model")

export const TextSubclass = MappedLiteralKit([
  [
    "ARTICLES",
    "Articles, essays, and reports",
  ],
  [
    "BOOKS",
    "Books and manuscripts",
  ],
  [
    "NEWS_STORIES",
    "News stories and blog posts",
  ],
  [
    "RESEARCH_PAPERS",
    "Research papers and academic publications",
  ],
  [
    "SOCIAL_MEDIA",
    "Social media posts and comments",
  ],
  [
    "WEBSITE_CONTENT",
    "Website content and product descriptions",
  ],
  [
    "PERSONAL_NARRATIVES",
    "Personal narratives and stories",
  ],
  [
    "SPREADSHEETS",
    "Spreadsheets and tables",
  ],
  [
    "FORMS",
    "Forms and surveys",
  ],
  [
    "DATABASES",
    "Databases and CSV files",
  ],
  [
    "SOURCE_CODE",
    "Source code in various programming languages",
  ],
  [
    "SHELL_SCRIPTS",
    "Shell commands and scripts",
  ],
  [
    "MARKUP_LANGUAGES",
    "Markup languages (HTML, XML)",
  ],
  [
    "STYLESHEETS",
    "Stylesheets (CSS) and configuration files (YAML, JSON, INI)",
  ],
  [
    "CHAT_TRANSCRIPTS",
    "Chat transcripts and messaging history",
  ],
  [
    "CUSTOMER_SERVICE_LOGS",
    "Customer service logs and interactions",
  ],
  [
    "CONVERSATIONAL_AI",
    "Conversational AI training data",
  ],
  [
    "TEXTBOOK_CONTENT",
    "Textbook content and lecture notes",
  ],
  [
    "EXAM_QUESTIONS",
    "Exam questions and academic exercises",
  ],
  [
    "E_LEARNING_MATERIALS",
    "E-learning course materials",
  ],
  [
    "POETRY",
    "Poetry and prose",
  ],
  [
    "SCRIPTS",
    "Scripts for plays, movies, and television",
  ],
  [
    "SONG_LYRICS",
    "Song lyrics",
  ],
  [
    "MANUALS",
    "Manuals and user guides",
  ],
  [
    "TECH_SPECS",
    "Technical specifications and API documentation",
  ],
  [
    "HELPDESK_ARTICLES",
    "Helpdesk articles and FAQs",
  ],
  [
    "LEGAL_CONTRACTS",
    "Contracts and agreements",
  ],
  [
    "LAWS",
    "Laws, regulations, and legal case documents",
  ],
  [
    "POLICY_DOCUMENTS",
    "Policy documents and compliance materials",
  ],
  [
    "CLINICAL_TRIALS",
    "Clinical trial reports",
  ],
  [
    "PATIENT_RECORDS",
    "Patient records and case notes",
  ],
  [
    "SCIENTIFIC_ARTICLES",
    "Scientific journal articles",
  ],
  [
    "FINANCIAL_REPORTS",
    "Financial reports and statements",
  ],
  [
    "BUSINESS_PLANS",
    "Business plans and proposals",
  ],
  [
    "MARKET_RESEARCH",
    "Market research and analysis reports",
  ],
  [
    "AD_COPIES",
    "Ad copies and marketing slogans",
  ],
  [
    "PRODUCT_CATALOGS",
    "Product catalogs and brochures",
  ],
  [
    "PRESS_RELEASES",
    "Press releases and promotional content",
  ],
  [
    "PROFESSIONAL_EMAILS",
    "Professional and formal correspondence",
  ],
  [
    "PERSONAL_EMAILS",
    "Personal emails and letters",
  ],
  [
    "IMAGE_CAPTIONS",
    "Image and video captions",
  ],
  [
    "ANNOTATIONS",
    "Annotations and metadata for various media",
  ],
  [
    "VOCAB_LISTS",
    "Vocabulary lists and grammar rules",
  ],
  [
    "LANGUAGE_EXERCISES",
    "Language exercises and quizzes",
  ],
  [
    "LEGAL_AND_REGULATORY_DOCUMENTS",
    "Legal and Regulatory Documents",
  ],
  [
    "OTHER_TEXT",
    "Other types of text data",
  ],
])
  .pipe($I.annoteSchema(
    "TextSubclass",
    {
      description: "A mapped literal kit representing different subclasses of text data, including various types of written content, media, and other text-related data.",
    },
  ))

export type TextSubclass = typeof TextSubclass.Type;
