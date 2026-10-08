package br.com.unilink.backend.model;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "posts")
public class Post {

    @Id
    private String id;

    private String authorId;

    private String authorName;

    private String authorUsername;

    private String institutionName;

    private String campus;

    private String content;

    private String privacy;

    private String communityName;

    private List<PostMedia> media;

    private List<String> hashtags;

    private Instant createdAt;

    private List<String> likedBy = new ArrayList<>();

    private List<PostComment> comments = new ArrayList<>();

    private List<String> repostedBy = new ArrayList<>();

    protected Post() {
    }

    public Post(
            String authorId,
            String authorName,
            String authorUsername,
            String institutionName,
            String campus,
            String content,
            String privacy,
            String communityName,
            List<PostMedia> media,
            List<String> hashtags) {
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorUsername = authorUsername;
        this.institutionName = institutionName;
        this.campus = campus;
        this.content = content;
        this.privacy = privacy;
        this.communityName = communityName;
        this.media = media;
        this.hashtags = hashtags;
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

    public String getInstitutionName() {
        return institutionName;
    }

    public String getCampus() {
        return campus;
    }

    public String getContent() {
        return content;
    }

    public String getPrivacy() {
        return privacy;
    }

    public String getCommunityName() {
        return communityName;
    }

    public List<PostMedia> getMedia() {
        return media;
    }

    public List<String> getHashtags() {
        return hashtags;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<String> getLikedBy() {
        return likedBy == null ? List.of() : likedBy;
    }

    public List<PostComment> getComments() {
        return comments == null ? List.of() : comments;
    }

    public List<String> getRepostedBy() {
        return repostedBy == null ? List.of() : repostedBy;
    }

    public void addLike(String userId) {
        if (likedBy == null) likedBy = new ArrayList<>();
        if (!likedBy.contains(userId)) likedBy.add(userId);
    }

    public void removeLike(String userId) {
        if (likedBy != null) likedBy.remove(userId);
    }

    public void addComment(PostComment comment) {
        if (comments == null) comments = new ArrayList<>();
        comments.add(comment);
    }

    public void addRepost(String userId) {
        if (repostedBy == null) repostedBy = new ArrayList<>();
        if (!repostedBy.contains(userId)) repostedBy.add(userId);
    }

    public void removeRepost(String userId) {
        if (repostedBy != null) repostedBy.remove(userId);
    }

    public void updateAuthorSnapshot(User author) {
        this.authorId = author.getId();
        this.authorName = author.getName();
        this.authorUsername = author.getUsername();
        this.institutionName = author.getInstitutionName();
        this.campus = author.getCampus();
    }
}
