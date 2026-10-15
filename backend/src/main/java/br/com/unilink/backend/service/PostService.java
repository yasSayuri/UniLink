package br.com.unilink.backend.service;

import java.util.Base64;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.time.Duration;
import java.time.Instant;
import java.util.regex.Pattern;

import br.com.unilink.backend.dto.CreatePostRequest;
import br.com.unilink.backend.dto.PostResponse;
import br.com.unilink.backend.model.PostMedia;
import br.com.unilink.backend.model.Post;
import br.com.unilink.backend.model.PostComment;
import br.com.unilink.backend.repository.PostRepository;
import br.com.unilink.backend.repository.CommunityRepository;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class PostService {

    private static final int MAX_MEDIA_BYTES = 10 * 1024 * 1024;
    private static final int MAX_MEDIA_FILE_BYTES = 5 * 1024 * 1024;
    private static final Duration PUBLICATION_BLOCK_DURATION = Duration.ofMinutes(10);
    private static final Pattern DATA_URL_PATTERN = Pattern.compile(
            "^data:(image/(?:jpeg|png|gif|webp)|video/(?:mp4|webm));base64,([A-Za-z0-9+/]*={0,2})$");
    private static final Pattern HASHTAG_PATTERN = Pattern.compile("(?<!\\w)#([\\p{L}\\p{N}_]+)");

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserFollowRepository followRepository;
    private final CommunityRepository communityRepository;
    private final NotificationService notificationService;
    private final ContentModerationService contentModerationService;
    private final UserBlockService userBlockService;

    @Autowired
    public PostService(
            PostRepository postRepository,
            UserRepository userRepository,
            UserFollowRepository followRepository,
            CommunityRepository communityRepository,
            NotificationService notificationService,
            ContentModerationService contentModerationService,
            UserBlockService userBlockService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.communityRepository = communityRepository;
        this.notificationService = notificationService;
        this.contentModerationService = contentModerationService == null
                ? new ContentModerationService()
                : contentModerationService;
        this.userBlockService = userBlockService;
    }

    public PostService(
            PostRepository postRepository,
            UserRepository userRepository,
            UserFollowRepository followRepository,
            CommunityRepository communityRepository,
            NotificationService notificationService) {
        this(postRepository, userRepository, followRepository, communityRepository,
                notificationService, new ContentModerationService(), null);
    }

    public PostService(
            PostRepository postRepository,
            UserRepository userRepository,
            UserFollowRepository followRepository,
            CommunityRepository communityRepository,
            NotificationService notificationService,
            ContentModerationService contentModerationService) {
        this(postRepository, userRepository, followRepository, communityRepository,
                notificationService, contentModerationService, null);
    }

    public List<PostResponse> list(String viewerId) {
        var followedIds = followRepository.findAllByFollowerId(viewerId).stream()
                .map(br.com.unilink.backend.model.UserFollow::getFollowedId)
                .collect(java.util.stream.Collectors.toSet());
        var visiblePosts = new ArrayList<>(postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(post -> Objects.equals(post.getAuthorId(), viewerId)
                        || (followedIds.contains(post.getAuthorId()) && canViewPost(post, viewerId, true)))
                .filter(post -> isVisibleToViewer(post.getAuthorId(), viewerId))
                .filter(post -> !containsBlockedWord(post, viewerId))
                .toList());
        Collections.shuffle(visiblePosts);
        return visiblePosts.stream()
                .map(post -> toResponse(post, viewerId, false))
                .toList();
    }

    public List<PostResponse> listByHashtag(String hashtag, String viewerId) {
        String normalizedHashtag = hashtag.trim().toLowerCase(java.util.Locale.ROOT);
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(post -> post.getHashtags().stream()
                        .anyMatch(item -> normalizedHashtag.equals(item.toLowerCase(java.util.Locale.ROOT))))
                .filter(post -> canViewPost(post, viewerId, true))
                .filter(post -> isVisibleToViewer(post.getAuthorId(), viewerId))
                .filter(post -> !containsBlockedWord(post, viewerId))
                .map(post -> toResponse(post, viewerId, false))
                .toList();
    }

    public List<PostResponse> profilePosts(String profileId, String viewerId) {
        if (!userRepository.existsById(profileId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }
        if (!Objects.equals(profileId, viewerId) && isBlockedEither(profileId, viewerId)) {
            return List.of();
        }
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(post -> Objects.equals(post.getAuthorId(), profileId)
                        || post.getRepostedBy().contains(profileId))
                .filter(post -> post.getCommunityName() == null)
                .filter(post -> canViewPost(post, viewerId, true))
                .filter(post -> !containsBlockedWord(post, viewerId))
                .map(post -> toResponse(
                        post,
                        viewerId,
                        !Objects.equals(post.getAuthorId(), profileId) && post.getRepostedBy().contains(profileId)))
                .toList();
    }

    public List<PostResponse> communityPosts(String communityName, String viewerId) {
        var communities = communityRepository.findAllByOrderByNameAsc().stream()
                .collect(java.util.stream.Collectors.toMap(
                        br.com.unilink.backend.model.Community::getName,
                        community -> community));
        if (communityName != null && !canViewCommunity(communities.get(communityName), viewerId)) {
            return List.of();
        }
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(post -> post.getCommunityName() != null
                        && (communityName == null || communityName.equals(post.getCommunityName()))
                        && canViewCommunity(communities.get(post.getCommunityName()), viewerId)
                        && (post.getPrivacy() == null || "PUBLIC".equals(post.getPrivacy())))
                .filter(post -> canViewPost(post, viewerId, true))
                .filter(post -> isVisibleToViewer(post.getAuthorId(), viewerId))
                .filter(post -> !containsBlockedWord(post, viewerId))
                .map(post -> toResponse(post, viewerId, false))
                .toList();
    }

    private boolean canViewCommunity(br.com.unilink.backend.model.Community community, String userId) {
        return community != null
                && (!"PRIVATE".equals(community.getVisibility()) || community.getMemberIds().contains(userId));
    }

    public PostResponse create(String userId, CreatePostRequest request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        String content = request.content().trim();
        ensureCanPublish(user);
        if (!contentModerationService.isAllowed(content)) {
            blockPublications(user);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    ContentModerationService.BLOCKED_MESSAGE);
        }
        List<PostMedia> media = validateMedia(request.media());
        var matcher = HASHTAG_PATTERN.matcher(content);
        List<String> hashtags = matcher.results().map(result -> result.group(1)).distinct().toList();
        String communityName = request.communityName() == null || request.communityName().isBlank()
                ? null
                : request.communityName().trim();
        if (communityName != null) {
            var community = communityRepository.findByName(communityName)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Comunidade não encontrada."));
            if (!community.getMemberIds().contains(userId)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Participe da comunidade antes de publicar nela.");
            }
        }
        Post post = new Post(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getAvatarUrl(),
                user.getInstitutionName(),
                user.getCampus(),
                content,
                request.privacy() == null ? "PUBLIC" : request.privacy(),
                communityName,
                media,
                hashtags);
        return toResponse(postRepository.save(post), userId, false);
    }

    private void ensureCanPublish(br.com.unilink.backend.model.User user) {
        Instant now = Instant.now();
        if (!user.isPublicationBlocked(now)) {
            return;
        }
        long remainingMinutes = Math.max(1,
                Duration.between(now, user.getPublicationBlockedUntil()).plusSeconds(59).toMinutes());
        throw new ResponseStatusException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Sua publicação está temporariamente bloqueada. Tente novamente em "
                        + remainingMinutes + (remainingMinutes == 1 ? " minuto." : " minutos."));
    }

    private void blockPublications(br.com.unilink.backend.model.User user) {
        user.blockPublicationsUntil(Instant.now().plus(PUBLICATION_BLOCK_DURATION));
        userRepository.save(user);
    }

    public PostResponse edit(String userId, String postId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada."));
        if (!userId.equals(post.getAuthorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você só pode editar suas próprias publicações.");
        }
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        String trimmedContent = content.trim();
        ensureCanPublish(user);
        if (!contentModerationService.isAllowed(trimmedContent)) {
            blockPublications(user);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    ContentModerationService.BLOCKED_MESSAGE);
        }
        var matcher = HASHTAG_PATTERN.matcher(trimmedContent);
        List<String> hashtags = matcher.results().map(result -> result.group(1)).distinct().toList();
        post.updateContent(trimmedContent, hashtags);
        return toResponse(postRepository.save(post), userId, false);
    }

    public void delete(String userId, String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada."));
        if (!userId.equals(post.getAuthorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você só pode excluir suas próprias publicações.");
        }
        postRepository.delete(post);
    }

    public PostResponse like(String userId, String postId) {
        Post post = findInteractablePost(postId, userId);
        boolean wasLiked = post.getLikedBy().contains(userId);
        post.addLike(userId);
        Post saved = postRepository.save(post);
        if (!wasLiked) {
            var actor = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
            notificationService.notifyPostLiked(actor, saved);
        }
        return toResponse(saved, userId, false);
    }

    public PostResponse unlike(String userId, String postId) {
        Post post = findInteractablePost(postId, userId);
        post.removeLike(userId);
        return toResponse(postRepository.save(post), userId, false);
    }

    public PostResponse comment(String userId, String postId, String content) {
        Post post = findInteractablePost(postId, userId);
        var author = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        post.addComment(new PostComment(author, content.trim()));
        Post saved = postRepository.save(post);
        notificationService.notifyPostCommented(author, saved);
        return toResponse(saved, userId, false);
    }

    public PostResponse editComment(String userId, String postId, String commentId, String content) {
        Post post = findInteractablePost(postId, userId);
        PostComment comment = post.findCommentById(commentId);
        if (comment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentário não encontrado.");
        }
        if (!userId.equals(comment.getAuthorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você só pode editar seus próprios comentários.");
        }
        comment.updateContent(content.trim());
        return toResponse(postRepository.save(post), userId, false);
    }

    public PostResponse deleteComment(String userId, String postId, String commentId) {
        Post post = findInteractablePost(postId, userId);
        PostComment comment = post.findCommentById(commentId);
        if (comment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentário não encontrado.");
        }
        if (!userId.equals(comment.getAuthorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você só pode excluir seus próprios comentários.");
        }
        post.removeCommentById(commentId);
        return toResponse(postRepository.save(post), userId, false);
    }

    public PostResponse repost(String userId, String postId) {
        Post post = findInteractablePost(postId, userId);
        post.addRepost(userId);
        return toResponse(postRepository.save(post), userId, false);
    }

    public PostResponse undoRepost(String userId, String postId) {
        Post post = findInteractablePost(postId, userId);
        post.removeRepost(userId);
        return toResponse(postRepository.save(post), userId, false);
    }

    private Post findInteractablePost(String postId, String viewerId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada."));
        if (!canViewPost(post, viewerId, true)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode interagir com esta publicação.");
        }
        return post;
    }

    private boolean canViewPost(Post post, String viewerId, boolean checkPrivateAccount) {
        if (Objects.equals(post.getAuthorId(), viewerId)) return true;
        if (isBlockedEither(post.getAuthorId(), viewerId)) return false;
        if (checkPrivateAccount && userBlockService != null && isPrivateAccount(post.getAuthorId())
                && !followRepository.existsByFollowerIdAndFollowedId(viewerId, post.getAuthorId())) return false;
        if ("PRIVATE".equals(post.getPrivacy())) return false;
        if ("FOLLOWERS".equals(post.getPrivacy())
                && !followRepository.existsByFollowerIdAndFollowedId(viewerId, post.getAuthorId())) return false;
        if (post.getCommunityName() != null) {
            var community = communityRepository.findByName(post.getCommunityName()).orElse(null);
            return canViewCommunity(community, viewerId);
        }
        return post.getPrivacy() == null || "PUBLIC".equals(post.getPrivacy()) || "FOLLOWERS".equals(post.getPrivacy());
    }

    private boolean isBlockedEither(String firstUserId, String secondUserId) {
        return userBlockService != null && userBlockService.isBlockedEither(firstUserId, secondUserId);
    }

    private boolean isVisibleToViewer(String authorId, String viewerId) {
        return Objects.equals(authorId, viewerId) || !isBlockedEither(authorId, viewerId);
    }

    private boolean isPrivateAccount(String authorId) {
        if (authorId == null) return false;
        try {
            var optionalAuthor = userRepository.findById(authorId);
            return optionalAuthor != null
                    && optionalAuthor.map(br.com.unilink.backend.model.User::isPrivateAccount).orElse(false);
        } catch (RuntimeException ignored) {
            // A missing author record should not make an otherwise public post unavailable.
            return false;
        }
    }

    private boolean containsBlockedWord(Post post, String viewerId) {
        if (Objects.equals(post.getAuthorId(), viewerId)) return false;
        var viewer = userRepository.findById(viewerId);
        if (viewer == null || viewer.isEmpty()) return false;
        String content = post.getContent() == null ? "" : post.getContent().toLowerCase(java.util.Locale.ROOT);
        return viewer.get().getBlockedWords().stream()
                .anyMatch(word -> !word.isBlank() && content.contains(word.toLowerCase(java.util.Locale.ROOT)));
    }

    private List<PostMedia> validateMedia(List<br.com.unilink.backend.dto.PostMediaRequest> mediaRequests) {
        if (mediaRequests == null || mediaRequests.isEmpty()) {
            return List.of();
        }
        int totalBytes = 0;
        List<PostMedia> media = new java.util.ArrayList<>();
        for (var request : mediaRequests) {
            var matcher = DATA_URL_PATTERN.matcher(request.dataUrl());
            if (!matcher.matches() || !request.contentType().equals(matcher.group(1))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O formato de um arquivo de mídia não é válido.");
            }
            byte[] decoded;
            try {
                decoded = Base64.getDecoder().decode(matcher.group(2));
            } catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler um arquivo de mídia.");
            }
            totalBytes += decoded.length;
            if (decoded.length > MAX_MEDIA_FILE_BYTES) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada arquivo de mídia deve ter no máximo 5 MB.");
            }
            if (totalBytes > MAX_MEDIA_BYTES) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O tamanho total das mídias deve ser de até 10 MB.");
            }
            media.add(new PostMedia(request.fileName().trim(), request.contentType(), request.dataUrl()));
        }
        return List.copyOf(media);
    }

    private PostResponse toResponse(Post post, String viewerId, boolean reposted) {
        String authorAvatarUrl = post.getAuthorAvatarUrl();
        if (authorAvatarUrl == null || authorAvatarUrl.isBlank()) {
            authorAvatarUrl = userRepository.findById(post.getAuthorId())
                    .map(br.com.unilink.backend.model.User::getAvatarUrl)
                    .orElse(null);
        }
        String authorCourse = userRepository.findById(post.getAuthorId())
                .map(br.com.unilink.backend.model.User::getCourse)
                .orElse(null);
        return new PostResponse(
                post.getId(),
                post.getAuthorId(),
                post.getAuthorName(),
                post.getAuthorUsername(),
                authorAvatarUrl,
                post.getInstitutionName(),
                post.getCampus(),
                authorCourse,
                post.getContent(),
                post.getPrivacy(),
                post.getCommunityName(),
                post.getMedia(),
                post.getHashtags(),
                post.getCreatedAt(),
                post.getLikedBy().size(),
                post.getLikedBy().contains(viewerId),
                post.getComments().stream()
                        .map(comment -> new br.com.unilink.backend.dto.PostCommentResponse(
                                comment.getId(),
                                comment.getAuthorId(),
                                comment.getAuthorName(),
                                comment.getAuthorUsername(),
                                comment.getAuthorAvatarUrl(),
                                comment.getContent(),
                                comment.getCreatedAt()))
                        .toList(),
                post.getRepostedBy().size(),
                post.getRepostedBy().contains(viewerId),
                reposted);
    }
}
