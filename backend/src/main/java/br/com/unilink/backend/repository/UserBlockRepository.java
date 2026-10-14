package br.com.unilink.backend.repository;

import br.com.unilink.backend.model.UserBlock;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserBlockRepository extends MongoRepository<UserBlock, String> {

    boolean existsByBlockerIdAndBlockedId(String blockerId, String blockedId);

    void deleteByBlockerIdAndBlockedId(String blockerId, String blockedId);

    List<UserBlock> findAllByBlockerId(String blockerId);
}
