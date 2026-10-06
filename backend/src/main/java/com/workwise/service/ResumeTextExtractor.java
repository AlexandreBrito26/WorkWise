package com.workwise.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** Extrai só o texto do PDF. O arquivo em si não é guardado (minimização de dados). */
@Service
public class ResumeTextExtractor {
    static final int MAX_PAGES = 15;
    static final int MAX_CHARS = 20_000;

    public String extract(MultipartFile file) {
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Não foi possível ler o arquivo");
        }
        // Confere o conteúdo real, não só o Content-Type enviado pelo cliente.
        if (bytes.length < 5 || !new String(bytes, 0, 5, StandardCharsets.ISO_8859_1).equals("%PDF-")) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Envie um arquivo PDF");
        }
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            if (doc.getNumberOfPages() > MAX_PAGES) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "PDF com páginas demais");
            }
            String text = new PDFTextStripper().getText(doc)
                    .replaceAll("[ \\t]+", " ").replaceAll("\\n{3,}", "\n\n").trim();
            if (text.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "PDF sem texto (digitalizado?)");
            }
            return text.length() > MAX_CHARS ? text.substring(0, MAX_CHARS) : text;
        } catch (InvalidPasswordException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "PDF protegido por senha");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "PDF inválido ou corrompido");
        }
    }
}
