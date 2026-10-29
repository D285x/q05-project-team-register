package com.exam.app;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/team-members")
@CrossOrigin(origins = "*")
public class TeamMemberController {

    private final TeamMemberRepository repository;

    public TeamMemberController(TeamMemberRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TeamMember> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public TeamMember getOne(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamMember create(@Valid @RequestBody TeamMember record) {
        record.setId(null);
        return repository.save(record);
    }

    @PutMapping("/{id}")
    public TeamMember update(@PathVariable Long id, @Valid @RequestBody TeamMember updated) {
        TeamMember existing = getOne(id);
        existing.setRollNumber(updated.getRollNumber());
        existing.setStudentName(updated.getStudentName());
        existing.setTeamName(updated.getTeamName());
        existing.setProjectTitle(updated.getProjectTitle());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
        }
        repository.deleteById(id);
    }
}
