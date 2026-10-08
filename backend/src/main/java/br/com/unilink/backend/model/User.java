package br.com.unilink.backend.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String institutionName;

    private String institutionDomain;

    private String campus;

    private String course;

    private Integer academicPeriod;

    private String avatarUrl;

    private String headerUrl;

    private Integer avatarPositionX;

    private Integer avatarPositionY;

    private Integer headerPositionX;

    private Integer headerPositionY;

    private boolean demoAccount;

    private Instant createdAt;

    protected User() {
    }

    public User(String username, String name, String email, String passwordHash) {
        this.username = username;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public String getInstitutionDomain() {
        return institutionDomain;
    }

    public String getCampus() {
        return campus;
    }

    public String getCourse() {
        return course;
    }

    public Integer getAcademicPeriod() {
        return academicPeriod;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getHeaderUrl() {
        return headerUrl;
    }

    public Integer getAvatarPositionX() { return avatarPositionX; }
    public Integer getAvatarPositionY() { return avatarPositionY; }
    public Integer getHeaderPositionX() { return headerPositionX; }
    public Integer getHeaderPositionY() { return headerPositionY; }

    public boolean isDemoAccount() {
        return demoAccount;
    }

    public void markAsDemoAccount() {
        this.demoAccount = true;
    }

    public boolean isOnboardingCompleted() {
        return institutionName != null && campus != null && course != null && academicPeriod != null;
    }

    public void completeOnboarding(
            String institutionName,
            String institutionDomain,
            String campus,
            String course,
            Integer academicPeriod) {
        this.institutionName = institutionName;
        this.institutionDomain = institutionDomain;
        this.campus = campus;
        this.course = course;
        this.academicPeriod = academicPeriod;
    }

    public void updateProfile(
            String name,
            String username,
            String avatarUrl,
            String headerUrl,
            Integer avatarPositionX,
            Integer avatarPositionY,
            Integer headerPositionX,
            Integer headerPositionY) {
        this.name = name;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.headerUrl = headerUrl;
        this.avatarPositionX = avatarPositionX;
        this.avatarPositionY = avatarPositionY;
        this.headerPositionX = headerPositionX;
        this.headerPositionY = headerPositionY;
    }

    public void updateDemoProfile(String name, String username) {
        this.name = name;
        this.username = username;
        this.demoAccount = true;
    }
}
