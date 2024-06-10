import type { ServerLoadEvent } from '@sveltejs/kit';

export async function load({ locals: { i18nClient: i18n, localeFlags } }: ServerLoadEvent) {
	await i18n.enter();
	return {
		locale: i18n.locales[0],
		localeFlagsEngine: localeFlags.name,
		dictionary: i18n.getPartialLoad(['server'])
	};
}
