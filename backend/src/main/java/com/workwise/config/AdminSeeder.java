package com.workwise.config;

import com.workwise.domain.AppUser;
import com.workwise.domain.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Cria o primeiro usuário a partir de ADMIN_EMAIL / ADMIN_PASSWORD, só se ainda não houver nenhum. */
@Component
public class AdminSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final SecurityProperties props;

    public AdminSeeder(UserRepository users, PasswordEncoder encoder, SecurityProperties props) {
        this.users = users;
        this.encoder = encoder;
        this.props = props;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) return;
        String email = props.adminEmail(), password = props.adminPassword();
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.warn("Nenhum usuário cadastrado. Defina ADMIN_EMAIL e ADMIN_PASSWORD para criar o primeiro acesso.");
            return;
        }
        if (password.length() < 12) throw new IllegalStateException("ADMIN_PASSWORD deve ter pelo menos 12 caracteres");
        AppUser u = new AppUser();
        u.setEmail(email.trim().toLowerCase());
        u.setPasswordHash(encoder.encode(password));
        users.save(u);
        log.info("Usuário inicial criado: {}", u.getEmail());
    }
}
