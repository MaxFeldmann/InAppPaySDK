package com.dev.inapppaysdk.utils;

import android.annotation.SuppressLint;
import android.content.Context;
import android.provider.Settings;
import android.telephony.TelephonyManager;

import java.util.Locale;

/**
 * Utility class for retrieving device-specific information such as
 * Android ID and country location using various strategies.
 */
public class DeviceUtils {

    /**
     * Retrieves the unique Android device ID.
     *
     * @param context application or activity context
     * @return a string representing the device's Android ID
     */
    @SuppressLint("HardwareIds")
    public static String getAndroidId(Context context) {
        return Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
    }

    /**
     * Attempts to detect the user's country using SIM, network, and locale as fallbacks.
     *
     * @param context application or activity context
     * @return a 2-letter country ISO code (e.g., "US", "GB")
     */
    public static String detectUserCountry(Context context) {
        try {
            // Method 1: Try to get country from SIM card
            TelephonyManager telephonyManager = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
            if (telephonyManager != null) {
                String countryCode = telephonyManager.getSimCountryIso();
                if (countryCode != null && !countryCode.isEmpty()) {
                    return countryCode.toUpperCase();
                }

                // Method 2: Try to get country from network
                countryCode = telephonyManager.getNetworkCountryIso();
                if (countryCode != null && !countryCode.isEmpty()) {
                    return countryCode.toUpperCase();
                }
            }

            // Method 3: Use system locale as fallback
            String countryCode = Locale.getDefault().getCountry();
            if (!countryCode.isEmpty()) {
                return countryCode.toUpperCase();
            }
        } catch (Exception e) {
            // Fallback to US if detection fails
            return "US";
        }
        return "US"; // Default fallback
    }
}