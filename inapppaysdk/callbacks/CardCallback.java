package com.dev.inapppaysdk.callbacks;

public interface CardCallback {
    void onCardSubmitted(String cardNumber, String expiry, String cvv, String name);
}
