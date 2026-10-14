package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.EventRequest;
import br.com.unilink.backend.dto.EventResponse;
import br.com.unilink.backend.model.Event;
import br.com.unilink.backend.repository.EventRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<EventResponse> list(String userId) {
        return eventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(event -> toResponse(event, userId))
                .toList();
    }

    public EventResponse create(EventRequest request, String ownerId) {
        Event event = new Event(ownerId, request.title().trim(), request.description().trim(), request.category().trim(),
                request.date().trim(), request.time().trim(), request.location().trim(), normalizeImage(request.imageUrl()),
                normalizePosition(request.imagePositionX()), normalizePosition(request.imagePositionY()));
        return toResponse(eventRepository.save(event), ownerId);
    }

    public EventResponse update(String eventId, EventRequest request, String ownerId) {
        Event event = findOwned(eventId, ownerId);
        event.update(request.title().trim(), request.description().trim(), request.category().trim(),
                request.date().trim(), request.time().trim(), request.location().trim(), normalizeImage(request.imageUrl()),
                normalizePosition(request.imagePositionX()), normalizePosition(request.imagePositionY()));
        return toResponse(eventRepository.save(event), ownerId);
    }

    public void delete(String eventId, String ownerId) {
        eventRepository.delete(findOwned(eventId, ownerId));
    }

    private Event findOwned(String eventId, String ownerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado."));
        if (!ownerId.equals(event.getOwnerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode alterar este evento.");
        }
        return event;
    }

    private EventResponse toResponse(Event event, String userId) {
        return new EventResponse(event.getId(), event.getOwnerId(), event.getTitle(), event.getDescription(),
                event.getCategory(), event.getDate(), event.getTime(), event.getLocation(), event.getImageUrl(),
                event.getImagePositionX(), event.getImagePositionY(), event.getOwnerId().equals(userId));
    }

    private String normalizeImage(String imageUrl) {
        return imageUrl == null || imageUrl.isBlank()
                ? "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85"
                : imageUrl.trim();
    }

    private Integer normalizePosition(Integer position) {
        return position == null ? 50 : Math.max(0, Math.min(100, position));
    }
}
