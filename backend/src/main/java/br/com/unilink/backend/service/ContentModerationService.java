package br.com.unilink.backend.service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

/**
 * Moderação local e determinística. O texto não é enviado nem gravado em
 * logs; somente o resultado da análise é usado pelo serviço de publicações.
 */
@Service
public class ContentModerationService {

    public static final String BLOCKED_MESSAGE =
            "Opa! Parece que seu post não está de acordo com as diretrizes da UniLink. "
                    + "Revise o conteúdo e tente novamente.";
    private static final Pattern VIOLENCE_OR_THREAT = Pattern.compile(
            "\\b(?:vou|vamos|iremos?|pretendo|pretendemos|quero)\\s+(?:te\\s+)?"
                    + "(?:matar|assassinar|machucar|ferir|agredir|espancar|sequestrar|explodir)\\b"
                    + "|\\b(?:te\\s+)?(?:mato|machuco|firo)\\b"
                    + "|\\bamea[cç]a\\s+(?:de\\s+)?morte\\b",
            Pattern.UNICODE_CASE);
    private static final Pattern SEXUAL_EXPLICIT = Pattern.compile(
            "\\b(?:porn(?:ografia|ografico|ográfico)?|porno|pornô|nudes?|"
                    + "masturba(?:r|ção|cao)|gozar|penetra(?:ção|cao)|sexo\\s+(?:expl[ií]cito|anal|oral))\\b",
            Pattern.UNICODE_CASE);
    private static final Pattern SELF_HARM = Pattern.compile(
            "\\b(?:suic[ií]d(?:io|a|ar)|auto[- ]?agress(?:ão|ao)|"
                    + "tirar\\s+(?:a\\s+)?minha\\s+vida|me\\s+(?:matar|cortar)|"
                    + "cortar\\s+(?:meus?|os?)\\s+pulso|n[aã]o\\s+quero\\s+(?:mais\\s+)?viver)\\b",
            Pattern.UNICODE_CASE);
    private static final Pattern CPF = Pattern.compile(
            "(?<!\\d)\\d{3}[.\\s]?\\d{3}[.\\s]?\\d{3}[-\\s]?\\d{2}(?!\\d)");
    private static final Pattern CARD = Pattern.compile(
            "(?<!\\d)(?:\\d[ -]?){13,19}(?!\\d)");
    private static final Pattern PHONE = Pattern.compile(
            "(?<!\\d)(?:\\+?55\\s?)?(?:\\(?\\d{2}\\)?\\s?)?9?\\d{4}[-\\s]?\\d{4}(?!\\d)");
    private static final Pattern EMAIL = Pattern.compile(
            "(?i)(?<![\\w.+-])[\\w.%+-]+@[\\w-]+(?:\\.[\\w-]+)+");
    private static final Pattern SECRET_TERM = Pattern.compile(
            "\\b(?:senha|password|token|api\\s*key|chave\\s+(?:de\\s+acesso|pix)|pix)\\b",
            Pattern.UNICODE_CASE);

    public ModerationResult analyze(String content) {
        String normalized = normalize(content);
        if (VIOLENCE_OR_THREAT.matcher(normalized).find()) {
            return ModerationResult.blocked(Category.VIOLENCE_OR_THREAT);
        }
        if (SEXUAL_EXPLICIT.matcher(normalized).find()) {
            return ModerationResult.blocked(Category.SEXUAL_EXPLICIT);
        }
        if (SELF_HARM.matcher(normalized).find()) {
            return ModerationResult.blocked(Category.SELF_HARM);
        }
        if (EMAIL.matcher(content == null ? "" : content).find()
                || CPF.matcher(normalized).find()
                || PHONE.matcher(normalized).find()
                || SECRET_TERM.matcher(normalized).find()
                || containsCardNumber(normalized)) {
            return ModerationResult.blocked(Category.CONFIDENTIAL_DATA);
        }
        return ModerationResult.approved();
    }

    public boolean isAllowed(String content) {
        return analyze(content).allowed();
    }

    private String normalize(String content) {
        if (content == null) {
            return "";
        }
        return Normalizer.normalize(content, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    private boolean containsCardNumber(String content) {
        return CARD.matcher(content).find();
    }

    public enum Category {
        VIOLENCE_OR_THREAT,
        SEXUAL_EXPLICIT,
        SELF_HARM,
        CONFIDENTIAL_DATA
    }

    public record ModerationResult(boolean allowed, Category category) {
        private static ModerationResult approved() {
            return new ModerationResult(true, null);
        }

        private static ModerationResult blocked(Category category) {
            return new ModerationResult(false, category);
        }
    }
}
