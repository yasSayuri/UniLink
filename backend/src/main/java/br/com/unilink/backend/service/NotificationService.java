package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.NotificationResponse;
import br.com.unilink.backend.model.Community;
import br.com.unilink.backend.model.Notification;
import br.com.unilink.backend.model.Post;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.NotificationRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> list(String userId) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public NotificationResponse markAsRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada."));
        if (!userId.equals(notification.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode alterar esta notificação.");
        }
        notification.markAsRead();
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllAsRead(String userId) {
        var notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        notifications.stream()
                .filter(notification -> !notification.isRead())
                .forEach(Notification::markAsRead);
        notificationRepository.saveAll(notifications);
    }

    public void notifyPostLiked(User actor, Post post) {
        if (actor.getId().equals(post.getAuthorId())) {
            return;
        }
        String targetPath = post.getCommunityName() == null
                ? "/feed#post-" + post.getId()
                : "/comunidades?group=" + java.net.URLEncoder.encode(post.getCommunityName(), java.nio.charset.StandardCharsets.UTF_8) + "#post-" + post.getId();
        createNotification(
                post.getAuthorId(),
                "POST_LIKED",
                actor.getName() + " curtiu sua publicação.",
                actor,
                post.getId(),
                null,
                post.getCommunityName(),
                targetPath);
    }

    public void notifyPostCommented(User actor, Post post) {
        if (actor.getId().equals(post.getAuthorId())) {
            return;
        }
        String targetPath = post.getCommunityName() == null
                ? "/feed#post-" + post.getId()
                : "/comunidades?group=" + java.net.URLEncoder.encode(post.getCommunityName(), java.nio.charset.StandardCharsets.UTF_8) + "#post-" + post.getId();
        createNotification(
                post.getAuthorId(),
                "POST_COMMENTED",
                actor.getName() + " comentou na sua publicação.",
                actor,
                post.getId(),
                null,
                post.getCommunityName(),
                targetPath);
    }

    public void notifyPrivateCommunityJoinRequest(User requester, Community community) {
        String ownerId = community.getOwnerId();
        if ((ownerId == null || ownerId.isBlank()) && !community.getMemberIds().isEmpty()) {
            ownerId = community.getMemberIds().get(0);
        }
        if (ownerId == null || ownerId.isBlank()) {
            return;
        }
        if (ownerId.equals(requester.getId())) {
            return;
        }
        createNotification(
                ownerId,
                "PRIVATE_GROUP_JOIN_REQUEST",
                requester.getName() + " pediu para entrar no grupo " + community.getName() + ".",
                requester,
                null,
                community.getId(),
                community.getName(),
                "/comunidades?group=" + java.net.URLEncoder.encode(community.getName(), java.nio.charset.StandardCharsets.UTF_8));
    }

    public void notifyUserFollowed(User actor, User followed) {
        if (actor.getId().equals(followed.getId())) {
            return;
        }
        createNotification(
                followed.getId(),
                "USER_FOLLOWED",
                actor.getName() + " começou a seguir você.",
                actor,
                null,
                null,
                null,
                "/perfil/" + actor.getId());
    }

    public void notifyPrivateFollowRequest(User requester, User target) {
        if (requester.getId().equals(target.getId())) {
            return;
        }
        createNotification(
                target.getId(),
                "PRIVATE_FOLLOW_REQUEST",
                requester.getName() + " pediu para seguir você.",
                requester,
                null,
                null,
                null,
                "/perfil/" + requester.getId());
    }

    public void notifyPrivateCommunityRequestApproved(User actor, User requester, Community community) {
        createNotification(
                requester.getId(),
                "PRIVATE_GROUP_REQUEST_APPROVED",
                actor.getName() + " aprovou seu pedido para entrar no grupo " + community.getName() + ".",
                actor,
                null,
                community.getId(),
                community.getName(),
                "/comunidades?group=" + java.net.URLEncoder.encode(community.getName(), java.nio.charset.StandardCharsets.UTF_8));
    }

    public void notifyPrivateCommunityRequestRejected(User actor, User requester, Community community) {
        createNotification(
                requester.getId(),
                "PRIVATE_GROUP_REQUEST_REJECTED",
                actor.getName() + " recusou seu pedido para entrar no grupo " + community.getName() + ".",
                actor,
                null,
                community.getId(),
                community.getName(),
                "/comunidades");
    }

    public void notifyCommunityMemberRemoved(User actor, User removedUser, Community community) {
        createNotification(
                removedUser.getId(),
                "COMMUNITY_MEMBER_REMOVED",
                actor.getName() + " removeu você do grupo " + community.getName() + ".",
                actor,
                null,
                community.getId(),
                community.getName(),
                "/comunidades");
    }

    private void createNotification(
            String userId,
            String type,
            String message,
            User actor,
            String postId,
            String communityId,
            String communityName,
            String targetPath) {
        notificationRepository.save(new Notification(
                userId,
                type,
                message,
                actor.getId(),
                actor.getName(),
                actor.getAvatarUrl(),
                postId,
                communityId,
                communityName,
                targetPath));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getActorId(),
                notification.getActorName(),
                notification.getActorAvatarUrl(),
                notification.getPostId(),
                notification.getCommunityId(),
                notification.getCommunityName(),
                notification.getTargetPath(),
                notification.isRead(),
                notification.getCreatedAt());
    }
}
