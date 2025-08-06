package com.dev.inapppaysdk.callbacks;

import java.util.Map;

/**
 * Callback used when a purchase is processed.
 */
public interface PurchaseCallback {
    void onSuccess(String message, Map<String, Object> data);
    void onError(String error, String errorCode);
}