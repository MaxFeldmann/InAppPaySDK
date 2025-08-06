package com.dev.inapppaysdk.constants;

/**
 * {@code InAppConstants} defines constant values used throughout the In-App Purchase SDK.
 * <p>
 * These constants help standardize item types, payment methods, and default currency values
 * across the SDK logic and UI.
 */
public class InAppConstants {

    // ─────────────────────────────────────────────────────────────────────────────
    // Item Types
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Represents a one-time purchase item (non-repeating, single charge).
     */
    public static final String TYPE_ONETIME = "onetime";

    /**
     * Represents an item that can be repurchased multiple times (e.g., consumables).
     */
    public static final String TYPE_REPURCHASE = "repurchase";

    /**
     * Represents a recurring subscription item (e.g., monthly/annual access).
     */
    public static final String TYPE_SUBSCRIPTION = "subscription";

    // ─────────────────────────────────────────────────────────────────────────────
    // Payment Methods
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Indicates the credit/debit card payment method.
     */
    public static final String PAYMENT_METHOD_CARD = "card";

    /**
     * Indicates the PayPal payment method.
     */
    public static final String PAYMENT_METHOD_PAYPAL = "paypal";

    // ─────────────────────────────────────────────────────────────────────────────
    // Currency
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Default currency used for all purchases (USD - United States Dollar).
     */
    public static final String DEFAULT_CURRENCY = "USD";
}