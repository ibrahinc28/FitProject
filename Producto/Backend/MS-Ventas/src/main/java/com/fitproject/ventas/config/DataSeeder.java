package com.fitproject.ventas.config;

import com.fitproject.ventas.model.GymModel;
import com.fitproject.ventas.repository.GymModelRepository;
import com.fitproject.ventas.repository.GymUnitRepository;
import com.fitproject.ventas.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final GymModelRepository modelRepository;
    private final GymUnitRepository  unitRepository;
    private final SaleRepository     saleRepository;

    @Override
    public void run(String... args) {
        boolean needsReseed = modelRepository.count() == 0 ||
            modelRepository.findAll().stream()
                .anyMatch(m -> m.getPrice().compareTo(new BigDecimal("1000000")) < 0);

        if (!needsReseed) return;

        log.info("Reseedando modelos con precios en CLP...");
        saleRepository.deleteAll();
        unitRepository.deleteAll();
        modelRepository.deleteAll();

        modelRepository.saveAll(List.of(
            GymModel.builder()
                .name("FitMini")
                .description("Contenedor de 20 pies transformado en un gimnasio compacto y funcional. Ideal para uso residencial o pequeños locales comerciales. Incluye aire acondicionado, espejo de pared completa, piso rubber premium, iluminación LED y 4 estaciones de entrenamiento.")
                .price(new BigDecimal("12990000"))
                .areaM2(14).capacity(4).available(true).build(),

            GymModel.builder()
                .name("FitStandard")
                .description("Contenedor de 40 pies con equipamiento completo para entrenamiento funcional y de fuerza. La opción más elegida por emprendedores del fitness en Chile. Zona cardio, pesas libres, área funcional, baño integrado y WiFi incluidos.")
                .price(new BigDecimal("24990000"))
                .areaM2(28).capacity(8).available(true).build(),

            GymModel.builder()
                .name("FitPro")
                .description("Doble contenedor de 40 pies fusionado con dos ambientes independientes: sala de pesas y estudio de clases. Diseñado para alto tráfico comercial. Incluye vestuarios, sistema de reservas digital y CCTV.")
                .price(new BigDecimal("44990000"))
                .areaM2(56).capacity(15).available(true).build(),

            GymModel.builder()
                .name("FitStudio")
                .description("Contenedor de 40 pies especializado en clases grupales: yoga, pilates, spinning o crossfit. Piso flotante antiimpacto, acústica profesional, ventanales panorámicos y climatización silenciosa.")
                .price(new BigDecimal("21990000"))
                .areaM2(28).capacity(12).available(true).build(),

            GymModel.builder()
                .name("FitElite")
                .description("Módulo triple con diseño arquitectónico de alto nivel. Acabados premium, iluminación ambiental inteligente y tecnología de vanguardia. Incluye sauna seco y húmedo, zona de recuperación, app de gestión propia e instalación llave en mano con garantía extendida 5 años.")
                .price(new BigDecimal("74990000"))
                .areaM2(84).capacity(25).available(true).build()
        ));

        log.info("Seeder completado: {} modelos con precios en CLP.", modelRepository.count());
    }
}
