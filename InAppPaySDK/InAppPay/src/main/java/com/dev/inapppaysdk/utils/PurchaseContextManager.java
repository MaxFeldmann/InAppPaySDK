package com.dev.inapppaysdk.utils;
import static com.dev.inapppaysdk.constants.InAppConstants.DEFAULT_CURRENCY;
import com.dev.inapppaysdk.callbacks.PurchaseCallback;
import java.util.Map;
/**
 * Singleton manager that holds purchase context information
 * such as item details, price, and callbacks during the purchase lifecycle.
 *
 * <p>Use this to pass purchase state across UI components during SDK flows.</p>
 */
public class PurchaseContextManager {
    private String currentItemKey;
    private PurchaseCallback currentPurchaseCallback;
    private String currentItemType;
    private Map<String, Object> currentItemData;
    private String price;
    private String label;
    private static PurchaseContextManager instance;
    /** Private constructor for singleton pattern. */
    private PurchaseContextManager() {}
    /**
     * Retrieves the singleton instance of this manager.
     * @return a shared instance of PurchaseContextManager
     */
    public static synchronized PurchaseContextManager getInstance() {
        if (instance == null) {
            instance = new PurchaseContextManager();
        }
        return instance;
    }
    /**
     * Sets the current item key and purchase callback.
     *
     * @param itemKey  the key or identifier of the item being purchased
     * @param callback the purchase callback for result handling
     */
    public void setPurchaseContext(String itemKey, PurchaseCallback callback) {
        this.currentItemKey = itemKey;
        this.currentPurchaseCallback = callback;
    }
    /**
     * Sets the current item data and item type, including parsing out price and label fields.
     *
     * @param itemData a map of item metadata (expected keys: "price", "currency")
     * @param itemType the type of purchase ("subscription", "one-time", etc.)
     */
    public void setItemData(Map<String, Object> itemData, String itemType) {
        this.currentItemData = itemData;
        this.currentItemType = itemType;
        if (itemData != null) {
            // Handle price field - could be String, Double, Integer, or other Number types
            Object priceObj = itemData.get("price");
            if (priceObj != null) {
                if (priceObj instanceof String) {
                    price = (String) priceObj;
                } else if (priceObj instanceof Number) {
                    // Convert any Number type to String
                    price = String.valueOf(priceObj);
                } else {
                    // Fallback: convert to string
                    price = priceObj.toString();
                }
            }
            
            // Handle currency field - should be String but check to be safe
            Object currencyObj = itemData.get("currency");
            if (currencyObj != null) {
                if (currencyObj instanceof String) {
                    label = (String) currencyObj;
                } else {
                    // Fallback: convert to string
                    label = currencyObj.toString();
                }
            }
            
            // If label is empty use USD as default
            if (label == null || label.isEmpty()) {
                label = DEFAULT_CURRENCY;
            }
        }
    }
    /**
     * Gets the current item data
     * @return Map containing item data or null if not set
     */
    public Map<String, Object> getItemData() {
        return currentItemData;
    }
    /** Clears all current purchase context information. */
    public void reset() {
        currentItemKey = null;
        currentPurchaseCallback = null;
        currentItemType = null;
        currentItemData = null;
        price = null;
        label = null;
    }
    /**
     * Checks if the purchase context is currently valid.
     * @return true if item key, type, and data are all set
     */
    public boolean isValidContext() {
        return currentItemKey != null && currentItemType != null && currentItemData != null;
    }
    public String getCurrentItemKey() { return currentItemKey; }
    public PurchaseCallback getCurrentPurchaseCallback() { return currentPurchaseCallback; }
    public String getCurrentItemType() { return currentItemType; }
    public Map<String, Object> getCurrentItemData() { return currentItemData; }
    public String getPrice() { return price; }
    public String getLabel() { return label; }
    public void setPrice(String price) { this.price = price; }
    public void setLabel(String label) { this.label = label; }
}