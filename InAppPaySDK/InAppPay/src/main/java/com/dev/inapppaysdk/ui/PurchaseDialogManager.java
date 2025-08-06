package com.dev.inapppaysdk.ui;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.view.ContextThemeWrapper;

import com.dev.inapppaysdk.R;
import com.dev.inapppaysdk.constants.InAppConstants;
import com.dev.inapppaysdk.logic.Validator;
import com.dev.inapppaysdk.logic.Watcher;
import com.dev.inapppaysdk.utils.PurchaseContextManager;
import com.google.android.material.textfield.TextInputLayout;

import java.util.Map;

/**
 * <h1>PurchaseDialogManager</h1>
 *
 * <p>
 * Internal helper that shows styled purchase dialogs based on the product type.
 * It supports one-time, repurchase, and subscription flows with step-by-step UI
 * and field validation.
 * </p>
 *
 * <h2>Usage</h2>
 * <pre>{@code
 * PurchaseDialogManager manager = new PurchaseDialogManager(activity, callback);
 * manager.showOnetimeDialog("Title", "Description");
 * }</pre>
 *
 * <p><strong>Important:</strong> this class requires an Activity context.
 * Never pass Application context, or dialog inflation will crash.</p>
 *
 */
public class PurchaseDialogManager {

    /** Interface for dialog callback events. */
    public interface PurchaseDialogCallback {
        void onPurchaseRequested(String paymentMethod, String cardNumber, String expiry, String cvv, String name);

        void onPurchaseCancelled();
    }

    private Context context;
    private PurchaseDialogCallback dialogCallback;
    private PurchaseContextManager contextManager;

    /**
     * Creates a new purchase dialog manager tied to an Activity context.
     *
     * @param context an Activity context, not application context
     * @param dialogCallback a callback to handle user actions
     * @throws IllegalArgumentException if the context is not an Activity
     */
    public PurchaseDialogManager(Context context, PurchaseDialogCallback dialogCallback) {
        // Ensure we have an Activity context
        if (!(context instanceof Activity)) {
            throw new IllegalArgumentException("Context must be an Activity context");
        }

        this.context = new ContextThemeWrapper(context, R.style.Theme_SDK_Dialog);
        this.dialogCallback = dialogCallback;
        this.contextManager = PurchaseContextManager.getInstance();
    }

    public void showOnetimeDialog(String title, String description) {
        showPurchaseDialog("One-Time Purchase", title, description);
    }

    public void showRepurchaseDialog(String title, String description) {
        showPurchaseDialog("Repurchase Item", title, description);
    }

    public void showSubscriptionDialog(String title, String description) {
        showPurchaseDialog("Subscription", title, description);
    }

    public void showGeneralDialog(String title, String description) {
        showPurchaseDialog(title, null, description);
    }

    private void showPurchaseDialog(String dialogTitle, String productName, String productDescription) {
        // Validate context before showing dialog
        if (context == null) {
            Log.e("Dialog", "Context is null");
            return;
        }

        // Get the base context (Activity) from ContextThemeWrapper
        Context baseContext = ((ContextThemeWrapper) context).getBaseContext();
        if (baseContext instanceof Activity) {
            Activity activity = (Activity) baseContext;
            if (activity.isFinishing() || activity.isDestroyed()) {
                Log.e("Dialog", "Activity is finishing or destroyed");
                return;
            }
        }

        Dialog dialog = new Dialog(context);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);

        View view = LayoutInflater.from(context).inflate(R.layout.sdk_popup, null);
        dialog.setContentView(view);
        dialog.setCanceledOnTouchOutside(false);
        dialog.setCancelable(false);
        dialog.getWindow().setLayout(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );

        setupViews(dialog, view, dialogTitle, productName, productDescription);
        dialog.show();
    }

    private void setupViews(Dialog dialog, View view, String dialogTitle, String productName, String productDescription) {
        ImageView btnClose = view.findViewById(R.id.btnClose);
        TextView amountText = view.findViewById(R.id.amountText);
        TextView titleText = view.findViewById(R.id.titleText);
        TextView productNameText = view.findViewById(R.id.productNameText);
        TextView productDescriptionText = view.findViewById(R.id.productDescriptionText);

        titleText.setText(dialogTitle);

        // Display product information
        if (productName != null && !productName.isEmpty()) {
            productNameText.setText(productName);
            productNameText.setVisibility(View.VISIBLE);
        } else {
            productNameText.setVisibility(View.GONE);
        }

        if (productDescription != null && !productDescription.isEmpty()) {
            productDescriptionText.setText(productDescription);
            productDescriptionText.setVisibility(View.VISIBLE);
        } else {
            productDescriptionText.setVisibility(View.GONE);
        }

        // Display price information
        String price = contextManager.getPrice();
        String label = contextManager.getLabel();

        if (price != null && !price.isEmpty()) {
            // Get item data to check for currency or use default USD
            Map<String, Object> itemData = contextManager.getItemData();
            String currency = "USD"; // Default currency

            if (itemData != null && itemData.containsKey("currency")) {
                currency = (String) itemData.get("currency");
            }

            // Format price display
            String priceDisplay = getCurrencySymbol(currency) + price;
            if (label != null && !label.isEmpty()) {
                amountText.setText(label + ": " + priceDisplay);
            } else {
                amountText.setText("Price: " + priceDisplay);
            }
            amountText.setVisibility(View.VISIBLE);
        } else {
            amountText.setVisibility(View.GONE);
        }

        btnClose.setOnClickListener(v -> {
            dialog.dismiss();
            if (dialogCallback != null) {
                dialogCallback.onPurchaseCancelled();
            }
        });

        setupPaymentSteps(dialog, view);
    }

    private String getCurrencySymbol(String currency) {
        switch (currency.toUpperCase()) {
            case "USD":
                return "$";
            case "EUR":
                return "€";
            case "GBP":
                return "£";
            case "JPY":
                return "¥";
            case "CAD":
                return "C$";
            case "AUD":
                return "A$";
            default:
                return "$"; // Default to USD symbol
        }
    }

    private void setupPaymentSteps(Dialog dialog, View view) {
        // Step 1 - Payment method selection
        LinearLayout stepOneLayout = view.findViewById(R.id.stepOneLayout);
        Button btnCard = view.findViewById(R.id.btnCard);
        Button btnPaypal = view.findViewById(R.id.btnPaypal);

        // Step 2 - Payment details
        LinearLayout stepTwoLayout = view.findViewById(R.id.stepTwoLayout);
        TextView selectedMethodText = view.findViewById(R.id.selectedMethodText);
        Button btnSubmitCard = view.findViewById(R.id.btnSubmitCard);
        TextView titleText = view.findViewById(R.id.titleText);

        // Input fields
        TextInputLayout etCardNumber = view.findViewById(R.id.etCardNumber);
        TextInputLayout etExpiry = view.findViewById(R.id.etExpiry);
        TextInputLayout etCvv = view.findViewById(R.id.etCvv);
        TextInputLayout etName = view.findViewById(R.id.etName);

        // Setup validators
        Validator cardValidator = createCardValidator(etCardNumber);
        Validator expiryValidator = createExpiryValidator(etExpiry);
        Validator cvvValidator = createCvvValidator(etCvv);
        Validator nameValidator = createNameValidator(etName);

        btnCard.setOnClickListener(v -> {
            stepOneLayout.setVisibility(View.GONE);
            stepTwoLayout.setVisibility(View.VISIBLE);
            selectedMethodText.setText("You selected: Card");
            titleText.setText("Input details");

            showCardInputs(etCardNumber, etExpiry, etCvv, etName);
            btnSubmitCard.setVisibility(View.VISIBLE);
        });

        btnPaypal.setOnClickListener(v -> {
            stepOneLayout.setVisibility(View.GONE);
            stepTwoLayout.setVisibility(View.VISIBLE);
            titleText.setText("PayPal Payment");
            selectedMethodText.setText("You selected: PayPal");

            // Hide card inputs and show PayPal-specific inputs
            hideCardInputs(etCardNumber, etExpiry, etCvv);

            // Repurpose etName for PayPal email
            etName.setVisibility(View.VISIBLE);
            etName.setHint("PayPal Email Address");
            etName.getEditText().setInputType(android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);

            btnSubmitCard.setVisibility(View.VISIBLE);
            btnSubmitCard.setText("Pay with PayPal");
        });

        // Update the submit button handler to handle PayPal
        btnSubmitCard.setOnClickListener(v -> {
            String selectedMethod = selectedMethodText.getText().toString();

            if (selectedMethod.contains("PayPal")) {
                // Validate PayPal email
                Validator emailValidator = createEmailValidator(etName);
                if (emailValidator.isValid()) {
                    String paypalEmail = etName.getEditText().getText().toString();

                    if (dialogCallback != null) {
                        dialogCallback.onPurchaseRequested(InAppConstants.PAYMENT_METHOD_PAYPAL, paypalEmail, null, null, null);
                    }
                    dialog.dismiss();
                }
            } else {
                // Existing card validation logic
                if (validateCardInputs(cardValidator, expiryValidator, cvvValidator, nameValidator)) {
                    String cardNumber = etCardNumber.getEditText().getText().toString();
                    String expiry = etExpiry.getEditText().getText().toString();
                    String cvv = etCvv.getEditText().getText().toString();
                    String name = etName.getEditText().getText().toString();

                    if (dialogCallback != null) {
                        dialogCallback.onPurchaseRequested(InAppConstants.PAYMENT_METHOD_CARD, cardNumber, expiry, cvv, name);
                    }
                    dialog.dismiss();
                }
            }
        });
    }

    private void hideCardInputs(TextInputLayout... inputs) {
        for (TextInputLayout input : inputs) {
            if (input != null) {
                input.setVisibility(View.GONE);
            }
        }
    }

    private void showCardInputs(TextInputLayout... inputs) {
        for (TextInputLayout input : inputs) {
            if (input != null) {
                input.setVisibility(View.VISIBLE);
            }
        }
    }

    private boolean validateCardInputs(Validator... validators) {
        boolean isValid = true;
        for (Validator validator : validators) {
            if (!validator.isValid()) {
                isValid = false;
            }
        }
        return isValid;
    }

    private Validator createCardValidator(TextInputLayout etCardNumber) {
        return Validator.Builder
                .with(etCardNumber)
                .addWatcher(new Watcher.NotBlank("Card number is required"))
                .addWatcher(new Watcher.PatternWatcher("Invalid card format", "\\d{16}"))
                .build();
    }

    private Validator createExpiryValidator(TextInputLayout etExpiry) {
        return Validator.Builder
                .with(etExpiry)
                .addWatcher(new Watcher.NotBlank("Expiry is required"))
                .addWatcher(new Watcher.DateFormatWatcher("Use MM/yy format", "MM/yy"))
                .build();
    }

    private Validator createCvvValidator(TextInputLayout etCvv) {
        return Validator.Builder
                .with(etCvv)
                .addWatcher(new Watcher.NotBlank("CVV is required"))
                .addWatcher(new Watcher.PatternWatcher("Invalid CVV", "\\d{3,4}"))
                .build();
    }

    private Validator createNameValidator(TextInputLayout etName) {
        return Validator.Builder
                .with(etName)
                .addWatcher(new Watcher.NotBlank("Name is required"))
                .addWatcher(new Watcher.PatternWatcher("Invalid name", "^[a-zA-Z ]+$"))
                .build();
    }

    private Validator createEmailValidator(TextInputLayout etEmail) {
        return Validator.Builder
                .with(etEmail)
                .addWatcher(new Watcher.NotBlank("Email is required"))
                .addWatcher(new Watcher.PatternWatcher("Invalid email format",
                        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"))
                .build();
    }
}