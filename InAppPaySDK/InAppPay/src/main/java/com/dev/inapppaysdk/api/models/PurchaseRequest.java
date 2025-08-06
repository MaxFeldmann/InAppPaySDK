package com.dev.inapppaysdk.api.models;

import java.util.Map;

public class PurchaseRequest {
    private String userId;
    private String itemKey;
    private String itemType;
    private String paymentMethod;
    private Map<String, Object> cardData;
    private Map<String, Object> itemData;

    public PurchaseRequest(String userId, String itemKey, String itemType, String paymentMethod) {
        this.userId = userId;
        this.itemKey = itemKey;
        this.itemType = itemType;
        this.paymentMethod = paymentMethod;
    }

    // Getters and setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getItemKey() { return itemKey; }
    public void setItemKey(String itemKey) { this.itemKey = itemKey; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Map<String, Object> getCardData() { return cardData; }
    public void setCardData(Map<String, Object> cardData) { this.cardData = cardData; }

    public Map<String, Object> getItemData() { return itemData; }
    public void setItemData(Map<String, Object> itemData) { this.itemData = itemData; }
}
