package com.workwise.web;

import static com.workwise.web.Dtos.*;

import com.workwise.domain.*;
import com.workwise.service.ResumeTextExtractor;
import com.workwise.service.ScreeningService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class CandidateController {
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final CandidateRepository repo;
    private final ScreeningService screening;
    private final ResumeTextExtractor extractor;

    public CandidateController(CandidateRepository repo, ScreeningService screening, ResumeTextExtractor extractor) {
        this.repo = repo;
        this.screening = screening;
        this.extractor = extractor;
    }

    @GetMapping("/candidates")
    public List<CandidateDto> list() {
        return repo.findAll().stream().map(Dtos::toDto).toList();
    }

    @PostMapping("/candidates")
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateDto create(@Valid @RequestBody CreateCandidateRequest body) {
        return toDto(repo.save(newCandidate(body.name(), body.email(), body.role(), body.resumeText())));
    }

    /** Cadastro com currículo em PDF: extrai o texto e descarta o arquivo. */
    @PostMapping(value = "/candidates/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateDto upload(@RequestParam String name, @RequestParam String email,
                               @RequestParam String role, @RequestParam MultipartFile file) {
        if (name.isBlank() || name.length() > 120 || role.isBlank() || role.length() > 120
                || email.length() > 254 || !EMAIL.matcher(email).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados inválidos");
        }
        return toDto(repo.save(newCandidate(name, email, role, extractor.extract(file))));
    }

    @GetMapping("/candidates/{id}")
    public CandidateDto get(@PathVariable Long id) {
        return toDto(find(id));
    }

    @PatchMapping("/candidates/{id}/status")
    public CandidateDto updateStatus(@PathVariable Long id, @RequestBody StatusRequest body) {
        if (body.status() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status é obrigatório");
        Candidate c = find(id);
        c.setStatus(body.status());
        return toDto(repo.save(c));
    }

    /** Exclusão definitiva dos dados do candidato (direito de eliminação da LGPD). */
    @DeleteMapping("/candidates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        repo.delete(find(id));
    }

    @GetMapping("/metrics")
    public MetricsDto metrics() {
        List<Candidate> all = repo.findAll();
        int avg = (int) Math.round(all.stream().mapToInt(Candidate::getScore).average().orElse(0));
        long shortlisted = all.stream().filter(c -> c.getStatus() == Status.SHORTLIST).count();
        double days = Math.round(screening.averageDaysToFeedback() * 10) / 10.0;
        return new MetricsDto(all.size(), avg, shortlisted, days);
    }

    @PostMapping("/jobs/analysis")
    public Map<String, Integer> runAnalysis() { return Map.of("processed", screening.runAnalysis()); }

    @PostMapping("/jobs/feedback")
    public Map<String, Integer> runFeedback() { return Map.of("sent", screening.sendPendingFeedback()); }

    private Candidate newCandidate(String name, String email, String role, String resumeText) {
        Candidate c = new Candidate();
        c.setName(name.trim());
        c.setEmail(email.trim());
        c.setRole(role.trim());
        c.setResumeText(resumeText);
        return c;
    }

    private Candidate find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidato não encontrado"));
    }
}
