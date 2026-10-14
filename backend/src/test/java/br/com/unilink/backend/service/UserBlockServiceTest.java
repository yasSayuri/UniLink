package br.com.unilink.backend.service;

import br.com.unilink.backend.model.UserBlock;
import br.com.unilink.backend.repository.UserBlockRepository;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserBlockServiceTest {

    @Mock
    private UserBlockRepository blockRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserFollowRepository followRepository;

    @InjectMocks
    private UserBlockService userBlockService;

    @Test
    void persistsBlockAndRemovesBothFollowDirections() {
        when(userRepository.existsById("blocked")).thenReturn(true);
        when(blockRepository.existsByBlockerIdAndBlockedId("blocker", "blocked")).thenReturn(false);

        userBlockService.block("blocker", "blocked");

        ArgumentCaptor<UserBlock> captor = ArgumentCaptor.forClass(UserBlock.class);
        verify(blockRepository).save(captor.capture());
        assertEquals("blocker", captor.getValue().getBlockerId());
        assertEquals("blocked", captor.getValue().getBlockedId());
        verify(followRepository).deleteByFollowerIdAndFollowedId("blocker", "blocked");
        verify(followRepository).deleteByFollowerIdAndFollowedId("blocked", "blocker");
    }

    @Test
    void rejectsSelfBlockAndUnknownTarget() {
        assertThrows(ResponseStatusException.class, () -> userBlockService.block("same", "same"));
        when(userRepository.existsById("missing")).thenReturn(false);
        assertThrows(ResponseStatusException.class, () -> userBlockService.block("blocker", "missing"));
        verify(blockRepository, never()).save(any(UserBlock.class));
    }

    @Test
    void checksTheRelationshipInBothDirections() {
        when(blockRepository.existsByBlockerIdAndBlockedId("a", "b")).thenReturn(false);
        when(blockRepository.existsByBlockerIdAndBlockedId("b", "a")).thenReturn(true);

        org.junit.jupiter.api.Assertions.assertTrue(userBlockService.isBlockedEither("a", "b"));
    }

    @Test
    void removesOnlyTheRequestedBlock() {
        userBlockService.unblock("blocker", "blocked");

        verify(blockRepository).deleteByBlockerIdAndBlockedId("blocker", "blocked");
    }
}
