package br.com.unilink.backend.model;

public enum ReportReason {
    INAPPROPRIATE_CONTENT,
    VIOLENCE_OR_THREATS,
    HATE_SPEECH,
    SPAM_OR_SCAM,
    PERSONAL_DATA,
    OTHER;

    public static ReportReason fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Motivo da denúncia inválido.");
        }
        try {
            return valueOf(value.trim().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Motivo da denúncia inválido.", exception);
        }
    }
}
