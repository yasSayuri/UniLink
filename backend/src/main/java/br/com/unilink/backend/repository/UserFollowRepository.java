package br.com.unilink.backend.repository;

import br.com.unilink.backend.model.UserFollow;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserFollowRepository extends MongoRepository<UserFollow, String> {

    boolean existsByFollowerIdAndFollowedId(String followerId, String followedId);

    void deleteByFollowerIdAndFollowedId(String followerId, String followedId);

    List<UserFollow> findAllByFollowerId(String followerId);

    List<UserFollow> findAllByFollowedId(String followedId);

    long countByFollowerId(String followerId);

    long countByFollowedId(String followedId);
}
