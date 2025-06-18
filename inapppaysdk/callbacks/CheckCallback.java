package com.dev.inapppaysdk.callbacks;

import java.util.Map;

public interface CheckCallback {
    void onResult(boolean result, Map<String, Object> data);
    void onError(String error, String errorCode);
}
