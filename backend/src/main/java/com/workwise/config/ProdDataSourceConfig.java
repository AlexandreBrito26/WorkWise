package com.workwise.config;

import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/** Converte DATABASE_URL (postgres://usuario:senha@host:porta/banco, formato do Render) em JDBC. */
@Configuration
@Profile("prod")
public class ProdDataSourceConfig {

    @Bean
    DataSource dataSource(@Value("${DATABASE_URL}") String databaseUrl) {
        URI uri = URI.create(databaseUrl);
        String[] userInfo = uri.getUserInfo().split(":", 2);
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath());
        ds.setUsername(URLDecoder.decode(userInfo[0], StandardCharsets.UTF_8));
        ds.setPassword(URLDecoder.decode(userInfo[1], StandardCharsets.UTF_8));
        ds.setMaximumPoolSize(5);
        return ds;
    }
}
