package br.com.unilink.backend.service;

import br.com.unilink.backend.model.User;
import br.com.unilink.backend.model.UserFollow;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserFollowServiceTest {

    @Mock
    private UserFollowRepository followRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserFollowService userFollowService;

    @Test
    void createsOneFollowRelationshipWhenTargetExists() {
        when(userRepository.existsById("target")).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowedId("viewer", "target")).thenReturn(false);

        userFollowService.follow("viewer", "target");

        ArgumentCaptor<UserFollow> savedFollow = ArgumentCaptor.forClass(UserFollow.class);
        verify(followRepository).save(savedFollow.capture());
        assertEquals("viewer", savedFollow.getValue().getFollowerId());
        assertEquals("target", savedFollow.getValue().getFollowedId());
    }

    @Test
    void followingTheSameUserTwiceDoesNotCreateDuplicateRelationships() {
        when(userRepository.existsById("target")).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowedId("viewer", "target")).thenReturn(true);

        userFollowService.follow("viewer", "target");

        verify(followRepository, never()).save(any(UserFollow.class));
    }

    @Test
    void rejectsFollowingYourself() {
        assertThrows(ResponseStatusException.class, () -> userFollowService.follow("viewer", "viewer"));
        verify(userRepository, never()).existsById("viewer");
    }

    @Test
    void returnsOnlyUsersInFollowingListWithFollowingStatus() {
        User followedUser = new User("target", "Target User", "target@example.test", "hash");
        ReflectionTestUtils.setField(followedUser, "id", "target");
        when(followRepository.findAllByFollowerId("viewer"))
                .thenReturn(java.util.List.of(new UserFollow("viewer", "target")));
        when(userRepository.findById("target")).thenReturn(Optional.of(followedUser));

        var result = userFollowService.following("viewer");

        assertEquals(1, result.size());
        assertEquals("target", result.get(0).id());
        assertEquals(true, result.get(0).following());
    }
}
