package com.workwise.service;

import com.workwise.config.SecurityProperties;
import com.workwise.domain.AppUser;
import com.workwise.domain.UserRepository;
import com.workwise.web.Dtos.TokenResponse;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwt;
    private final SecurityProperties props;
    private final LoginAttempts attempts;
    private final String dummyHash;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtEncoder jwt,
                       SecurityProperties props, LoginAttempts attempts) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.props = props;
        this.attempts = attempts;
        this.dummyHash = encoder.encode("senha-falsa-para-igualar-tempo");
    }

    public TokenResponse login(String rawEmail, String password) {
        String email = rawEmail.trim().toLowerCase();
        if (attempts.isLocked(email)) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS);

        AppUser user = users.findByEmailIgnoreCase(email).orElse(null);
        // Sempre compara um hash, mesmo sem usuário, para não revelar por tempo de resposta quais e-mails existem.
        boolean passwordOk = encoder.matches(password, user != null ? user.getPasswordHash() : dummyHash);
        if (user == null || !passwordOk) {
            attempts.recordFailure(email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        attempts.reset(email);

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getEmail()).issuedAt(now).expiresAt(now.plus(props.tokenTtl())).build();
        String token = jwt.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new TokenResponse(token, props.tokenTtl().toSeconds());
    }
}
