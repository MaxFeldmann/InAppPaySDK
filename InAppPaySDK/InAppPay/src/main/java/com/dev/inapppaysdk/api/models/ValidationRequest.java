package com.dev.inapppaysdk.api.models;

public class ValidationRequest {
    private String itemKey;
    private String userId;

    public ValidationRequest(String itemKey, String userId) {
        this.itemKey = itemKey;
        this.userId = userId;
    }

    public String getItemKey() { return itemKey; }
    public String getUserId() { return userId; }
}
