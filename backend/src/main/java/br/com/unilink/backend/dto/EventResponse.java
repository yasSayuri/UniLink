package br.com.unilink.backend.dto;

public record EventResponse(
        String id,
        String ownerId,
        String title,
        String description,
        String category,
        String date,
        String time,
        String location,
        String imageUrl,
        Integer imagePositionX,
        Integer imagePositionY,
        boolean createdByMe) {
}
