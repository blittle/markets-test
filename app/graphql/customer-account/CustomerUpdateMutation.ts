export const CUSTOMER_UPDATE_MUTATION = `#graphql
  # https://shopify.dev/docs/api/customer/latest/mutations/customerUpdate
  mutation customerUpdate(
    $customer: CustomerUpdateInput!
  ){
    customerUpdate(input: $customer) {
      customer {
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
        companyContacts(first: 10) {
          nodes {
            company {
              id
              name
              locations(first: 10) {
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;
