package br.com.unilink.backend.repository;

import br.com.unilink.backend.model.UserFollowRequest;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserFollowRequestRepository extends MongoRepository<UserFollowRequest, String> {

    boolean existsByRequesterIdAndTargetId(String requesterId, String targetId);

    UserFollowRequest findByRequesterIdAndTargetId(String requesterId, String targetId);

    List<UserFollowRequest> findAllByTargetIdOrderByCreatedAtAsc(String targetId);

    void deleteByRequesterIdAndTargetId(String requesterId, String targetId);

    void deleteByRequesterId(String requesterId);

    void deleteByTargetId(String targetId);
}
