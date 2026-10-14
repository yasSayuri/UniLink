package br.com.unilink.backend.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reports")
@CompoundIndex(name = "reporter_target_unique", def = "{'reporterId': 1, 'targetType': 1, 'targetId': 1}", unique = true)
public class Report {

    @Id
    private String id;

    private String postId;
    private String reporterId;
    private String reportedUserId;
    private String targetType;
    private String targetId;
    private ReportReason reason;
    private Instant createdAt;
    private String status;

    protected Report() {
    }

    public Report(String postId, String reporterId, String reportedUserId, ReportReason reason) {
        this.postId = postId;
        this.reporterId = reporterId;
        this.reportedUserId = reportedUserId;
        this.targetType = "POST";
        this.targetId = postId;
        this.reason = reason;
        this.createdAt = Instant.now();
        this.status = "PENDING";
    }

    public static Report forUser(String targetUserId, String reporterId, ReportReason reason) {
        Report report = new Report(null, reporterId, targetUserId, reason);
        report.targetType = "USER";
        report.targetId = targetUserId;
        return report;
    }

    public static Report forCommunity(String communityId, String reporterId, ReportReason reason) {
        Report report = new Report(null, reporterId, null, reason);
        report.targetType = "COMMUNITY";
        report.targetId = communityId;
        return report;
    }

    public String getId() {
        return id;
    }

    public String getPostId() {
        return postId;
    }

    public String getReporterId() {
        return reporterId;
    }

    public String getReportedUserId() {
        return reportedUserId;
    }

    public String getTargetType() {
        return targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public ReportReason getReason() {
        return reason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getStatus() {
        return status;
    }
}
