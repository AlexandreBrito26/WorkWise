package com.workwise.web;

import static com.workwise.web.Dtos.*;

import com.workwise.service.AssistantService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AssistantController {
    private final AssistantService assistant;

    public AssistantController(AssistantService assistant) { this.assistant = assistant; }

    @PostMapping("/assistant")
    public AssistantReply ask(@Valid @RequestBody AssistantRequest body) {
        return new AssistantReply(assistant.reply(body.message(), body.candidateId()));
    }
}
