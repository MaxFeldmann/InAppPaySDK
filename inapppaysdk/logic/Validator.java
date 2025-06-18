package com.dev.inapppaysdk.logic;

import android.icu.util.Calendar;
import com.google.android.material.textfield.TextInputLayout;
import android.text.Editable;
import android.text.TextWatcher;
import java.util.ArrayList;
import java.util.List;

public class Validator {
    private final TextInputLayout inputLayout;
    private final List<Watcher> watchers;

    private Validator(TextInputLayout inputLayout, List<Watcher> watchers) {
        this.inputLayout = inputLayout;
        this.watchers = watchers;
        attachListener();
    }

    private void attachListener() {
        if (inputLayout.getEditText() == null)
            return;
        inputLayout.getEditText()
                .addTextChangedListener(new SimpleTextWatcher() {
                    @Override
                    public void onTextChanged(CharSequence s, int start, int before, int count) {
                        // update error state live
                        runValidation(s.toString());
                    }
                });
    }

    /**
     * Validates the provided text against all watchers,
     * sets/clears the error on the TextInputLayout, and
     * returns true if everything passed.
     */
    private boolean runValidation(String text) {
        for (Watcher w : watchers) {
            if (!w.validate(text)) {
                inputLayout.setError(w.errorMessage);
                return false;
            }
        }
        inputLayout.setError(null);
        return true;
    }

    /**
     * Public API: check the current content of the EditText
     * and return whether it’s valid.
     */
    public boolean isValid() {
        if (inputLayout.getEditText() == null)
            return false;
        String current = inputLayout.getEditText().getText().toString();
        return runValidation(current);
    }

    public static class Builder {
        private final TextInputLayout inputLayout;
        private final List<Watcher> watchers = new ArrayList<>();
        private boolean built = false;

        private Builder(TextInputLayout inputLayout) {
            this.inputLayout = inputLayout;
        }

        public static Builder with(TextInputLayout inputLayout) {
            return new Builder(inputLayout);
        }

        public Builder addWatcher(Watcher watcher) {
            if (built) {
                throw new IllegalStateException("Cannot add watcher: Validator already built");
            }
            watchers.add(watcher);
            return this;
        }

        public Validator build() {
            if (built) {
                throw new IllegalStateException("Validator already built");
            }
            built = true;
            return new Validator(inputLayout, watchers);
        }
    }

    private abstract static class SimpleTextWatcher implements TextWatcher {
        @Override public void beforeTextChanged(CharSequence s, int st, int c, int a) { }
        @Override public void afterTextChanged(Editable e) { }
    }
}
