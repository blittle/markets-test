import {redirect, type ActionFunctionArgs} from '@shopify/remix-oxygen';

// if we don't implement this, /account/logout will get caught by account.$.tsx to do login
export async function loader() {
  return redirect('/');
}

export async function action({context}: ActionFunctionArgs) {
  const response = await context.customerAccount.logout();
  response.headers.set('Set-Cookie', await context.session.destroy());
  return response;
}
