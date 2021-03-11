import React from "react"
import { useIdentityContext } from "react-netlify-identity-gotrue"
import { loadStripe } from "@stripe/stripe-js"
const stripePromise = loadStripe(
  "pk_test_51HOpV2JqkXITmJSIUBmz3VHCPFGOySQYVTPcZneMZxSqmm89VGzDYaYDU4nFEDlqJUUnEQiQ5SWU0PngWpyQSuIO00cABRxm8I"
)

export default function ManageSub({ innerText, classList, productID }) {
  const btnText = innerText || "Manage Subscription"
  const identity = useIdentityContext()

  const redirectToCheckoutSession = async event => {
    const stripe = await stripePromise

    if (identity.user) {
      identity
        .authorizedFetch("/.netlify/functions/create-manage-link", {
          method: "POST",
          body: JSON.stringify({
            product: productID,
          }),
        })
        .then(res => res.json())
        .then(stripeSessionID => {
          console.log(stripeSessionID)
          stripe.redirectToCheckout({
            sessionId: stripeSessionID.id,
          })
        })
        .catch(err => console.error(err))
    } else {
      console.log("not logged in")
    }
  }

  return (
    <a
      className="manage-sub-btn btn-style-1 demo-btn"
      onClick={redirectToCheckoutSession}
    >
      {btnText}
    </a>
  )
}
