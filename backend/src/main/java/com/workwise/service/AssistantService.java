package com.workwise.service;

import com.workwise.domain.Candidate;
import com.workwise.domain.CandidateRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AssistantService {
    private static final String SYSTEM = """
            Você é o assistente de RH do WorkWise. Responda no mesmo idioma da pergunta, de forma objetiva.
            Use apenas o contexto fornecido; se a informação não estiver lá, diga que não sabe.
            Você apoia a decisão da pessoa recrutadora e nunca decide contratar ou recusar alguém.
            """;

    private final ObjectProvider<GroqClient> groq;
    private final CandidateRepository repo;

    public AssistantService(ObjectProvider<GroqClient> groq, CandidateRepository repo) {
        this.groq = groq;
        this.repo = repo;
    }

    public String reply(String message, Long candidateId) {
        GroqClient client = groq.getIfAvailable();
        if (client == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "IA desativada: defina GROQ_API_KEY");
        }
        String user = message;
        if (candidateId != null) {
            Candidate c = repo.findById(candidateId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidato não encontrado"));
            user = "Contexto do candidato (sem dados pessoais):\n" + context(c) + "\n\nPergunta: " + message;
        }
        return client.chat(List.of(GroqClient.Message.system(SYSTEM), GroqClient.Message.user(user)), false);
    }

    /** Nome e e-mail ficam de fora de propósito: a IA não precisa deles. */
    private String context(Candidate c) {
        String skills = c.getSkills().stream().map(s -> s.name() + " " + s.matchPercent() + "%").collect(Collectors.joining(", "));
        String exp = c.getExperience().stream().map(e -> e.title() + " (" + e.period() + ")").collect(Collectors.joining("; "));
        return "Vaga: " + c.getRole() + "\nNota: " + c.getScore() + "\nHabilidades: " + skills
                + "\nExperiência: " + exp + "\nResumo: " + c.getSummaryPt();
    }
}
