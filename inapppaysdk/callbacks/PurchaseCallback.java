package com.dev.inapppaysdk.callbacks;

import java.util.Map;

public interface PurchaseCallback {
    void onSuccess(String message, Map<String, Object> data);
    void onError(String error, String errorCode);
}