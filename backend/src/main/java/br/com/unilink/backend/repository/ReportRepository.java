package br.com.unilink.backend.repository;

import br.com.unilink.backend.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReportRepository extends MongoRepository<Report, String> {

    boolean existsByPostIdAndReporterId(String postId, String reporterId);

    boolean existsByTargetTypeAndTargetIdAndReporterId(String targetType, String targetId, String reporterId);
}
