package com.pmsystem.presentation.controller;

import com.pmsystem.application.service.WorkingDaysService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

class CalendarControllerTest {

    @Mock
    private WorkingDaysService workingDaysService;

    @InjectMocks
    private CalendarController calendarController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getNonWorkingDays_ReturnsStringDates() {
        when(workingDaysService.getNonWorkingDays(2023)).thenReturn(List.of(LocalDate.of(2023, 1, 1)));

        ResponseEntity<List<String>> response = calendarController.getNonWorkingDays(2023);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly("2023-01-01");
    }

    @Test
    void getPublicHolidays_ReturnsSortedStringDates() {
        when(workingDaysService.getPublicHolidays(2023)).thenReturn(Set.of(LocalDate.of(2023, 1, 1)));

        ResponseEntity<List<String>> response = calendarController.getPublicHolidays(2023);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly("2023-01-01");
    }
}
