package br.com.unilink.backend.repository;

import br.com.unilink.backend.model.Community;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommunityRepository extends MongoRepository<Community, String> {

    boolean existsByName(String name);
    boolean existsByNameIgnoreCase(String name);

    List<Community> findAllByOrderByNameAsc();
    List<Community> findAllByOwnerIdOrderByNameAsc(String ownerId);

    Optional<Community> findByName(String name);
}
