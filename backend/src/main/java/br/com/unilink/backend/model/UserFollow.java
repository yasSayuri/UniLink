package br.com.unilink.backend.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_follows")
@CompoundIndex(name = "follower_followed_unique", def = "{'followerId': 1, 'followedId': 1}", unique = true)
public class UserFollow {

    @Id
    private String id;

    private String followerId;

    private String followedId;

    private Instant createdAt;

    protected UserFollow() {
    }

    public UserFollow(String followerId, String followedId) {
        this.followerId = followerId;
        this.followedId = followedId;
        this.createdAt = Instant.now();
    }

    public String getFollowerId() {
        return followerId;
    }

    public String getFollowedId() {
        return followedId;
    }
}
