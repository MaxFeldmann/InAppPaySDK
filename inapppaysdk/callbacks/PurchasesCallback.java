package com.dev.inapppaysdk.callbacks;

public interface PurchasesCallback {
    void onError(String couldNotGetDeviceId, String missingDeviceId);

    void onSuccess(Object purchasesData);
}
