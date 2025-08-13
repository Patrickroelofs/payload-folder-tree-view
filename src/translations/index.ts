import type { GenericTranslationsObject, NestedKeysStripped } from '@payloadcms/translations'

import { en } from './en.js'
import { nl } from './nl.js'


export const translations = {
  en,
  nl,
}

export type PluginPayloadEXIF = GenericTranslationsObject

export type PluginPayloadEXIFTranslationKeys = NestedKeysStripped<PluginPayloadEXIF>