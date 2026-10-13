package br.com.unilink.backend.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String type;
    private String message;
    private String actorId;
    private String actorName;
    private String actorAvatarUrl;
    private String postId;
    private String communityId;
    private String communityName;
    private String targetPath;
    private boolean read;
    private Instant createdAt;

    protected Notification() {
    }

    public Notification(
            String userId,
            String type,
            String message,
            String actorId,
            String actorName,
            String actorAvatarUrl,
            String postId,
            String communityId,
            String communityName,
            String targetPath) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.actorId = actorId;
        this.actorName = actorName;
        this.actorAvatarUrl = actorAvatarUrl;
        this.postId = postId;
        this.communityId = communityId;
        this.communityName = communityName;
        this.targetPath = targetPath;
        this.read = false;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public String getActorId() {
        return actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public String getActorAvatarUrl() {
        return actorAvatarUrl;
    }

    public String getPostId() {
        return postId;
    }

    public String getCommunityId() {
        return communityId;
    }

    public String getCommunityName() {
        return communityName;
    }

    public String getTargetPath() {
        return targetPath;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void markAsRead() {
        this.read = true;
    }
}
