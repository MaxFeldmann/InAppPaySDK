package com.dev.inapppaysdk.api.models;

import java.util.Map;

public class ApiResponse {
    private boolean success;
    private String message;
    private String error;
    private String errorCode;
    private Map<String, Object> data;
    private Map<String, Object> itemData;
    private Boolean purchased;
    private Boolean subscribed;
    private Map<String, Object> purchaseData;
    private Map<String, Object> subscriptionData;

    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }

    public Map<String, Object> getItemData() { return itemData; }
    public void setItemData(Map<String, Object> itemData) { this.itemData = itemData; }

    public Boolean getPurchased() { return purchased; }
    public void setPurchased(Boolean purchased) { this.purchased = purchased; }

    public Boolean getSubscribed() { return subscribed; }
    public void setSubscribed(Boolean subscribed) { this.subscribed = subscribed; }

    public Map<String, Object> getPurchaseData() { return purchaseData; }
    public void setPurchaseData(Map<String, Object> purchaseData) { this.purchaseData = purchaseData; }

    public Map<String, Object> getSubscriptionData() { return subscriptionData; }
    public void setSubscriptionData(Map<String, Object> subscriptionData) { this.subscriptionData = subscriptionData; }
}
