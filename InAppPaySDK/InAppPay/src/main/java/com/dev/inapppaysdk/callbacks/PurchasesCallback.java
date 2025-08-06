package com.dev.inapppaysdk.callbacks;

/**
 * Callback used when fetching a list of purchases or subscriptions.
 */
public interface PurchasesCallback {
    void onError(String couldNotGetDeviceId, String missingDeviceId);

    void onSuccess(Object purchasesData);
}
