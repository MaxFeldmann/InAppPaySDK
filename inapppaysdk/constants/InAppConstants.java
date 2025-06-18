package com.dev.inapppaysdk.constants;

public class InAppConstants {
    // Item types
    public static final String TYPE_ONETIME = "onetime";
    public static final String TYPE_REPURCHASE = "repurchase";
    public static final String TYPE_SUBSCRIPTION = "subscription";

    // Error codes
    public static final String ERROR_MISSING_USER_ID = "MISSING_USER_ID";
    public static final String ERROR_INVALID_ITEM_TYPE = "INVALID_ITEM_TYPE";
    public static final String ERROR_VALIDATION_FAILED = "VALIDATION_FAILED";
    public static final String ERROR_FUNCTION_CALL_FAILED = "FUNCTION_CALL_FAILED";
    public static final String ERROR_USER_CANCELLED = "USER_CANCELLED";
    public static final String ERROR_INVALID_CONTEXT = "INVALID_CONTEXT";
    public static final String ERROR_PURCHASE_FAILED = "PURCHASE_FAILED";
    public static final String ERROR_CHECK_FAILED = "CHECK_FAILED";
    public static final String ERROR_SERVER_ERROR = "SERVER_ERROR";
    public static final String ERROR_NETWORK_ERROR = "NETWORK_ERROR";

    // Payment methods
    public static final String PAYMENT_METHOD_CARD = "card";
    public static final String PAYMENT_METHOD_PAYPAL = "paypal";

    public static final String DEFAULT_CURRENCY = "USD";
}