package com.dev.inapppaysdk.utils;

import com.dev.inapppaysdk.callbacks.PurchaseCallback;
import java.util.Map;

public class PurchaseContextManager {
    private String currentItemKey;
    private PurchaseCallback currentPurchaseCallback;
    private String currentItemType;
    private Map<String, Object> currentItemData;
    private String amount;
    private String label;

    private static PurchaseContextManager instance;

    private PurchaseContextManager() {}

    public static PurchaseContextManager getInstance() {
        if (instance == null) {
            instance = new PurchaseContextManager();
        }
        return instance;
    }

    public void setPurchaseContext(String itemKey, PurchaseCallback callback) {
        this.currentItemKey = itemKey;
        this.currentPurchaseCallback = callback;
    }

    public void setItemData(Map<String, Object> itemData, String itemType) {
        this.currentItemData = itemData;
        this.currentItemType = itemType;

        if (itemData != null) {
            this.amount = (String) itemData.get("amount");
            this.label = (String) itemData.get("label");
        }
    }

    public void reset() {
        currentItemKey = null;
        currentPurchaseCallback = null;
        currentItemType = null;
        currentItemData = null;
        amount = null;
        label = null;
    }

    public boolean isValidContext() {
        return currentItemKey != null && currentItemType != null && currentItemData != null;
    }

    // Getters
    public String getCurrentItemKey() { return currentItemKey; }
    public PurchaseCallback getCurrentPurchaseCallback() { return currentPurchaseCallback; }
    public String getCurrentItemType() { return currentItemType; }
    public Map<String, Object> getCurrentItemData() { return currentItemData; }
    public String getAmount() { return amount; }
    public String getLabel() { return label; }

    // Manual setters for backward compatibility
    public void setAmount(String amount) { this.amount = amount; }
    public void setLabel(String label) { this.label = label; }
}
