package com.dev.inapppaysdk.utils;

import android.app.Dialog;
import android.content.Context;
import android.graphics.drawable.ColorDrawable;
import android.view.ViewGroup;
import android.view.Window;

import com.dev.inapppaysdk.R;

/**
 * {@code LoadingDialogHelper} provides a lightweight helper for displaying a non-cancelable
 * loading dialog with a transparent background and Lottie animation.
 * <p>
 * This is typically used during network operations like verifying purchases or fetching data,
 * to indicate that processing is ongoing.
 *
 * <h2>Usage Example:</h2>
 * <pre>{@code
 * LoadingDialogHelper loadingDialog = new LoadingDialogHelper();
 * loadingDialog.show(context);
 *
 * // After task is done
 * loadingDialog.dismiss();
 * }</pre>
 *
 * <strong>Note:</strong> Always call {@link #dismiss()} when the operation completes
 * to avoid leaking the dialog or blocking UI interactions.
 */
public class LoadingDialogHelper {
    private Dialog loadingDialog;

    /**
     * Shows the loading dialog with a Lottie animation.
     *
     * @param context The context in which to show the dialog.
     *                Must be an Activity context or a context with a valid window token.
     */
    public void show(Context context) {
        loadingDialog = new Dialog(context);
        loadingDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        loadingDialog.setContentView(R.layout.sdk_loading_dialog);
        loadingDialog.setCancelable(false);

        // Set transparent background and wrap content size
        loadingDialog.getWindow().setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));
        loadingDialog.getWindow().setLayout(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        loadingDialog.show();
    }

    /**
     * Dismisses the loading dialog if it is currently shown.
     */
    public void dismiss() {
        if (loadingDialog != null && loadingDialog.isShowing()) {
            loadingDialog.dismiss();
        }
    }
}
