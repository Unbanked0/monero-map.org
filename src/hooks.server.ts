import { locales, setFetch } from '$lib/i18n';
import { createClient } from '$lib/i18n.server';
import type { Handle } from '@sveltejs/kit';
import { localeFlagsEngine, type Locale } from 'omni18n/ts';

export const handle: Handle = ({ event, resolve }) => {
	//#region i18n
	const preferredLocale = <Locale>event.cookies.get('language'),
		usedLocales = <Locale[]>event.request.headers
				.get('accept-language')
				?.split(',')
				.map((x) => x.split(' ')[0])
				.map((x) => x && locales.find((locale) => locale.startsWith(x)))
				.filter((x) => !!x) || [];
	if (preferredLocale) usedLocales.unshift(preferredLocale);
	// Always have the en (original website) as feedback + avoid empty locales
	usedLocales.push('en');
	setFetch(event.fetch);
	// Does not actually download anything, just centralizes so that if something is downloaded, it is done once
	Object.assign(event.locals, {
		i18nClient: createClient(usedLocales),
		localeFlags: localeFlagsEngine(event.request.headers.get('user-agent'))
	});
	//#endregion
	return resolve(event, {
		transformPageChunk(opts: { html: string; done: boolean }) {
			return opts.html.replaceAll('lang="%language%"', `lang="${usedLocales[0]}"`);
		}
	});
};
