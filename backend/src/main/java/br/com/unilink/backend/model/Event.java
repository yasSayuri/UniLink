package br.com.unilink.backend.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "events")
public class Event {

    @Id
    private String id;
    private String ownerId;
    private String title;
    private String description;
    private String category;
    private String date;
    private String time;
    private String location;
    private String imageUrl;
    private Integer imagePositionX;
    private Integer imagePositionY;
    private Instant createdAt;

    protected Event() {
    }

    public Event(String ownerId, String title, String description, String category, String date, String time, String location, String imageUrl, Integer imagePositionX, Integer imagePositionY) {
        this.ownerId = ownerId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.date = date;
        this.time = time;
        this.location = location;
        this.imageUrl = imageUrl;
        this.imagePositionX = imagePositionX;
        this.imagePositionY = imagePositionY;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getOwnerId() { return ownerId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public String getLocation() { return location; }
    public String getImageUrl() { return imageUrl; }
    public Integer getImagePositionX() { return imagePositionX; }
    public Integer getImagePositionY() { return imagePositionY; }
    public Instant getCreatedAt() { return createdAt; }

    public void update(String title, String description, String category, String date, String time, String location, String imageUrl, Integer imagePositionX, Integer imagePositionY) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.date = date;
        this.time = time;
        this.location = location;
        this.imageUrl = imageUrl;
        this.imagePositionX = imagePositionX;
        this.imagePositionY = imagePositionY;
    }
}
