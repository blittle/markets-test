import type {I18nBase} from '@shopify/hydrogen';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
}

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  let firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';
  firstPathPart = firstPathPart.split('.DATA')[0];

  let pathPrefix = '';
  const language = 'EN';
  let country = 'US' as I18nLocale['country'];

  if (/^[A-Z]{2}$/i.test(firstPathPart)) {
    country = firstPathPart.toUpperCase() as I18nLocale['country'];
    pathPrefix = `/${country}`;
  }

  return {language, country, pathPrefix};
}
