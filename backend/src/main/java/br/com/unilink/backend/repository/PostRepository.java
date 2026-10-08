package br.com.unilink.backend.repository;

import java.util.List;

import br.com.unilink.backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PostRepository extends MongoRepository<Post, String> {

    List<Post> findAllByOrderByCreatedAtDesc();

    boolean existsByAuthorIdAndContentAndCommunityName(String authorId, String content, String communityName);

    List<Post> findAllByAuthorId(String authorId);
}
