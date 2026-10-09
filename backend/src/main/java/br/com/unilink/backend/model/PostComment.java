package br.com.unilink.backend.model;

import java.time.Instant;
import java.util.UUID;

public class PostComment {

    private String id;
    private String authorId;
    private String authorName;
    private String authorUsername;
    private String authorAvatarUrl;
    private String content;
    private Instant createdAt;

    protected PostComment() {
    }

    public PostComment(User author, String content) {
        this.id = UUID.randomUUID().toString();
        this.authorId = author.getId();
        this.authorName = author.getName();
        this.authorUsername = author.getUsername();
        this.authorAvatarUrl = author.getAvatarUrl();
        this.content = content;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getAuthorId() {
        return authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public String getAuthorAvatarUrl() {
        return authorAvatarUrl;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void updateContent(String content) {
        this.content = content;
    }
}
