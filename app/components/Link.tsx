import {
  Link as RemixLink,
  NavLink as RemixNavLink,
  LinkProps,
  NavLinkProps,
  useRouteLoaderData,
} from '@remix-run/react';
import type {RootLoader} from '~/root';

export function Link({to, ...props}: LinkProps) {
  const {country} = useRouteLoaderData<RootLoader>('root') ?? {country: 'US'};

  if (typeof to === 'string') {
    if (country !== 'US') {
      to = `/${country.toLowerCase()}${to}`;
    }
  }

  return <RemixLink to={to} {...props} />;
}

export function NavLink({to, ...props}: NavLinkProps) {
  const {country} = useRouteLoaderData<RootLoader>('root') ?? {country: 'US'};

  if (typeof to === 'string') {
    if (country !== 'US') {
      to = `/${country.toLowerCase()}${to}`;
    }
  }
  return <RemixNavLink to={to} {...props} />;
}
