package com.fitproject.services.notificaciones;

import com.fitproject.services.notificaciones.dto.AlertaRequest;
import com.fitproject.services.notificaciones.model.Notificacion;
import com.fitproject.services.notificaciones.repository.NotificacionRepository;
import com.fitproject.services.notificaciones.service.EmailService;
import com.fitproject.services.notificaciones.service.NotificacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class NotificacionServiceTest {

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificacionService notificacionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void procesarAlerta_DebeCrearNotificacionYEnviarCorreo() {
        // Arrange
        AlertaRequest alertaRequest = new AlertaRequest();
        alertaRequest.setCorreoSupervisor("supervisor@fitproject.com");
        alertaRequest.setNombreHito("Instalación Eléctrica");

        Notificacion notificacionGuardada = new Notificacion();
        notificacionGuardada.setId(1L);
        notificacionGuardada.setCorreoDestinatario("supervisor@fitproject.com");
        notificacionGuardada.setMensaje("El hito 'Instalación Eléctrica' ha sido completado al 100%. Por favor revise el avance de la obra.");
        notificacionGuardada.setTipoAlerta("AVANCE_OBRA");
        notificacionGuardada.setEstado("ENVIADO");

        when(emailService.enviarCorreo(anyString(), anyString(), anyString())).thenReturn(true);
        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(notificacionGuardada);

        // Act
        Notificacion resultado = notificacionService.procesarAlerta(alertaRequest);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("supervisor@fitproject.com", resultado.getCorreoDestinatario());
        assertEquals("AVANCE_OBRA", resultado.getTipoAlerta());
        assertEquals("ENVIADO", resultado.getEstado());
        assertTrue(resultado.getMensaje().contains("Instalación Eléctrica"));

        verify(emailService, times(1)).enviarCorreo(
                eq("supervisor@fitproject.com"),
                eq("Alerta de Avance de Obra - Hito Completado"),
                contains("Instalación Eléctrica")
        );
        verify(notificacionRepository, times(1)).save(any(Notificacion.class));
    }

    @Test
    void procesarAlerta_CuandoCorreoFalla_DebeMantenerEstadoPendiente() {
        // Arrange
        AlertaRequest alertaRequest = new AlertaRequest();
        alertaRequest.setCorreoSupervisor("supervisor@fitproject.com");
        alertaRequest.setNombreHito("Preparación del contenedor");

        Notificacion notificacionGuardada = new Notificacion();
        notificacionGuardada.setId(2L);
        notificacionGuardada.setCorreoDestinatario("supervisor@fitproject.com");
        notificacionGuardada.setMensaje("El hito 'Preparación del contenedor' ha sido completado al 100%. Por favor revise el avance de la obra.");
        notificacionGuardada.setTipoAlerta("AVANCE_OBRA");
        notificacionGuardada.setEstado("PENDIENTE");

        when(emailService.enviarCorreo(anyString(), anyString(), anyString())).thenReturn(false);
        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(notificacionGuardada);

        // Act
        Notificacion resultado = notificacionService.procesarAlerta(alertaRequest);

        // Assert
        assertNotNull(resultado);
        assertEquals("PENDIENTE", resultado.getEstado());

        verify(emailService, times(1)).enviarCorreo(anyString(), anyString(), anyString());
        verify(notificacionRepository, times(1)).save(any(Notificacion.class));
    }

    @Test
    void obtenerTodasLasNotificaciones_DebeRetornarListaDelRepository() {
        // Arrange
        List<Notificacion> notificacionesEsperadas = List.of(
                new Notificacion(1L, "correo1@test.com", "Mensaje 1", "AVANCE_OBRA", "ENVIADO"),
                new Notificacion(2L, "correo2@test.com", "Mensaje 2", "AVANCE_OBRA", "ENVIADO")
        );

        when(notificacionRepository.findAll()).thenReturn(notificacionesEsperadas);

        // Act
        List<Notificacion> resultado = notificacionService.obtenerTodasLasNotificaciones();

        // Assert
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals(notificacionesEsperadas, resultado);

        verify(notificacionRepository, times(1)).findAll();
    }
}
