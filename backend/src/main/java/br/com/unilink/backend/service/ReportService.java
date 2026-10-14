package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.CreateReportRequest;
import br.com.unilink.backend.model.Report;
import br.com.unilink.backend.model.ReportReason;
import br.com.unilink.backend.repository.PostRepository;
import br.com.unilink.backend.repository.ReportRepository;
import br.com.unilink.backend.repository.UserRepository;
import br.com.unilink.backend.repository.CommunityRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final UserBlockService userBlockService;

    @Autowired
    public ReportService(
            ReportRepository reportRepository,
            PostRepository postRepository,
            UserRepository userRepository,
            UserBlockService userBlockService,
            CommunityRepository communityRepository) {
        this.reportRepository = reportRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.userBlockService = userBlockService;
        this.communityRepository = communityRepository;
    }

    public ReportService(ReportRepository reportRepository, PostRepository postRepository) {
        this(reportRepository, postRepository, null, null, null);
    }

    public void create(String reporterId, String postId, CreateReportRequest request) {
        ReportReason reason;
        try {
            reason = ReportReason.fromValue(request.reason());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }

        var post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Publicação não encontrada."));
        if (reporterId.equals(post.getAuthorId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Você não pode denunciar sua própria publicação.");
        }
        if (reportRepository.existsByPostIdAndReporterId(postId, reporterId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Você já denunciou esta publicação.");
        }

        try {
            reportRepository.save(new Report(postId, reporterId, post.getAuthorId(), reason));
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Você já denunciou esta publicação.", exception);
        }
    }

    public void createUser(String reporterId, String reportedUserId, CreateReportRequest request) {
        ReportReason reason = parseReason(request);
        if (reporterId.equals(reportedUserId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Você não pode denunciar a si mesmo.");
        }

        if (userRepository == null || !userRepository.existsById(reportedUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }
        if (reportRepository.existsByTargetTypeAndTargetIdAndReporterId(
                "USER", reportedUserId, reporterId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Você já denunciou este usuário.");
        }

        try {
            reportRepository.save(Report.forUser(reportedUserId, reporterId, reason));
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Você já denunciou este usuário.", exception);
        }
        if (Boolean.TRUE.equals(request.blockWithReport()) && userBlockService != null) {
            userBlockService.block(reporterId, reportedUserId);
        }
    }

    public void createCommunity(String reporterId, String communityId, CreateReportRequest request) {
        ReportReason reason = parseReason(request);
        if (communityRepository == null || !communityRepository.existsById(communityId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Grupo não encontrado.");
        }
        if (reportRepository.existsByTargetTypeAndTargetIdAndReporterId(
                "COMMUNITY", communityId, reporterId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Você já denunciou este grupo.");
        }

        try {
            reportRepository.save(Report.forCommunity(communityId, reporterId, reason));
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Você já denunciou este grupo.", exception);
        }
    }

    private ReportReason parseReason(CreateReportRequest request) {
        try {
            return ReportReason.fromValue(request.reason());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }
}
