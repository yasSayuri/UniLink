package br.com.unilink.backend.repository;

import br.com.unilink.backend.model.Event;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findAllByOrderByCreatedAtDesc();
}
