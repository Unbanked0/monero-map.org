import { i18nClient, initTranslator, locale, localeFlags } from '$lib/i18n';
import type { LoadEvent } from '@sveltejs/kit';
import { localeFlagsEngine } from 'omni18n/ts';

export async function load({ data }: LoadEvent) {
	locale.set(data!.locale);
	localeFlags.set(localeFlagsEngine(data!.localeFlagsEngine));
	i18nClient.usePartial(data!.dictionary);
	await initTranslator();
}
