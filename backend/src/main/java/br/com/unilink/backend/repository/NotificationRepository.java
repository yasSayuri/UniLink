package br.com.unilink.backend.repository;

import br.com.unilink.backend.model.Notification;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findAllByUserIdOrderByCreatedAtDesc(String userId);

    void deleteByUserId(String userId);

    void deleteByUserIdAndTypeAndActorId(String userId, String type, String actorId);
}
