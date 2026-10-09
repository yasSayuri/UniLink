package br.com.unilink.backend.service;

import java.util.List;
import java.util.Optional;

import br.com.unilink.backend.dto.CreatePostRequest;
import br.com.unilink.backend.dto.PostMediaRequest;
import br.com.unilink.backend.model.Post;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.model.Community;
import br.com.unilink.backend.repository.PostRepository;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import br.com.unilink.backend.repository.CommunityRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserFollowRepository followRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PostService postService;

    @Test
    void onlyReturnsPostsFromFollowedUsersAndPostsOwnedByViewer() {
        Post publicPost = post("another-user", "PUBLIC");
        Post privatePost = post("another-user", "PRIVATE");
        Post followerPost = post("another-user", "FOLLOWERS");
        Post ownPrivatePost = post("viewer", "PRIVATE");
        when(followRepository.findAllByFollowerId("viewer"))
                .thenReturn(List.of(new br.com.unilink.backend.model.UserFollow("viewer", "another-user")));
        when(followRepository.existsByFollowerIdAndFollowedId("viewer", "another-user")).thenReturn(true);
        when(postRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of(publicPost, privatePost, followerPost, ownPrivatePost));

        var result = postService.list("viewer");

        assertEquals(3, result.size());
        assertEquals(List.of("PUBLIC", "FOLLOWERS", "PRIVATE"), result.stream().map(item -> item.privacy()).toList());
    }

    @Test
    void returnsNoPostsWhenViewerHasNoFollowRelationshipsOrOwnPosts() {
        when(followRepository.findAllByFollowerId("viewer")).thenReturn(List.of());
        when(postRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(
                post("another-user", "PUBLIC")));

        assertEquals(List.of(), postService.list("viewer"));
    }

    @Test
    void createsPostWithImageMedia() {
        User user = new User("student", "Student", "student@example.com", "hash");
        when(userRepository.findById("viewer")).thenReturn(Optional.of(user));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));
        var media = new PostMediaRequest("image.png", "image/png", "data:image/png;base64,aGVsbG8=");

        var result = postService.create("viewer", new CreatePostRequest("Post com imagem", "PUBLIC", null, List.of(media)));

        assertEquals(1, result.media().size());
        assertEquals("image/png", result.media().get(0).contentType());
    }

    @Test
    void rejectsMediaWhoseDeclaredTypeDoesNotMatchDataUrl() {
        User user = new User("student", "Student", "student@example.com", "hash");
        when(userRepository.findById("viewer")).thenReturn(Optional.of(user));
        var media = new PostMediaRequest("image.png", "image/jpeg", "data:image/png;base64,aGVsbG8=");

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () ->
                postService.create("viewer", new CreatePostRequest("Post inválido", "PUBLIC", null, List.of(media))));
    }

    @Test
    void preventsPostingToACommunityTheUserHasNotJoined() {
        User user = new User("student", "Student", "student@example.com", "hash");
        Community community = new Community("Grupo de Estudos", "Description", "Estudos",
                "Campo Mourão", "image", "PUBLIC", "owner");
        when(userRepository.findById("viewer")).thenReturn(Optional.of(user));
        when(communityRepository.findByName("Grupo de Estudos")).thenReturn(Optional.of(community));

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () ->
                postService.create("viewer", new CreatePostRequest(
                        "Post sem participar", "PUBLIC", "Grupo de Estudos", List.of())));
        org.mockito.Mockito.verify(postRepository, org.mockito.Mockito.never()).save(any(Post.class));
    }

    @Test
    void persistsLikesAndReturnsViewerLikeState() {
        Post post = post("author", "PUBLIC");
        User viewer = new User("viewer", "Viewer", "viewer@example.com", "hash");
        ReflectionTestUtils.setField(viewer, "id", "viewer");
        ReflectionTestUtils.setField(post, "id", "post-id");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));
        when(userRepository.findById("viewer")).thenReturn(Optional.of(viewer));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = postService.like("viewer", "post-id");

        assertEquals(1, result.likes());
        org.junit.jupiter.api.Assertions.assertTrue(result.likedByCurrentUser());
    }

    @Test
    void includesRepostedPostsOnTheReposterProfile() {
        Post post = post("author", "PUBLIC");
        post.addRepost("viewer");
        when(userRepository.existsById("viewer")).thenReturn(true);
        when(postRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(post));

        var result = postService.profilePosts("viewer", "viewer");

        assertEquals(1, result.size());
        org.junit.jupiter.api.Assertions.assertTrue(result.get(0).reposted());
        org.junit.jupiter.api.Assertions.assertTrue(result.get(0).repostedByCurrentUser());
    }

    @Test
    void allowsCommentAuthorToEditOwnComment() {
        Post post = post("author", "PUBLIC");
        User commenter = new User("commenter", "Commenter", "commenter@example.com", "hash");
        ReflectionTestUtils.setField(commenter, "id", "commenter");
        post.addComment(new br.com.unilink.backend.model.PostComment(commenter, "texto antigo"));
        String commentId = post.getComments().get(0).getId();
        ReflectionTestUtils.setField(post, "id", "post-id");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var updated = postService.editComment("commenter", "post-id", commentId, "texto novo");

        assertEquals("texto novo", updated.comments().get(0).content());
    }

    @Test
    void rejectsDeletingCommentFromAnotherUser() {
        Post post = post("author", "PUBLIC");
        User commenter = new User("commenter", "Commenter", "commenter@example.com", "hash");
        ReflectionTestUtils.setField(commenter, "id", "commenter");
        post.addComment(new br.com.unilink.backend.model.PostComment(commenter, "comentário"));
        String commentId = post.getComments().get(0).getId();
        ReflectionTestUtils.setField(post, "id", "post-id");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> postService.deleteComment("viewer", "post-id", commentId));

        assertEquals("Você só pode excluir seus próprios comentários.", exception.getReason());
    }

    @Test
    void hidesCommunityPostsFromProfileTimeline() {
        Post profilePost = post("viewer", "PUBLIC");
        Post communityPost = post("viewer", "PUBLIC", "Cálculo 3");
        when(userRepository.existsById("viewer")).thenReturn(true);
        when(postRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(profilePost, communityPost));

        var result = postService.profilePosts("viewer", "viewer");

        assertEquals(1, result.size());
        assertEquals(null, result.get(0).communityName());
    }

    private Post post(String authorId, String privacy) {
        return new Post(authorId, "Student", "student", null, null, null, "Content", privacy, null, List.of(), List.of());
    }

    private Post post(String authorId, String privacy, String communityName) {
        return new Post(authorId, "Student", "student", null, null, null, "Content", privacy, communityName, List.of(), List.of());
    }
}
