package com.pmsystem.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class WorkingDaysService {

    private static final String HOLIDAYS_API =
            "https://date.nager.at/api/v3/PublicHolidays/{year}/BY";

    private final RestTemplate restTemplate;

    public WorkingDaysService() {
        this.restTemplate = new RestTemplate();
    }

    @Cacheable(value = "holidays", key = "#year")
    public Set<LocalDate> getPublicHolidays(int year) {
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    HOLIDAYS_API,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {},
                    year
            );
            List<Map<String, Object>> body = response.getBody();
            if (body == null) return Collections.emptySet();

            return body.stream()
                    .map(entry -> (String) entry.get("date"))
                    .filter(Objects::nonNull)
                    .map(LocalDate::parse)
                    .collect(Collectors.toSet());
        } catch (Exception e) {
            log.warn("Failed to fetch public holidays for year {}: {}. Returning empty set.", year, e.getMessage());
            return Collections.emptySet();
        }
    }

    public boolean isWorkingDay(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return false;
        }
        Set<LocalDate> holidays = getPublicHolidays(date.getYear());
        return !holidays.contains(date);
    }

    public LocalDate addWorkingDays(LocalDate start, int workingDays) {
        LocalDate result = start;
        int added = 0;
        while (added < workingDays) {
            result = result.plusDays(1);
            if (isWorkingDay(result)) {
                added++;
            }
        }
        return result;
    }

    public List<LocalDate> getNonWorkingDays(int year) {
        Set<LocalDate> holidays = getPublicHolidays(year);
        List<LocalDate> result = new ArrayList<>();
        LocalDate date = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        while (!date.isAfter(end)) {
            if (!isWorkingDay(date)) {
                result.add(date);
            }
            date = date.plusDays(1);
        }
        return result;
    }

    @org.springframework.cache.annotation.CacheEvict(value = "holidays", allEntries = true)
    public void clearCache() {

    }
}
