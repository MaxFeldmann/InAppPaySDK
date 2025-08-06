package com.dev.inapppaysdk.utils;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;

public class ErrorDialogHelper {

    /**
     * Shows an error dialog with the provided error message
     * @param context The context to show the dialog
     * @param title The title of the error dialog
     * @param message The error message to display
     */
    public static void showErrorDialog(Context context, String title, String message) {
        showErrorDialog(context, title, message, null);
    }

    /**
     * Shows an error dialog with the provided error message and callback
     * @param context The context to show the dialog
     * @param title The title of the error dialog
     * @param message The error message to display
     * @param onDismiss Optional callback when dialog is dismissed
     */
    public static void showErrorDialog(Context context, String title, String message, Runnable onDismiss) {
        if (context == null) {
            return;
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setTitle(title != null ? title : "Error")
                .setMessage(message != null ? message : "An error occurred")
                .setPositiveButton("Okay", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                        if (onDismiss != null) {
                            onDismiss.run();
                        }
                    }
                })
                .setCancelable(false) // Prevent dismissing by tapping outside
                .show();
    }

    /**
     * Shows an error dialog with error code information
     * @param context The context to show the dialog
     * @param message The error message to display
     * @param errorCode The error code
     */
    public static void showErrorDialogWithCode(Context context, String message, String errorCode) {
        String userFriendlyMessage = getUserFriendlyMessage(message, errorCode);
        showErrorDialog(context, "Purchase Error", userFriendlyMessage);
    }

    /**
     * Converts technical error messages to user-friendly ones
     * @param originalMessage The original error message from server
     * @param errorCode The error code from server
     * @return User-friendly error message
     */
    private static String getUserFriendlyMessage(String originalMessage, String errorCode) {
        if (errorCode == null || errorCode.isEmpty()) {
            return originalMessage;
        }

        switch (errorCode) {
            case "PROJECT_NOT_FOUND":
                return "This app is not properly configured. Please contact support.";

            case "PRODUCT_NOT_FOUND":
                return "The selected item is no longer available.";

            case "PRODUCT_INACTIVE":
                return "This item is currently unavailable for purchase.";

            case "MISSING_CARD_DATA":
                return "Credit card information is required to complete this purchase.";

            case "MISSING_PAYPAL_DATA":
                return "PayPal information is required to complete this purchase.";

            case "INVALID_PAYMENT_METHOD":
                return "Please select a valid payment method.";

            case "ALREADY_PURCHASED":
                return "You have already purchased this item.";

            case "ALREADY_SUBSCRIBED":
                return "You already have an active subscription for this item.";

            case "DATABASE_ERROR":
                return "We're experiencing technical difficulties. Your payment was not charged. Please try again later.";

            case "MISSING_DEVICE_ID":
                return "Device identification failed. Please restart the app and try again.";

            case "MISSING_PROJECT_NAME":
                return "App configuration error. Please contact support.";

            case "INVALID_ITEM_TYPE":
                return "This item type is not supported.";

            case "VALIDATION_FAILED":
                return "Unable to verify purchase details. Please try again.";

            case "NETWORK_ERROR":
                return "Check your internet connection and try again.";

            case "UNKNOWN_ERROR":
                return "An unexpected error occurred. Please try again.";

            case "ERROR_PARSE_FAILED":
                return "Communication error with server. Please try again.";

            // Handle payment-related errors that start with common patterns
            default:
                if (originalMessage != null) {
                    if (originalMessage.contains("Transaction failed:")) {
                        return handlePaymentErrors(originalMessage, errorCode);
                    } else if (originalMessage.contains("Network error:")) {
                        return "Check your internet connection and try again.";
                    }
                }

                // If no specific handling, return a generic user-friendly message
                return "Purchase could not be completed. Please try again or contact support.";
        }
    }

    /**
     * Handles payment-specific error messages
     * @param originalMessage The original error message
     * @param errorCode The error code
     * @return User-friendly payment error message
     */
    private static String handlePaymentErrors(String originalMessage, String errorCode) {
        String lowerMessage = originalMessage.toLowerCase();

        if (lowerMessage.contains("card declined") || lowerMessage.contains("insufficient funds")) {
            return "Your card was declined. Please check your card details or try a different payment method.";
        } else if (lowerMessage.contains("card expired") || lowerMessage.contains("expir")) {
            return "Your card has expired. Please use a different payment method.";
        } else if (lowerMessage.contains("invalid card") || lowerMessage.contains("card number")) {
            return "Please check your card number and try again.";
        } else if (lowerMessage.contains("cvv") || lowerMessage.contains("security code")) {
            return "Please check your card's security code and try again.";
        } else if (lowerMessage.contains("paypal")) {
            return "PayPal payment failed. Please try again or use a different payment method.";
        } else if (lowerMessage.contains("timeout") || lowerMessage.contains("time out")) {
            return "Payment processing timed out. Please try again.";
        } else {
            return "Payment failed. Please check your payment details and try again.";
        }
    }
}