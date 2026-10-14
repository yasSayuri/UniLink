package br.com.unilink.backend.service;

import java.util.List;
import java.util.Optional;

import br.com.unilink.backend.dto.CreateReportRequest;
import br.com.unilink.backend.model.Post;
import br.com.unilink.backend.model.Report;
import br.com.unilink.backend.repository.PostRepository;
import br.com.unilink.backend.repository.ReportRepository;
import br.com.unilink.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserBlockService userBlockService;

    @InjectMocks
    private ReportService reportService;

    @Test
    void createsPendingReportForAnotherUsersPost() {
        Post post = post("author");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));
        when(reportRepository.existsByPostIdAndReporterId("post-id", "reporter")).thenReturn(false);

        reportService.create("reporter", "post-id",
                new CreateReportRequest("SPAM_OR_SCAM"));

        ArgumentCaptor<Report> captor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(captor.capture());
        assertEquals("post-id", captor.getValue().getPostId());
        assertEquals("reporter", captor.getValue().getReporterId());
        assertEquals("author", captor.getValue().getReportedUserId());
        assertEquals("SPAM_OR_SCAM", captor.getValue().getReason().name());
        assertEquals("PENDING", captor.getValue().getStatus());
    }

    @Test
    void rejectsDuplicateReport() {
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post("author")));
        when(reportRepository.existsByPostIdAndReporterId("post-id", "reporter")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                reportService.create("reporter", "post-id",
                        new CreateReportRequest("OTHER")));

        assertEquals(409, exception.getStatusCode().value());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void rejectsReportOfOwnPost() {
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post("reporter")));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                reportService.create("reporter", "post-id",
                        new CreateReportRequest("OTHER")));

        assertEquals(409, exception.getStatusCode().value());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void rejectsUnknownPost() {
        when(postRepository.findById("missing")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                reportService.create("reporter", "missing",
                        new CreateReportRequest("OTHER")));

        assertEquals(404, exception.getStatusCode().value());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void rejectsUnknownReason() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                reportService.create("reporter", "post-id",
                        new CreateReportRequest("NOT_A_REASON")));

        assertEquals(400, exception.getStatusCode().value());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void createsProfileReportAndOptionalBlock() {
        when(userRepository.existsById("target")).thenReturn(true);
        when(reportRepository.existsByTargetTypeAndTargetIdAndReporterId("USER", "target", "reporter"))
                .thenReturn(false);

        reportService.createUser("reporter", "target",
                new CreateReportRequest("HATE_SPEECH", true));

        ArgumentCaptor<Report> captor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(captor.capture());
        assertEquals("USER", captor.getValue().getTargetType());
        assertEquals("target", captor.getValue().getTargetId());
        verify(userBlockService).block("reporter", "target");
    }

    @Test
    void rejectsDuplicateAndSelfProfileReports() {
        when(userRepository.existsById("target")).thenReturn(true);
        when(reportRepository.existsByTargetTypeAndTargetIdAndReporterId("USER", "target", "reporter"))
                .thenReturn(true);
        assertEquals(409, assertThrows(ResponseStatusException.class, () ->
                reportService.createUser("reporter", "target", new CreateReportRequest("OTHER")))
                .getStatusCode().value());
        assertEquals(409, assertThrows(ResponseStatusException.class, () ->
                reportService.createUser("same", "same", new CreateReportRequest("OTHER")))
                .getStatusCode().value());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void createsProfileReportWithoutBlockingWhenRequested() {
        when(userRepository.existsById("target")).thenReturn(true);
        when(reportRepository.existsByTargetTypeAndTargetIdAndReporterId("USER", "target", "reporter"))
                .thenReturn(false);

        reportService.createUser("reporter", "target",
                new CreateReportRequest("OTHER", false));

        verify(reportRepository).save(any(Report.class));
        verify(userBlockService, never()).block("reporter", "target");
    }

    private Post post(String authorId) {
        return new Post(authorId, "Author", "author", null, null, null,
                "Content", "PUBLIC", null, List.of(), List.of());
    }
}
