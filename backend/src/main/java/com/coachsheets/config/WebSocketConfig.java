package com.coachsheets.config;

import com.coachsheets.websocket.SheetWebSocketHandler;
import com.coachsheets.websocket.ChatWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    private final SheetWebSocketHandler sheetHandler;
    private final ChatWebSocketHandler chatHandler;
    
    public WebSocketConfig(SheetWebSocketHandler sheetHandler, ChatWebSocketHandler chatHandler) {
        this.sheetHandler = sheetHandler;
        this.chatHandler = chatHandler;
    }
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(sheetHandler, "/ws/sheet/**")
                .setAllowedOrigins("*");
        registry.addHandler(chatHandler, "/ws/chat/**")
                .setAllowedOrigins("*");
    }
}
