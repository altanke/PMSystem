package com.pmsystem.presentation.controller;

import com.pmsystem.application.service.WorkingDaysService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar", description = "Working calendar endpoints (public holidays)")
public class CalendarController {

    private final WorkingDaysService workingDaysService;

    @GetMapping("/holidays")
    @Operation(summary = "Get all non-working days for a given year")
    public ResponseEntity<List<String>> getNonWorkingDays(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") int year) {
        List<String> nonWorkingDays = workingDaysService.getNonWorkingDays(year)
                .stream()
                .map(LocalDate::toString)
                .collect(Collectors.toList());
        return ResponseEntity.ok(nonWorkingDays);
    }

    @GetMapping("/public-holidays")
    @Operation(summary = "Get only public holidays for a given year")
    public ResponseEntity<List<String>> getPublicHolidays(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") int year) {
        List<String> holidays = workingDaysService.getPublicHolidays(year)
                .stream()
                .map(LocalDate::toString)
                .sorted()
                .collect(Collectors.toList());
        return ResponseEntity.ok(holidays);
    }
}
