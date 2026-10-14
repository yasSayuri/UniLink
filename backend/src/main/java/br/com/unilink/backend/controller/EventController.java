package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.EventRequest;
import br.com.unilink.backend.dto.EventResponse;
import br.com.unilink.backend.service.EventService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> list(Principal principal) {
        return eventService.list(principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(Principal principal, @Valid @RequestBody EventRequest request) {
        return eventService.create(request, principal.getName());
    }

    @PatchMapping("/{eventId}")
    public EventResponse update(Principal principal, @PathVariable String eventId, @Valid @RequestBody EventRequest request) {
        return eventService.update(eventId, request, principal.getName());
    }

    @DeleteMapping("/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Principal principal, @PathVariable String eventId) {
        eventService.delete(eventId, principal.getName());
    }
}
