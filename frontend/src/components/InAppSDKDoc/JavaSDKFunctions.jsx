import React from "react";
import "./InAppSDKDoc.css";

function JavaSDKFunctions() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container">
      <div className="main-content">

        <header className="header">
          <h1>Java SDK Function Reference</h1>
          <p>Explore all available methods exposed by the <code>InAppPaySDK</code> Android class.</p>
        </header>

        {/* Table of Contents */}
        <div className="card-small toc">
          <h2>Table of Contents</h2>
          <ul>
            <li><button className="toc-link" onClick={() => scrollToSection("constructor")}>Constructor</button></li>
            <li><button className="toc-link" onClick={() => scrollToSection("purchase-flow")}>Purchase Flow</button></li>
            <li><button className="toc-link" onClick={() => scrollToSection("status-checkers")}>Status Checkers</button></li>
            <li><button className="toc-link" onClick={() => scrollToSection("dialog-context")}>Dialog & Context Management</button></li>
            <li><button className="toc-link" onClick={() => scrollToSection("context-requirements")}>Context Requirements</button></li>
            <li><button className="toc-link" onClick={() => scrollToSection("payment-methods")}>Payment Methods</button></li>
            <li><button className="toc-link" onClick={() => scrollToSection("validation")}>Input Validation</button></li>
            <li><button className="toc-link" onClick={() => scrollToSection("customization")}>Customization</button></li>
            <li><button className="toc-link" onClick={() => scrollToSection("misc")}>Miscellaneous</button></li>
          </ul>
        </div>

        {/* Constructor */}
        <div id="constructor" className="card">
          <h2 className="section-header">Constructor</h2>
          <h4 className="endpoint-title">InAppPaySDK(String projectName, Context context)</h4>
          <p>Initializes the SDK with a Firebase <code>projectName</code> and Android <code>Context</code>.</p>
          <ul>
            <li>Automatically fetches the user's country and device ID</li>
            <li>Initializes internal context and API layers</li>
            <li><strong>Context must be an Activity</strong> - Application context will cause crashes</li>
            <li>Validates Activity state before showing dialogs</li>
          </ul>
          <div className="code-block">
            <pre>{`InAppPaySDK sdk = new InAppPaySDK("MyApp", this); // "this" must be Activity`}</pre>
          </div>
          <div className="alert">
            <strong>Critical:</strong> Always pass an Activity context. The SDK will throw IllegalArgumentException for non-Activity contexts.
          </div>
        </div>

        {/* Purchase Flow */}
        <div id="purchase-flow" className="card">
          <h2 className="section-header">Purchase Flow</h2>
          <h4 className="endpoint-title">buy(String productId, PurchaseCallback callback)</h4>
          <p>Triggers a full purchase flow:</p>
          <ul>
            <li>Validates the product with the backend</li>
            <li>Displays a context-aware purchase dialog</li>
            <li>Sends the payment data and triggers your callback</li>
          </ul>
          <div className="code-block">
            <pre>{`sdk.buy("premium_monthly", new PurchaseCallback() {
              @Override
              public void onSuccess(String msg, Map<String, Object> data) {
                // handle success
              }

              @Override
              public void onError(String err, String code) {
                // handle error
              }
            });`}</pre>
          </div>
        </div>

        {/* Status Checkers */}
        <div id="status-checkers" className="card">
          <h2 className="section-header">Status Checkers</h2>

          <div className="endpoint">
            <h4 className="endpoint-title">isUserPurchased(String productId, CheckCallback callback)</h4>
            <p>Checks if the current user has purchased a given one-time or repurchasable item.</p>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">isUserSubscribed(String productId, CheckCallback callback)</h4>
            <p>Checks if the user currently holds an active subscription for the given product ID.</p>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">getUserSubscriptions(PurchasesCallback callback)</h4>
            <p>Returns the list of subscription records for the user.</p>
          </div>

          <div className="alert">
            <strong>Note:</strong> All status callbacks return on the main UI thread.
          </div>
        </div>

        {/* Dialog & Context */}
        <div id="dialog-context" className="card">
          <h2 className="section-header">Dialog & Context Management</h2>
          
          <div className="endpoint">
            <h4 className="endpoint-title">Automatic Dialog Types</h4>
            <p>The SDK automatically displays different dialog types based on product validation:</p>
            <ul>
              <li><strong>One-Time Purchase:</strong> For products purchased once</li>
              <li><strong>Repurchase Dialog:</strong> For items that can be bought multiple times</li>
              <li><strong>Subscription Dialog:</strong> For recurring subscription products</li>
            </ul>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">Two-Step Dialog Flow</h4>
            <p>All purchase dialogs follow a consistent two-step process:</p>
            <ul>
              <li><strong>Step 1:</strong> Payment method selection (Card or PayPal)</li>
              <li><strong>Step 2:</strong> Payment details input (Card only)</li>
            </ul>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">show()</h4>
            <p>Forces a generic purchase dialog to appear with "Payment" title and "Complete your payment" description.</p>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">popUp(Context context)</h4>
            <p>Calls <code>show()</code> internally. Updates the context and displays the dialog.</p>
          </div>
        </div>

        <div id="context-requirements" className="card">
          <h2 className="section-header">Context Requirements</h2>
          <div className="endpoint">
            <h4 className="endpoint-title">Activity Context Only</h4>
            <p>The SDK strictly requires an Activity context for proper dialog management:</p>
            <ul>
              <li>✅ <strong>Correct:</strong> Pass Activity instance (<code>this</code> from Activity)</li>
              <li>❌ <strong>Wrong:</strong> Application context, Service context, or null</li>
            </ul>
          </div>
          
          <div className="endpoint">
            <h4 className="endpoint-title">Activity Lifecycle Checks</h4>
            <p>The SDK automatically validates Activity state before showing dialogs:</p>
            <ul>
              <li>Checks if Activity is finishing or destroyed</li>
              <li>Prevents crashes from showing dialogs on invalid Activities</li>
              <li>Logs errors if Activity state is invalid</li>
            </ul>
          </div>

          <div className="alert">
            <strong>Best Practice:</strong> Always ensure your Activity is active when calling purchase methods.
          </div>
        </div>

        <div id="payment-methods" className="card">
          <h2 className="section-header">Payment Methods</h2>
          <p>The SDK supports two payment methods through its built-in UI:</p>
          
          <div className="endpoint">
            <h4 className="endpoint-title">Card Payment</h4>
            <p>Full card payment support with automatic validation:</p>
            <ul>
              <li><strong>Supported Cards:</strong> Visa, MasterCard, American Express, Discover</li>
              <li><strong>Auto-Detection:</strong> Card type detected from number</li>
              <li><strong>Validation:</strong> Real-time form validation</li>
              <li><strong>Fields:</strong> Card number, expiry (MM/yy), CVV, cardholder name</li>
            </ul>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">PayPal</h4>
            <p>Simplified PayPal integration:</p>
            <ul>
              <li>One-click PayPal selection</li>
              <li>No additional form fields required</li>
              <li>Immediate processing after selection</li>
            </ul>
          </div>
          
          <div className="alert">
            <strong>Note:</strong> Payment method selection and form validation are handled automatically by the SDK's UI dialogs.
          </div>
        </div>

        <div id="validation" className="card">
          <h2 className="section-header">Built-in Input Validation</h2>
          <p>The SDK includes comprehensive form validation for card payments:</p>
          
          <div className="endpoint">
            <h4 className="endpoint-title">Card Number Validation</h4>
            <ul>
              <li>16-digit format validation</li>
              <li>Automatic card type detection</li>
              <li>Real-time validation feedback</li>
            </ul>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">Expiry Date Validation</h4>
            <ul>
              <li>MM/yy format enforcement</li>
              <li>Date format validation</li>
              <li>Required field validation</li>
            </ul>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">CVV & Name Validation</h4>
            <ul>
              <li><strong>CVV:</strong> 3-4 digit validation</li>
              <li><strong>Name:</strong> Alphabetic characters and spaces only</li>
              <li><strong>Both:</strong> Required field validation</li>
            </ul>
          </div>
          
          <div className="alert">
            <strong>Automatic Detection:</strong> The SDK automatically detects Visa, MasterCard, American Express, and Discover cards based on the first digits.
          </div>
        </div>



        {/* Customization */}
        <div id="customization" className="card">
          <h2 className="section-header">Customization</h2>

          <div className="endpoint">
            <h4 className="endpoint-title">setLabel(String label)</h4>
            <p>Sets the human-readable label shown in the purchase dialog. Chainable.</p>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">setAmount(String amount)</h4>
            <p>Sets the amount to display (USD assumed).</p>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">getLabel()</h4>
            <p>Returns the currently set label.</p>
          </div>

          <div className="endpoint">
            <h4 className="endpoint-title">getAmount()</h4>
            <p>Returns the currently set amount as a string.</p>
          </div>
        </div>

        {/* Misc */}
        <div id="misc" className="card">
          <h2 className="section-header">Miscellaneous</h2>

          <div className="endpoint">
            <h4 className="endpoint-title">getUserId()</h4>
            <p>Returns the Android device ID used to identify the user in your Firebase backend.</p>
          </div>
        </div>

        <div className="card alert">
          <strong>Activity Lifecycle:</strong> The SDK automatically checks if the Activity is finishing or destroyed before showing dialogs. 
          Ensure your Activity is active when calling purchase methods. The SDK will log errors and skip dialog display for invalid Activities.
        </div>

        <div className="card alert">
          <strong>Threading & UI:</strong> All callbacks are delivered on the main thread. The SDK handles all UI dialogs automatically, 
          including payment method selection, form validation, and error display. No manual UI management is required.
        </div>

        <div className="card alert">
          <strong>UI Note:</strong> The SDK provides a complete payment UI experience with styled dialogs, automatic validation, 
          and responsive design. Dialogs are non-cancellable by touch-outside and include proper close button handling.
        </div>
      </div>
    </div>
  );
}

export default JavaSDKFunctions;
