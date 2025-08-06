package com.dev.inapppaysdk.logic;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Abstract base class for all input validation checks.
 * Subclasses implement different rules (e.g., not blank, valid email, card number format, etc.).
 */
public abstract class Watcher {
    protected final String errorMessage;

    protected Watcher(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    /**
     * Validates trimmed input using the subclass check.
     */
    public final boolean validate(String input) {
        String text = (input == null ? "" : input.trim());
        return check(text);
    }

    /** To be implemented by subclasses to define the rule logic. */
    protected abstract boolean check(String input);

    // === Built-in Validators ===
    public static class NotBlank extends Watcher {
        public NotBlank(String errorMessage) { super(errorMessage); }
        @Override protected boolean check(String input) {
            return !input.isEmpty();
        }
    }

    public static class PatternWatcher extends Watcher {
        private final Pattern pattern;
        public PatternWatcher(String errorMessage, String regex) {
            super(errorMessage);
            this.pattern = Pattern.compile(regex);
        }
        @Override protected boolean check(String input) {
            return pattern.matcher(input).matches();
        }
    }

    public static class DateFormatWatcher extends Watcher {
        private final DateFormat dateFormat;
        public DateFormatWatcher(String errorMessage, String pattern) {
            super(errorMessage);
            this.dateFormat = new SimpleDateFormat(pattern, Locale.getDefault());
            this.dateFormat.setLenient(false);
        }
        @Override protected boolean check(String input) {
            try {
                dateFormat.parse(input);
                return true;
            } catch (ParseException e) {
                return false;
            }
        }
    }

}

