import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext,
  type MetaFunction,
} from '@remix-run/react';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return data({
    companyId: context.session.get('companyId'),
    locationId: context.session.get('locationId'),
  });
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const companyId = form.get('companyContactId');
    const locationId = form.get('companyLocationId');
    context.session.set('companyId', companyId);
    context.session.set('locationId', locationId);

    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const response = await customerAccount.mutate(CUSTOMER_UPDATE_MUTATION, {
      variables: {
        customer,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    if (!response.data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return data(
      {
        error: null,
        customer: response.data?.customerUpdate?.customer,
        companyId: context.session.get('companyId'),
        locationId: context.session.get('locationId'),
      },
      {
        headers: {
          'Set-Cookie': await context.session.commit(),
        },
      },
    );
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {companyId, locationId} = useLoaderData<typeof loader>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <div className="account-profile">
      <h2>My profile</h2>
      <br />
      <Form method="PUT">
        <legend>Personal information</legend>
        <fieldset>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            defaultValue={customer.firstName ?? ''}
            minLength={2}
          />
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            defaultValue={customer.lastName ?? ''}
            minLength={2}
          />
        </fieldset>
        <h2>Company</h2>
        <div class="flex gap-4">
          <select
            name="companyContactId"
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">No selected company</option>
            {customer?.companyContacts?.nodes?.map((contact) => (
              <option
                key={contact.company.id}
                value={contact.company.id}
                selected={companyId === contact.company.id}
              >
                {contact.company.name}
              </option>
            ))}
          </select>
          <select
            name="companyLocationId"
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">No selected location</option>
            {customer?.companyContacts?.nodes
              ?.find((contact) => contact.company.id === companyId)
              ?.company.locations.nodes.map((location) => (
                <option
                  key={location.id}
                  value={location.id}
                  selected={locationId === location.id}
                >
                  {location.name}
                </option>
              ))}
          </select>
        </div>
        <div className="h-10 pt-2">
          {action?.error ? (
            <>
              <p>
                <mark>
                  <small>{action.error}</small>
                </mark>
              </p>
            </>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={state !== 'idle'}
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          {state !== 'idle' ? 'Updating' : 'Update'}
        </button>
      </Form>
    </div>
  );
}
