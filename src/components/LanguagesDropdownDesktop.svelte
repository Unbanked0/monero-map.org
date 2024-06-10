<script lang="ts">
	import { locale, locales, localeFlags } from '$lib/i18n';
	import type { Locale } from 'omni18n/ts';
	import OutClick from 'svelte-outclick';

	function selfLocale(locale: string) {
		return new Intl.DisplayNames(locale, { type: 'language' }).of(locale) || '???';
	}
	let localeDescriptions;
	$: localeDescriptions = locales
		.filter((l) => $locale !== l)
		.map((locale) => ({
			locale,
			flag: $localeFlags(locale)[0],
			text: selfLocale(locale)
		}));
	let flag: string;
	$: flag = $localeFlags($locale)[0];

	function setLocale(newLocale: Locale) {
		locale.set(newLocale);
		show = false;
	}

	let show = false;
</script>

<!-- dropdown menu -->
<div class="relative">
	<button
		id="dropdown-languages"
		on:click={() => (show = !show)}
		class="{show
			? 'dark:!text-link'
			: ''} mr-4 mt-4 flex items-center text-xl font-semibold text-link transition-colors hover:text-hover dark:text-white dark:hover:text-link md:mr-0 md:mt-0"
	>
		{@html flag}
	</button>

	<!-- dropdown items -->
	{#if show}
		<OutClick excludeQuerySelectorAll={`#dropdown-languages`} on:outclick={() => (show = false)}>
			<div class="absolute right-0 top-8 w-[125px] rounded-2xl shadow-lg">
				{#each localeDescriptions as desc}
					<button
						on:click={() => setLocale(desc.locale)}
						class="{$locale === desc.locale
							? 'dark:!text-link'
							: ''}mr-4 mt-4 flex items-center text-xl font-semibold text-link transition-colors hover:text-hover dark:text-white dark:hover:text-link md:mr-0 md:mt-0"
					>
						{@html desc.flag}
						{desc.text}
					</button>
				{/each}
			</div>
		</OutClick>
	{/if}
</div>
