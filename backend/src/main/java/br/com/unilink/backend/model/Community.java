package br.com.unilink.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "communities")
public class Community {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;

    private String category;

    private String campus;

    private String imageUrl;

    private String visibility;

    private List<String> memberIds = new ArrayList<>();

    private List<String> pendingRequestUserIds = new ArrayList<>();

    private Instant createdAt;

    protected Community() {
    }

    public Community(
            String name,
            String description,
            String category,
            String campus,
            String imageUrl,
            String visibility) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.campus = campus;
        this.imageUrl = imageUrl;
        this.visibility = visibility;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getCampus() {
        return campus;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getVisibility() {
        return visibility;
    }

    public List<String> getMemberIds() {
        return memberIds == null ? List.of() : List.copyOf(memberIds);
    }

    public List<String> getPendingRequestUserIds() {
        return pendingRequestUserIds == null ? List.of() : List.copyOf(pendingRequestUserIds);
    }

    public void updateDiscoveryDetails(String description, String category, String campus, String imageUrl, String visibility) {
        this.description = description;
        this.category = category;
        this.campus = campus;
        this.imageUrl = imageUrl;
        this.visibility = visibility;
        if (this.memberIds == null) {
            this.memberIds = new ArrayList<>();
        }
        if (this.pendingRequestUserIds == null) {
            this.pendingRequestUserIds = new ArrayList<>();
        }
    }

    public void addMember(String userId) {
        if (memberIds == null) {
            memberIds = new ArrayList<>();
        }
        if (!memberIds.contains(userId)) {
            memberIds.add(userId);
        }
        if (pendingRequestUserIds != null) {
            pendingRequestUserIds.remove(userId);
        }
    }

    public void requestMembership(String userId) {
        if (pendingRequestUserIds == null) {
            pendingRequestUserIds = new ArrayList<>();
        }
        if (!pendingRequestUserIds.contains(userId)) {
            pendingRequestUserIds.add(userId);
        }
    }
}
