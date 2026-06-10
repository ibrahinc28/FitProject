package com.fitproject.services.notificaciones.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String NOTIFICATIONS_EXCHANGE = "fit.notifications";
    public static final String EVIDENCE_APPROVED_QUEUE = "evidence.approved.notifications";
    public static final String SALE_CONFIRMED_QUEUE    = "sale.confirmed.notifications";
    public static final String EVIDENCE_APPROVED_KEY   = "evidence.approved";
    public static final String SALE_CONFIRMED_KEY      = "sale.confirmed";

    @Bean
    public TopicExchange notificationsExchange() {
        return new TopicExchange(NOTIFICATIONS_EXCHANGE);
    }

    @Bean
    public Queue evidenceApprovedQueue() {
        return QueueBuilder.durable(EVIDENCE_APPROVED_QUEUE).build();
    }

    @Bean
    public Queue saleConfirmedQueue() {
        return QueueBuilder.durable(SALE_CONFIRMED_QUEUE).build();
    }

    @Bean
    public Binding evidenceApprovedBinding() {
        return BindingBuilder.bind(evidenceApprovedQueue())
                .to(notificationsExchange())
                .with(EVIDENCE_APPROVED_KEY);
    }

    @Bean
    public Binding saleConfirmedBinding() {
        return BindingBuilder.bind(saleConfirmedQueue())
                .to(notificationsExchange())
                .with(SALE_CONFIRMED_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
