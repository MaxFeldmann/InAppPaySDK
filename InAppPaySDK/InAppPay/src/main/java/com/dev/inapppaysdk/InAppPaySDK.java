package com.dev.inapppaysdk;

import android.content.Context;
import com.dev.inapppaysdk.api.ApiClient;
import com.dev.inapppaysdk.api.InAppApiService;
import com.dev.inapppaysdk.callbacks.*;
import com.dev.inapppaysdk.utils.*;
import com.dev.inapppaysdk.ui.PurchaseDialogManager;
import com.dev.inapppaysdk.interfaces.Popupable;
import com.dev.inapppaysdk.constants.InAppConstants;
import com.dev.inapppaysdk.utils.ErrorDialogHelper;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * <h1>InAppPaySDK</h1>
 *
 * <p>
 * Lightweight helper that wires an Android client to a set of Firebase Cloud
 * Functions, providing a <em>single API surface</em> for validating items,
 * charging cards / PayPal, and checking a user’s purchase or subscription
 * status.  It also shows context‑aware purchase dialogs so you do not have to
 * build any UI yourself.
 * </p>
 *
 * <h2>Main capabilities</h2>
 * <ul>
 *   <li><strong>Item validation</strong> &mdash; calls
 *       <code>validateItemForPurchase</code> to ensure a product can be bought
 *       before showing any UI.</li>
 *   <li><strong>Unified checkout UI</strong> &mdash; one‑time, repurchase, and
 *       subscription dialogs are rendered automatically.</li>
 *   <li><strong>Secure processing</strong> &mdash; relays payment details to
 *       <code>processPurchase</code> Cloud Function via Retrofit.</li>
 *   <li><strong>Status helpers</strong>
 *     <ul>
 *       <li>{@link #isUserPurchased(String, CheckCallback)}</li>
 *       <li>{@link #isUserSubscribed(String, CheckCallback)}</li>
 *       <li>{@link #getUserSubscriptions(PurchasesCallback)}</li>
 *     </ul>
 *   </li>
 * </ul>
 *
 <h2>Typical usage</h2>
 <ol>
 <li>
 <strong>Create inside your Activity</strong>
 <pre>
 public class CheckoutActivity extends AppCompatActivity {
 private InAppPaySDK paySdk;

 {@code @Override}
 protected void onCreate(Bundle savedInstanceState) {
 super.onCreate(savedInstanceState);
 setContentView(R.layout.activity_checkout);

 paySdk = new InAppPaySDK("MyProject", this);  // “this” is the Activity
 paySdk.setLabel("Premium Pack").setAmount("4.99");
 }
 </pre>
 </li>
 <li>
 <strong>Kick off purchase flow</strong>
 <pre>
 paySdk.buy("premium_01", new PurchaseCallback() {
 {@code @Override}
 public  void onSuccess(String msg, Map&lt;String,Object&gt; data) {  … }

 {@code @Override} public  void onError(String err, String code) {  … }
 } );
 }
 </pre>
 </li>
 <li>
 <strong>Release in <code>onDestroy()</code></strong>
 <pre>
 {@code @Override}
 protected void onDestroy() {
 paySdk = null;   // allow GC; SDK keeps no static references
 super.onDestroy();
 }
 }
 </pre>
 </li>
 </ol>
 *
 * <p><strong>Threading</strong> – all callbacks are delivered on the main
 * thread; network calls run on Retrofit’s executor.</p>
 *
 * @author  Your&nbsp;Name
 * @version 1.0.0
 * @since   2025‑07‑07
 */
public class InAppPaySDK implements Popupable, PurchaseDialogManager.PurchaseDialogCallback {

    private Context context;
    private String userId;
    private String projectName;
    private String userCountry;
    private final InAppApiService apiService;
    private final PurchaseContextManager contextManager;
    private PurchaseDialogManager dialogManager;

    private InAppPaySDK() {
        apiService = ApiClient.getApiService();
        contextManager = PurchaseContextManager.getInstance();
    }

    /**
     * Creates a new {@code InAppPaySDK} instance bound to a Firebase project.
     *
     * @param projectName Firebase Functions project name
     * @param context     any valid Android Activity {@link Context}
     */
    public InAppPaySDK(String projectName, Context context) {
        this.context = context;
        this.apiService = ApiClient.getApiService();
        this.contextManager = PurchaseContextManager.getInstance();
        this.dialogManager = new PurchaseDialogManager(context, this);
        this.projectName = projectName;
        this.userId = DeviceUtils.getAndroidId(context);
        this.userCountry = DeviceUtils.detectUserCountry(context);
    }

    /**
     * @return the current dialog label (e.g. “Premium Upgrade”)
     */
    public String getLabel() {
        return contextManager.getLabel();
    }

    /**
     * Sets the dialog label shown to the user.
     *
     * @param label human‑readable product label
     * @return this instance for chaining
     */
    public InAppPaySDK setLabel(String label) {
        contextManager.setLabel(label);
        return this;
    }

    /** @return the amount (ISO‑4217 currency assumed USD) */
    public String getAmount() {
        return contextManager.getPrice();
    }

    /**
     * Sets the amount (in USD) displayed in dialogs.
     *
     * @param amount numeric amount, e.g.&nbsp;“4.99”
     */
    public void setAmount(String amount) {
        contextManager.setPrice(amount);
    }

    // Get the user ID (Android ID)
    public String getUserId() {
        return userId;
    }

    /**
 * Starts a purchase flow.
 *
 * <ul>
 *   <li>Calls <code>validateItemForPurchase</code> on your
 *       Cloud Function.</li>
 *   <li>Shows the corresponding purchase dialog
 *       (<em>one‑time</em>, <em>repurchase</em> or
 *       <em>subscription</em>).</li>
 *   <li>Invokes {@link PurchaseCallback} on success or failure.</li>
 * </ul>
 *
 * @param productId product key exactly as defined in your back‑end
 * @param callback  host‑side handler for success / error
 */
public void buy(String productId, PurchaseCallback callback) {
    if (userId == null || userId.isEmpty()) {
        ErrorDialogHelper.showErrorDialogWithCode(context, 
            "Could not get device ID", "MISSING_DEVICE_ID");
        callback.onError("Could not get device ID", "MISSING_DEVICE_ID");
        return;
    }

    if (projectName == null || projectName.isEmpty()) {
        ErrorDialogHelper.showErrorDialogWithCode(context, 
            "Project name is required", "MISSING_PROJECT_NAME");
        callback.onError("Project name is required", "MISSING_PROJECT_NAME");
        return;
    }

    contextManager.setPurchaseContext(productId, callback);

    Map<String, Object> requestData = new HashMap<>();
    requestData.put("projectName", projectName);
    requestData.put("productId", productId);
    requestData.put("userId", userId);

    LoadingDialogHelper loadingDialog = new LoadingDialogHelper();
    loadingDialog.show(context); // Show loading before network call

    Call<Map<String, Object>> call = apiService.validateItemForPurchase(requestData);
    call.enqueue(new Callback<Map<String, Object>>() {
        @Override
        public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
            loadingDialog.dismiss(); // Hide loading after response

            if (response.isSuccessful() && response.body() != null) {
                Map<String, Object> responseBody = response.body();
                Boolean success = (Boolean) responseBody.get("success");

                if (Boolean.TRUE.equals(success)) {
                    Map<String, Object> itemData = (Map<String, Object>) responseBody.get("data");
                    String itemType = (String) itemData.get("type");

                    contextManager.setItemData(itemData, itemType);

                    switch (itemType) {
                        case InAppConstants.TYPE_ONETIME:
                            dialogManager.showOnetimeDialog((String) itemData.get("name"), (String) itemData.get("description"));
                            break;
                        case InAppConstants.TYPE_REPURCHASE:
                            dialogManager.showRepurchaseDialog((String) itemData.get("name"), (String) itemData.get("description"));
                            break;
                        case InAppConstants.TYPE_SUBSCRIPTION:
                            dialogManager.showSubscriptionDialog((String) itemData.get("name"), (String) itemData.get("description"));
                            break;
                        default:
                            String errorMsg = "Unknown item type: " + itemType;
                            ErrorDialogHelper.showErrorDialogWithCode(context, errorMsg, "INVALID_ITEM_TYPE");
                            callback.onError(errorMsg, "INVALID_ITEM_TYPE");
                            contextManager.reset();
                            break;
                    }
                } else {
                    String error = (String) responseBody.get("error");
                    String errorCode = (String) responseBody.get("errorCode");
                    String errorMessage = error != null ? error : "Item validation failed";
                    String finalErrorCode = errorCode != null ? errorCode : "VALIDATION_FAILED";
                    
                    ErrorDialogHelper.showErrorDialogWithCode(context, errorMessage, finalErrorCode);
                    callback.onError(errorMessage, finalErrorCode);
                    contextManager.reset();
                }
            } else {
                try {
                    String errorJson = response.errorBody() != null ? response.errorBody().string() : null;

                    if (errorJson != null) {
                        JSONObject errorObj = new JSONObject(errorJson);
                        String errorMessage = errorObj.optString("error", "Validation failed");
                        String errorCode = errorObj.optString("errorCode", "VALIDATION_FAILED");

                        ErrorDialogHelper.showErrorDialogWithCode(context, errorMessage, errorCode);
                        callback.onError(errorMessage, errorCode);
                    } else {
                        ErrorDialogHelper.showErrorDialogWithCode(context, "Unknown server error", "UNKNOWN_ERROR");
                        callback.onError("Unknown server error", "UNKNOWN_ERROR");
                    }
                } catch (Exception e) {
                    String errorMsg = "Failed to parse error: " + e.getMessage();
                    ErrorDialogHelper.showErrorDialogWithCode(context, errorMsg, "ERROR_PARSE_FAILED");
                    callback.onError(errorMsg, "ERROR_PARSE_FAILED");
                }
                contextManager.reset();
            }
        }

        @Override
        public void onFailure(Call<Map<String, Object>> call, Throwable t) {
            loadingDialog.dismiss(); // Hide loading on failure
            String errorMsg = "Network error: " + t.getMessage();
            ErrorDialogHelper.showErrorDialogWithCode(context, errorMsg, "NETWORK_ERROR");
            callback.onError(errorMsg, "NETWORK_ERROR");
            contextManager.reset();
        }
    });
}


    /**
     * Checks whether the current user already owns a one‑time or repurchase
     * product.
     *
     * @param productId product key
     * @param callback  result callback; {@code onResult(true, data)} if owned
     */
    public void isUserPurchased(String productId, CheckCallback callback) {
        if (userId == null || userId.isEmpty()) {
            callback.onError("Could not get device ID", "MISSING_DEVICE_ID");
            return;
        }

        if (projectName == null || projectName.isEmpty()) {
            callback.onError("Project name is required", "MISSING_PROJECT_NAME");
            return;
        }

        // Prepare request data matching checkUserPurchased expected params
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("projectName", projectName);
        requestData.put("productId", productId);
        requestData.put("userId", userId);

        Call<Map<String, Object>> call = apiService.checkUserPurchased(requestData);
        call.enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> responseBody = response.body();
                    Boolean success = (Boolean) responseBody.get("success");

                    if (Boolean.TRUE.equals(success)) {
                        Map<String, Object> responseData = (Map<String, Object>) responseBody.get("data");
                        Boolean purchased = (Boolean) responseData.get("purchased");
                        Map<String, Object> purchaseData = (Map<String, Object>) responseData.get("purchaseData");
                        callback.onResult(Boolean.TRUE.equals(purchased), purchaseData);
                    } else {
                        String error = (String) responseBody.get("message"); // Cloud function uses "message" for error
                        String errorCode = "CHECK_FAILED"; // Cloud function doesn't return errorCode for this
                        callback.onError(error != null ? error : "Failed to check purchase status", errorCode);
                    }
                } else {
                    try {
                        String errorJson = response.errorBody() != null ? response.errorBody().string() : null;

                        if (errorJson != null) {
                            JSONObject errorObj = new JSONObject(errorJson);
                            String errorMessage = errorObj.optString("error", "Validation failed");
                            String errorCode = errorObj.optString("errorCode", "VALIDATION_FAILED");

                            callback.onError(errorMessage, errorCode);
                        } else {
                            callback.onError("Unknown server error", "UNKNOWN_ERROR");
                        }
                    } catch (Exception e) {
                        callback.onError("Failed to parse error: " + e.getMessage(), "ERROR_PARSE_FAILED");
                    }
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage(), "NETWORK_ERROR");
            }
        });
    }

    /**
     * Checks if the current user has an <em>active</em> subscription.
     *
     * @param productId subscription product key
     * @param callback  result callback
     */
    public void isUserSubscribed(String productId, CheckCallback callback) {
        if (userId == null || userId.isEmpty()) {
            callback.onError("Could not get device ID", "MISSING_DEVICE_ID");
            return;
        }

        if (projectName == null || projectName.isEmpty()) {
            callback.onError("Project name is required", "MISSING_PROJECT_NAME");
            return;
        }

        // Prepare request data matching checkUserSubscribed expected params
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("projectName", projectName);
        requestData.put("productId", productId);
        requestData.put("userId", userId);

        Call<Map<String, Object>> call = apiService.checkUserSubscribed(requestData);
        call.enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> responseBody = response.body();
                    Boolean success = (Boolean) responseBody.get("success");

                    if (Boolean.TRUE.equals(success)) {
                        Map<String, Object> responseData = (Map<String, Object>) responseBody.get("data");
                        Boolean subscribed = (Boolean) responseData.get("subscribed");
                        Map<String, Object> subscriptionData = (Map<String, Object>) responseData.get("subscriptionData");
                        callback.onResult(Boolean.TRUE.equals(subscribed), subscriptionData);
                    } else {
                        String error = (String) responseBody.get("message"); // Cloud function uses "message" for error
                        String errorCode = "CHECK_FAILED"; // Cloud function doesn't return errorCode for this
                        callback.onError(error != null ? error : "Failed to check subscription status", errorCode);
                    }
                } else {
                    try {
                        String errorJson = response.errorBody() != null ? response.errorBody().string() : null;

                        if (errorJson != null) {
                            JSONObject errorObj = new JSONObject(errorJson);
                            String errorMessage = errorObj.optString("error", "Validation failed");
                            String errorCode = errorObj.optString("errorCode", "VALIDATION_FAILED");

                            callback.onError(errorMessage, errorCode);
                        } else {
                            callback.onError("Unknown server error", "UNKNOWN_ERROR");
                        }
                    } catch (Exception e) {
                        callback.onError("Failed to parse error: " + e.getMessage(), "ERROR_PARSE_FAILED");
                    }
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage(), "NETWORK_ERROR");
            }
        });
    }

    /**
     * Retrieves the user’s full subscription history.
     *
     * @param callback invoked with a list/array from the back‑end
     */
    public void getUserSubscriptions(PurchasesCallback callback) {
        if (userId == null || userId.isEmpty()) {
            callback.onError("Could not get device ID", "MISSING_DEVICE_ID");
            return;
        }

        if (projectName == null || projectName.isEmpty()) {
            callback.onError("Project name is required", "MISSING_PROJECT_NAME");
            return;
        }

        // Prepare request data matching getSubscriptions expected params
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("projectName", projectName);
        requestData.put("userId", userId); // This will filter subscriptions for this user

        Call<Map<String, Object>> call = apiService.getSubscriptions(requestData);
        call.enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> responseBody = response.body();
                    Boolean success = (Boolean) responseBody.get("success");

                    if (Boolean.TRUE.equals(success)) {
                        Object subscriptionsData = responseBody.get("data");
                        callback.onSuccess(subscriptionsData);
                    } else {
                        String error = (String) responseBody.get("message"); // Cloud function uses "message"
                        callback.onError(error != null ? error : "Failed to get subscriptions", "GET_SUBSCRIPTIONS_FAILED");
                    }
                } else {
                    try {
                        String errorJson = response.errorBody() != null ? response.errorBody().string() : null;

                        if (errorJson != null) {
                            JSONObject errorObj = new JSONObject(errorJson);
                            String errorMessage = errorObj.optString("error", "Validation failed");
                            String errorCode = errorObj.optString("errorCode", "VALIDATION_FAILED");

                            callback.onError(errorMessage, errorCode);
                        } else {
                            callback.onError("Unknown server error", "UNKNOWN_ERROR");
                        }
                    } catch (Exception e) {
                        callback.onError("Failed to parse error: " + e.getMessage(), "ERROR_PARSE_FAILED");
                    }
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage(), "NETWORK_ERROR");
            }
        });
    }

    /**
     * Internal bridge from {@link PurchaseDialogManager} to the purchase
     * pipeline.
     *
     * @param paymentMethod one of {@code card} or {@code paypal}
     * @param cardNumber    raw card digits (if card)
     * @param expiry        <code>MM/YY</code> (if card)
     * @param cvv           3–4 digit code (if card)
     * @param name          cardholder name (if card)
     */
    @Override
    public void onPurchaseRequested(String paymentMethod, String cardNumber, String expiry, String cvv, String name) {
        processPurchase(paymentMethod, cardNumber, expiry, cvv, name);
    }

    @Override
    public void onPurchaseCancelled() {
        PurchaseCallback callback = contextManager.getCurrentPurchaseCallback();
        if (callback != null) {
            callback.onError("Purchase cancelled by user", "USER_CANCELLED");
        }
        contextManager.reset();
    }

    // Call the server through
    private void processPurchase(String paymentMethod, String cardNumber, String expiry, String cvv, String name) {
        if (!contextManager.isValidContext()) {
            PurchaseCallback callback = contextManager.getCurrentPurchaseCallback();
            if (callback != null) {
                callback.onError("Invalid purchase context", "INVALID_CONTEXT");
            }
            return;
        }

        // Prepare purchase data for Firebase Function matching the expected schema
        Map<String, Object> purchaseData = new HashMap<>();
        purchaseData.put("projectName", projectName);  // Cloud function expects this
        purchaseData.put("userId", userId);
        purchaseData.put("productId", contextManager.getCurrentItemKey());  // Changed from itemKey to productId
        purchaseData.put("paymentMethod", paymentMethod);

        // Add payment details based on method
        if (InAppConstants.PAYMENT_METHOD_CARD.equals(paymentMethod)) {
            Map<String, Object> cardData = new HashMap<>();
            cardData.put("cardNumber", cardNumber);
            cardData.put("expiry", expiry);
            cardData.put("cvv", cvv);
            cardData.put("name", name);
            // Detect card type based on card number
            cardData.put("cardType", detectCardType(cardNumber));
            purchaseData.put("cardData", cardData);
        } else if (InAppConstants.PAYMENT_METHOD_PAYPAL.equals(paymentMethod)) {
            // Add PayPal data if needed
            Map<String, Object> paypalData = new HashMap<>();
            // Add PayPal specific fields here if you have them
            purchaseData.put("paypalData", paypalData);
        }

        // Make Retrofit call to Firebase Function
        Call<Map<String, Object>> call = apiService.processPurchase(purchaseData);
        call.enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                PurchaseCallback callback = contextManager.getCurrentPurchaseCallback();

                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> responseBody = response.body();
                    Boolean success = (Boolean) responseBody.get("success");

                    if (Boolean.TRUE.equals(success)) {
                        String message = (String) responseBody.get("message");
                        Map<String, Object> responseData = (Map<String, Object>) responseBody.get("data");

                        if (callback != null) {
                            callback.onSuccess(
                                    message != null ? message : "Purchase completed successfully",
                                    responseData
                            );
                        }
                    } else {
                        String error = (String) responseBody.get("error");
                        String errorCode = (String) responseBody.get("errorCode");

                        if (callback != null) {
                            callback.onError(
                                    error != null ? error : "Purchase failed",
                                    errorCode != null ? errorCode : "PURCHASE_FAILED"
                            );
                        }
                    }
                } else if (context != null) {
                    try {
                        String errorJson = response.errorBody() != null ? response.errorBody().string() : null;

                        if (errorJson != null) {
                            JSONObject errorObj = new JSONObject(errorJson);
                            String errorMessage = errorObj.optString("error", "Validation failed");
                            String errorCode = errorObj.optString("errorCode", "VALIDATION_FAILED");

                            callback.onError(errorMessage, errorCode);
                        } else {
                            callback.onError("Unknown server error", "UNKNOWN_ERROR");
                        }
                    } catch (Exception e) {
                        callback.onError("Failed to parse error: " + e.getMessage(), "ERROR_PARSE_FAILED");
                    }
                }
                contextManager.reset();
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                PurchaseCallback callback = contextManager.getCurrentPurchaseCallback();
                if (callback != null) {
                    callback.onError("Network error: " + t.getMessage(), "NETWORK_ERROR");
                }
                contextManager.reset();
            }
        });
    }

    // Helper method to detect card type
    private String detectCardType(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return "unknown";
        }

        String cleanNumber = cardNumber.replaceAll("\\s+", "");

        if (cleanNumber.startsWith("4")) {
            return "visa";
        } else if (cleanNumber.startsWith("5") || cleanNumber.startsWith("2")) {
            return "mastercard";
        } else if (cleanNumber.startsWith("3")) {
            return "amex";
        } else if (cleanNumber.startsWith("6")) {
            return "discover";
        }

        return "unknown";
    }

    /**
     * Forces the generic “Complete your payment” dialog to appear.
     * Useful if you want to open the dialog outside the normal validation flow.
     */
    public void show() {
        dialogManager.showGeneralDialog("Payment", "Complete your payment");
    }

    /**
     * {@inheritDoc}
     * <p>Implements {@link Popupable} so that a host component can simply call
     * {@code sdk.popUp(context)} without holding additional UI logic.</p>
     */
    @Override
    public void popUp(Context context) {
        this.context = context;
        show();
    }
}