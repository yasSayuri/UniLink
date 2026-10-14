package br.com.unilink.backend.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_blocks")
@CompoundIndex(name = "blocker_blocked_unique", def = "{'blockerId': 1, 'blockedId': 1}", unique = true)
public class UserBlock {

    @Id
    private String id;

    private String blockerId;
    private String blockedId;
    private Instant createdAt;

    protected UserBlock() {
    }

    public UserBlock(String blockerId, String blockedId) {
        this.blockerId = blockerId;
        this.blockedId = blockedId;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getBlockerId() {
        return blockerId;
    }

    public String getBlockedId() {
        return blockedId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
