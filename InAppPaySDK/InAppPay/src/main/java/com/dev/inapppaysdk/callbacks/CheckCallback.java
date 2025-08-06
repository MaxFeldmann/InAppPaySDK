package com.dev.inapppaysdk.callbacks;

import java.util.Map;

/**
 * Callback used for verifying user eligibility or state.
 */
public interface CheckCallback {
    void onResult(boolean result, Map<String, Object> data);
    void onError(String error, String errorCode);
}
