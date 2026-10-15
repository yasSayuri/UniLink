package br.com.unilink.backend.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_follow_requests")
@CompoundIndex(name = "requester_target_unique", def = "{'requesterId': 1, 'targetId': 1}", unique = true)
public class UserFollowRequest {

    @Id
    private String id;

    private String requesterId;

    private String targetId;

    private Instant createdAt;

    protected UserFollowRequest() {
    }

    public UserFollowRequest(String requesterId, String targetId) {
        this.requesterId = requesterId;
        this.targetId = targetId;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getRequesterId() {
        return requesterId;
    }

    public String getTargetId() {
        return targetId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
