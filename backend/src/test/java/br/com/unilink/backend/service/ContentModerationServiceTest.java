package br.com.unilink.backend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContentModerationServiceTest {

    private final ContentModerationService moderationService = new ContentModerationService();

    @Test
    void allowsNormalAcademicContent() {
        assertTrue(moderationService.isAllowed("Hoje compartilho o resumo da aula de algoritmos."));
        assertTrue(moderationService.isAllowed("Estudo acadêmico sobre violência histórica."));
    }

    @Test
    void blocksViolentThreats() {
        assertFalse(moderationService.isAllowed("Vou te matar se você publicar isso."));
        assertFalse(moderationService.isAllowed("Isso é uma ameaça de morte."));
    }

    @Test
    void blocksExplicitSexualContent() {
        assertFalse(moderationService.isAllowed("Confira meu conteúdo pornográfico."));
    }

    @Test
    void blocksSelfHarmContent() {
        assertFalse(moderationService.isAllowed("Estou pensando em me matar."));
    }

    @Test
    void blocksConfidentialData() {
        assertFalse(moderationService.isAllowed("Minha senha é super-secreta."));
        assertFalse(moderationService.isAllowed("Meu e-mail é estudante@example.com."));
        assertFalse(moderationService.isAllowed("Meu cartão é 4111 1111 1111 1111."));
        assertFalse(moderationService.isAllowed("Meu CPF é 123.456.789-09."));
        assertFalse(moderationService.isAllowed("Minha chave Pix é 123."));
    }
}
