import { i18nClient, initTranslator, locale } from '$lib/i18n';
import type { LoadEvent } from '@sveltejs/kit';

export async function load({ data }: LoadEvent) {
	locale.set(data!.locale);
	i18nClient.usePartial(data!.dictionary);
	await initTranslator();
}
