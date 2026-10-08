package br.com.unilink.backend.repository;

import java.util.Optional;
import java.util.List;

import br.com.unilink.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    List<User> findTop10ByNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(
            String name, String username);

    List<User> findAllByDemoAccountTrueAndIdNot(String id);

    boolean existsByUsernameAndIdNot(String username, String id);

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}
