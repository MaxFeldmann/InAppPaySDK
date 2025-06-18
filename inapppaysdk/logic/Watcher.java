package com.dev.inapppaysdk.logic;

import android.icu.util.Calendar;
import android.util.Patterns;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.regex.Pattern;

public abstract class Watcher {
    protected final String errorMessage;

    protected Watcher(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    /**
     * Trims the input and runs the concrete check.
     */
    public final boolean validate(String input) {
        String text = (input == null ? "" : input.trim());
        return check(text);
    }

    /** Concrete subclasses implement this. */
    protected abstract boolean check(String input);

    public static class NotBlank extends Watcher {
        public NotBlank(String errorMessage) { super(errorMessage); }
        @Override protected boolean check(String input) {
            return !input.isEmpty();
        }
    }

    public static class MinLength extends Watcher {
        private final int min;
        public MinLength(String errorMessage, int min) {
            super(errorMessage);
            this.min = min;
        }
        @Override protected boolean check(String input) {
            return input.length() >= min;
        }
    }

    public static class MaxLength extends Watcher {
        private final int max;
        public MaxLength(String errorMessage, int max) {
            super(errorMessage);
            this.max = max;
        }
        @Override protected boolean check(String input) {
            return input.length() <= max;
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

    public static class Email extends Watcher {
        public Email(String errorMessage) { super(errorMessage); }
        @Override protected boolean check(String input) {
            return !input.isEmpty()
                    && Patterns.EMAIL_ADDRESS.matcher(input).matches();
        }
    }

    public static class Url extends Watcher {
        public Url(String errorMessage) { super(errorMessage); }
        @Override protected boolean check(String input) {
            return !input.isEmpty()
                    && Patterns.WEB_URL.matcher(input).matches();
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

    /** Validates against Android’s built-in phone pattern */
    public static class Phone extends Watcher {
        public Phone(String errorMessage) {
            super(errorMessage);
        }
        @Override protected boolean check(String input) {
            return !input.isEmpty()
                    && Patterns.PHONE.matcher(input).matches();
        }
    }

    /** Requires the text to be exactly N characters long */
    public static class ExactLength extends Watcher {
        private final int length;
        public ExactLength(String errorMessage, int length) {
            super(errorMessage);
            this.length = length;
        }
        @Override protected boolean check(String input) {
            return input.length() == length;
        }
    }

    public static class CardNumberWatcher extends Watcher {
        public CardNumberWatcher(String errorMessage) {
            super(errorMessage);
        }

        @Override
        protected boolean check(String input) {
            if (input.length() < 12 || input.length() > 19) return false;
            return luhnCheck(input);
        }

        private boolean luhnCheck(String number) {
            int sum = 0;
            boolean alternate = false;
            for (int i = number.length() - 1; i >= 0; i--) {
                char c = number.charAt(i);
                if (!Character.isDigit(c)) return false;
                int n = c - '0';
                if (alternate) {
                    n *= 2;
                    if (n > 9) n -= 9;
                }
                sum += n;
                alternate = !alternate;
            }
            return sum % 10 == 0;
        }
    }

    public static class ExpiryDateWatcher extends Watcher {
        public ExpiryDateWatcher(String errorMessage) {
            super(errorMessage);
        }

        @Override
        protected boolean check(String input) {
            if (!input.matches("(0[1-9]|1[0-2])/\\d{2}")) return false;

            String[] parts = input.split("/");
            int month = Integer.parseInt(parts[0]);
            int year = Integer.parseInt(parts[1]) + 2000;

            Calendar now = Calendar.getInstance();
            int currMonth = now.get(Calendar.MONTH) + 1;
            int currYear = now.get(Calendar.YEAR);

            return year > currYear || (year == currYear && month >= currMonth);
        }
    }

    public static class CVVWatcher extends Watcher {
        public CVVWatcher(String errorMessage) {
            super(errorMessage);
        }

        @Override
        protected boolean check(String input) {
            return input.matches("\\d{3,4}");
        }
    }

    /** Requires the text length to be between min and max (inclusive) */
    public static class LengthRange extends Watcher {
        private final int min, max;
        public LengthRange(String errorMessage, int min, int max) {
            super(errorMessage);
            this.min = min;
            this.max = max;
        }
        @Override protected boolean check(String input) {
            int len = input.length();
            return len >= min && len <= max;
        }
    }

    public static class NameWatcher extends Watcher {
        public NameWatcher(String errorMessage) {
            super(errorMessage);
        }

        @Override
        protected boolean check(String input) {
            return input.matches("[a-zA-Z ]{2,}");
        }
    }

}

