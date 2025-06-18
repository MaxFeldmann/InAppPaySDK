package com.dev.inapppaysdk.utils;

import android.annotation.SuppressLint;
import android.content.Context;
import android.provider.Settings;
import android.telephony.TelephonyManager;

import java.util.Locale;

public class DeviceUtils {
    @SuppressLint("HardwareIds")
    public static String getAndroidId(Context context) {
        return Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
    }

    // Detect user's country using multiple method
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
            if (countryCode != null && !countryCode.isEmpty()) {
                return countryCode.toUpperCase();
            }
        } catch (Exception e) {
            // Fallback to US if detection fails
            return "US";
        }

        return "US"; // Default fallback
    }
}