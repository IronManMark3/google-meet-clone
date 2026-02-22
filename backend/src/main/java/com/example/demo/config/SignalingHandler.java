package com.example.demo.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SignalingHandler extends TextWebSocketHandler {

    // Maps a Room ID to a list of active WebSocket sessions in that room
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<WebSocketSession>> rooms = new ConcurrentHashMap<>();
    
    // Maps a Session ID to its Room ID for quick cleanup on disconnect
    private final ConcurrentHashMap<String, String> sessionRoomMap = new ConcurrentHashMap<>();
    
    // Used to parse incoming JSON messages from React
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
        String type = jsonMessage.get("type").asText();
        String roomId = jsonMessage.get("roomId").asText();

        // 1. If a user is joining, add them to the room's list
        if ("join".equals(type)) {
            rooms.putIfAbsent(roomId, new CopyOnWriteArrayList<>());
            rooms.get(roomId).add(session);
            sessionRoomMap.put(session.getId(), roomId);
            System.out.println("Session " + session.getId() + " joined room: " + roomId);
        }

        // 2. Broadcast the WebRTC message to EVERYONE ELSE in the same room
        if (rooms.containsKey(roomId)) {
            for (WebSocketSession s : rooms.get(roomId)) {
                if (s.isOpen() && !s.getId().equals(session.getId())) {
                    s.sendMessage(message);
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        // 3. When a user closes the tab, remove them from the room
        String roomId = sessionRoomMap.remove(session.getId());
        if (roomId != null && rooms.containsKey(roomId)) {
            rooms.get(roomId).remove(session);
            if (rooms.get(roomId).isEmpty()) {
                rooms.remove(roomId); // Clean up empty rooms to save server memory
            }
        }
        System.out.println("Session " + session.getId() + " disconnected.");
    }
}