package com.workwise.config;

import com.workwise.domain.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Dados de demonstração (os mesmos do mock do front-end). Só roda com o banco vazio. */
@Component
@Profile("!prod") // sem candidatos de demonstração em produção
public class DataSeeder implements CommandLineRunner {
    private final CandidateRepository repo;

    public DataSeeder(CandidateRepository repo) { this.repo = repo; }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        repo.saveAll(List.of(
            make("Marina Duarte", "marina@example.com", "Front-end Developer", 91, Status.SHORTLIST,
                List.of(new SkillEntry("React", 95), new SkillEntry("TypeScript", 90), new SkillEntry("SASS", 85)),
                List.of(new ExperienceEntry("Nuvem Digital", "Front-end Sênior", "2022 – 2025"),
                        new ExperienceEntry("Studio Pixel", "Desenvolvedora Web", "2019 – 2022")),
                "Perfil forte em interfaces React com foco em acessibilidade e testes.",
                "Strong React UI profile with a focus on accessibility and testing.", 5, 2),
            make("Rafael Nogueira", "rafael@example.com", "Java Back-end Developer", 84, Status.REVIEW,
                List.of(new SkillEntry("Java", 92), new SkillEntry("Spring Boot", 88), new SkillEntry("PostgreSQL", 70)),
                List.of(new ExperienceEntry("FinCore", "Back-end Pleno", "2021 – 2025"),
                        new ExperienceEntry("Logix", "Estagiário de TI", "2020 – 2021")),
                "Boa base em Spring Boot e APIs REST; experiência limitada com mensageria.",
                "Solid Spring Boot and REST API base; limited messaging experience.", 3, -1),
            make("Camila Prado", "camila@example.com", "Full-stack Developer", 0, Status.NEW,
                List.of(new SkillEntry("Node.js", 78), new SkillEntry("React", 74), new SkillEntry("Docker", 55)),
                List.of(new ExperienceEntry("Agência Norte", "Full-stack Júnior", "2023 – 2025")),
                "Perfil versátil em início de carreira, com potencial de crescimento.",
                "Versatile early-career profile with growth potential.", 1, -1),
            make("Bruno Faria", "bruno@example.com", "QA Engineer", 58, Status.REJECTED,
                List.of(new SkillEntry("Cypress", 66), new SkillEntry("Jest", 60)),
                List.of(new ExperienceEntry("TestLab", "Analista de QA", "2022 – 2025")),
                "Experiência em testes manuais; pouca automação para a vaga atual.",
                "Manual testing experience; little automation for the current role.", 6, 3)
        ));
    }

    /** feedbackDaysAgo < 0 significa que o feedback ainda não foi enviado. */
    private Candidate make(String name, String email, String role, int score, Status status,
                           List<SkillEntry> skills, List<ExperienceEntry> exp,
                           String pt, String en, int createdDaysAgo, int feedbackDaysAgo) {
        Candidate c = new Candidate();
        c.setName(name); c.setEmail(email); c.setRole(role); c.setScore(score); c.setStatus(status);
        c.setSkills(skills); c.setExperience(exp); c.setSummaryPt(pt); c.setSummaryEn(en);
        c.setResumeText(role + ". Habilidades: "
                + skills.stream().map(SkillEntry::name).collect(java.util.stream.Collectors.joining(", "))
                + ". Experiência: "
                + exp.stream().map(e -> e.title() + " na " + e.company() + " (" + e.period() + ")")
                      .collect(java.util.stream.Collectors.joining("; ")) + ".");
        c.setCreatedAt(Instant.now().minus(createdDaysAgo, ChronoUnit.DAYS));
        if (feedbackDaysAgo >= 0) c.setFeedbackSentAt(Instant.now().minus(feedbackDaysAgo, ChronoUnit.DAYS));
        return c;
    }
}
