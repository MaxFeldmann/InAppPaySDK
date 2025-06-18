package com.dev.inapppaysdk;

import android.content.Context;
import com.dev.inapppaysdk.api.ApiClient;
import com.dev.inapppaysdk.api.InAppApiService;
import com.dev.inapppaysdk.callbacks.*;
import com.dev.inapppaysdk.utils.DeviceUtils;
import com.dev.inapppaysdk.utils.PurchaseContextManager;
import com.dev.inapppaysdk.ui.PurchaseDialogManager;
import com.dev.inapppaysdk.interfaces.Popupable;
import com.dev.inapppaysdk.constants.InAppConstants;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class InAppPaySDK implements Popupable, PurchaseDialogManager.PurchaseDialogCallback {

    private Context context;
    private CardCallback cardCallback;
    private String userId;
    private String projectName;
    private String userCountry;
    private InAppApiService apiService;
    private PurchaseContextManager contextManager;
    private PurchaseDialogManager dialogManager;

    private InAppPaySDK() {
        apiService = ApiClient.getApiService();
        contextManager = PurchaseContextManager.getInstance();
    }

    public InAppPaySDK(String projectName, Context context, CardCallback callback) {
        this.context = context;
        this.cardCallback = callback;
        this.apiService = ApiClient.getApiService();
        this.contextManager = PurchaseContextManager.getInstance();
        this.dialogManager = new PurchaseDialogManager(context, callback, this);
        this.projectName = projectName;
        this.userId = DeviceUtils.getAndroidId(context);
        this.userCountry = DeviceUtils.detectUserCountry(context);
    }

    // Remove currency methods since we're using USD by default
    public String getLabel() {
        return contextManager.getLabel();
    }

    public InAppPaySDK setLabel(String label) {
        contextManager.setLabel(label);
        return this;
    }

    public String getAmount() {
        return contextManager.getAmount();
    }

    public void setAmount(String amount) {
        contextManager.setAmount(amount);
    }

    // Get the user ID (Android ID)
    public String getUserId() {
        return userId;
    }

    // Main purchase function - calls Firebase Functions
    public void buy(String productId, PurchaseCallback callback) {
        if (userId == null || userId.isEmpty()) {
            callback.onError("Could not get device ID", "MISSING_DEVICE_ID");
            return;
        }

        if (projectName == null || projectName.isEmpty()) {
            callback.onError("Project name is required", "MISSING_PROJECT_NAME");
            return;
        }

        // Set purchase context in manager
        contextManager.setPurchaseContext(productId, callback);

        // Prepare request data for Firebase Function
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("projectName", projectName);
        requestData.put("productId", productId);
        requestData.put("userId", userId);

        // Make Retrofit call to Firebase Function
        Call<Map<String, Object>> call = apiService.validateItemForPurchase(requestData);
        call.enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> responseBody = response.body();
                    Boolean success = (Boolean) responseBody.get("success");

                    if (Boolean.TRUE.equals(success)) {
                        // Extract item data from Firebase Function response
                        Map<String, Object> itemData = (Map<String, Object>) responseBody.get("data");
                        String itemType = (String) itemData.get("type");

                        // Set item data in context manager
                        contextManager.setItemData(itemData, itemType);

                        // Show appropriate popup based on item type
                        switch (itemType) {
                            case InAppConstants.TYPE_ONETIME:
                                dialogManager.showOnetimeDialog();
                                break;
                            case InAppConstants.TYPE_REPURCHASE:
                                dialogManager.showRepurchaseDialog();
                                break;
                            case InAppConstants.TYPE_SUBSCRIPTION:
                                dialogManager.showSubscriptionDialog();
                                break;
                            default:
                                callback.onError("Unknown item type: " + itemType, "INVALID_ITEM_TYPE");
                                contextManager.reset();
                                break;
                        }
                    } else {
                        String error = (String) responseBody.get("error");
                        String errorCode = (String) responseBody.get("errorCode");
                        callback.onError(error != null ? error : "Item validation failed",
                                errorCode != null ? errorCode : "VALIDATION_FAILED");
                        contextManager.reset();
                    }
                } else {
                    callback.onError("Server error: " + response.code(), "SERVER_ERROR");
                    contextManager.reset();
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage(), "NETWORK_ERROR");
                contextManager.reset();
            }
        });
    }

    // Check if user purchased a one-time or repurchase item
    public void isUserPurchased(String productId, CheckCallback callback) {
        if (userId == null || userId.isEmpty()) {
            callback.onError("Could not get device ID", "MISSING_DEVICE_ID");
            return;
        }

        if (projectName == null || projectName.isEmpty()) {
            callback.onError("Project name is required", "MISSING_PROJECT_NAME");
            return;
        }

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
                        String error = (String) responseBody.get("error");
                        String errorCode = (String) responseBody.get("errorCode");
                        callback.onError(error != null ? error : "Failed to check purchase status",
                                errorCode != null ? errorCode : "CHECK_FAILED");
                    }
                } else {
                    callback.onError("Server error: " + response.code(), "SERVER_ERROR");
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage(), "NETWORK_ERROR");
            }
        });
    }

    // Check if user has active subscription
    public void isUserSubscribed(String productId, CheckCallback callback) {
        if (userId == null || userId.isEmpty()) {
            callback.onError("Could not get device ID", "MISSING_DEVICE_ID");
            return;
        }

        if (projectName == null || projectName.isEmpty()) {
            callback.onError("Project name is required", "MISSING_PROJECT_NAME");
            return;
        }

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
                        String error = (String) responseBody.get("error");
                        String errorCode = (String) responseBody.get("errorCode");
                        callback.onError(error != null ? error : "Failed to check subscription status",
                                errorCode != null ? errorCode : "CHECK_FAILED");
                    }
                } else {
                    callback.onError("Server error: " + response.code(), "SERVER_ERROR");
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage(), "NETWORK_ERROR");
            }
        });
    }

    // Get user's purchase history
    public void getUserPurchases(PurchasesCallback callback) {
        if (userId == null || userId.isEmpty()) {
            callback.onError("Could not get device ID", "MISSING_DEVICE_ID");
            return;
        }

        if (projectName == null || projectName.isEmpty()) {
            callback.onError("Project name is required", "MISSING_PROJECT_NAME");
            return;
        }

        Map<String, Object> requestData = new HashMap<>();
        requestData.put("projectName", projectName);
        requestData.put("userId", userId);

        Call<Map<String, Object>> call = apiService.getPurchases(requestData);
        call.enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> responseBody = response.body();
                    Boolean success = (Boolean) responseBody.get("success");

                    if (Boolean.TRUE.equals(success)) {
                        Object purchasesData = responseBody.get("data");
                        callback.onSuccess(purchasesData);
                    } else {
                        String error = (String) responseBody.get("error");
                        String errorCode = (String) responseBody.get("errorCode");
                        callback.onError(error != null ? error : "Failed to get purchases",
                                errorCode != null ? errorCode : "GET_PURCHASES_FAILED");
                    }
                } else {
                    callback.onError("Server error: " + response.code(), "SERVER_ERROR");
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage(), "NETWORK_ERROR");
            }
        });
    }


    // Popup methods - now delegated to PurchaseDialogManager
    public void popupOnetime() {
        dialogManager.showOnetimeDialog();
    }

    public void popupRepurchase() {
        dialogManager.showRepurchaseDialog();
    }

    public void popupSubscription() {
        dialogManager.showSubscriptionDialog();
    }

    // PurchaseDialogManager.PurchaseDialogCallback implementation
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

    private void processPurchase(String paymentMethod, String cardNumber, String expiry, String cvv, String name) {
        if (!contextManager.isValidContext()) {
            PurchaseCallback callback = contextManager.getCurrentPurchaseCallback();
            if (callback != null) {
                callback.onError("Invalid purchase context", "INVALID_CONTEXT");
            }
            return;
        }

        // Prepare purchase data for Firebase Function
        Map<String, Object> purchaseData = new HashMap<>();
        purchaseData.put("userId", userId);
        purchaseData.put("itemKey", contextManager.getCurrentItemKey());
        purchaseData.put("itemType", contextManager.getCurrentItemType());
        purchaseData.put("paymentMethod", paymentMethod);
        purchaseData.put("currency", InAppConstants.DEFAULT_CURRENCY);

        // Add payment details based on method
        if (InAppConstants.PAYMENT_METHOD_CARD.equals(paymentMethod)) {
            Map<String, Object> cardData = new HashMap<>();
            cardData.put("cardNumber", cardNumber);
            cardData.put("expiry", expiry);
            cardData.put("cvv", cvv);
            cardData.put("name", name);
            purchaseData.put("cardData", cardData);
        }

        // Add any additional item data from server validation
        purchaseData.put("itemData", contextManager.getCurrentItemData());

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
                } else {
                    if (callback != null) {
                        callback.onError("Server error: " + response.code(), "SERVER_ERROR");
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

    public void show() {
        dialogManager.showGeneralDialog("Payment", "Complete your payment");
    }

    @Override
    public void popUp(Context context) {
        this.context = context;
        show();
    }
}