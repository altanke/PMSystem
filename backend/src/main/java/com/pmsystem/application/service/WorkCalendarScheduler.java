package com.pmsystem.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkCalendarScheduler {

    private static final LocalTime WORK_START   = LocalTime.of(9, 0);
    private static final LocalTime WORK_END     = LocalTime.of(18, 0);
    private static final double   HOURS_PER_DAY = 9.0;

    private final WorkingDaysService workingDaysService;

    public LocalDateTime offsetToDatetime(LocalDate projectStart, double hourOffset) {

        LocalDate firstDay = advanceToWorkingDay(projectStart,
                workingDaysService.getPublicHolidays(projectStart.getYear()));
        LocalDateTime origin = LocalDateTime.of(firstDay, WORK_START);

        log.debug("offsetToDatetime: projectStart={} firstWorkingDay={} offset={}h",
                projectStart, firstDay, hourOffset);

        return addWorkingHours(origin, hourOffset);
    }

    public LocalDateTime addWorkingHours(LocalDateTime from, double workingHours) {
        if (workingHours <= 0) {
            return alignToWorkingSlot(from);
        }

        Set<LocalDate> holidays = workingDaysService.getPublicHolidays(from.getYear());

        LocalDateTime cursor = alignToWorkingSlotWithHolidays(from, holidays);

        double remaining = workingHours;
        int safetyCounter = 0;
        final int MAX_ITERATIONS = 1000;

        while (remaining >= HOURS_PER_DAY && safetyCounter++ < MAX_ITERATIONS) {
            remaining -= HOURS_PER_DAY;

            LocalDate nextDate = cursor.toLocalDate().plusDays(1);

            if (nextDate.getYear() != cursor.toLocalDate().getYear()) {
                holidays = workingDaysService.getPublicHolidays(nextDate.getYear());
            }

            nextDate = advanceToWorkingDay(nextDate, holidays);
            cursor   = LocalDateTime.of(nextDate, WORK_START);

            log.debug("Day-jump: remaining={}h cursor={}", remaining, cursor);
        }

        if (safetyCounter >= MAX_ITERATIONS) {
            log.error("WorkCalendarScheduler safety limit reached — returning cursor as-is. remaining={}h", remaining);
            return cursor;
        }

        if (remaining > 0) {
            double hoursLeft = hoursUntilEndOfDay(cursor);

            if (remaining <= hoursLeft) {

                long secondsToAdd = (long) (remaining * 3600);
                cursor = cursor.plusSeconds(secondsToAdd);
            } else {

                remaining -= hoursLeft;
                LocalDate nextDate = cursor.toLocalDate().plusDays(1);

                if (nextDate.getYear() != cursor.toLocalDate().getYear()) {
                    holidays = workingDaysService.getPublicHolidays(nextDate.getYear());
                }

                nextDate = advanceToWorkingDay(nextDate, holidays);
                cursor   = LocalDateTime.of(nextDate, WORK_START);
                cursor   = cursor.plusSeconds((long) (remaining * 3600));
            }

            log.debug("Sub-day remainder applied: final cursor={}", cursor);
        }

        return cursor;
    }

    private LocalDate advanceToWorkingDay(LocalDate date, Set<LocalDate> holidays) {
        int guard = 0;
        while (!isWorkingDay(date, holidays) && guard++ < 14) {
            date = date.plusDays(1);
        }
        if (guard >= 14) {
            log.warn("advanceToWorkingDay: could not find a working day near {} — using {}", date, date);
        }
        return date;
    }

    private boolean isWorkingDay(LocalDate date, Set<LocalDate> holidays) {
        int dow = date.getDayOfWeek().getValue();
        if (dow >= 6) return false;
        return !holidays.contains(date);
    }

    private LocalDateTime alignToWorkingSlot(LocalDateTime dt) {
        Set<LocalDate> holidays = workingDaysService.getPublicHolidays(dt.toLocalDate().getYear());
        return alignToWorkingSlotWithHolidays(dt, holidays);
    }

    private LocalDateTime alignToWorkingSlotWithHolidays(LocalDateTime dt, Set<LocalDate> holidays) {
        LocalDate date = dt.toLocalDate();
        LocalTime time = dt.toLocalTime();

        if (!isWorkingDay(date, holidays)) {
            date = advanceToWorkingDay(date.plusDays(1), holidays);
            return LocalDateTime.of(date, WORK_START);
        }

        if (time.isBefore(WORK_START)) {
            return LocalDateTime.of(date, WORK_START);
        }

        if (!time.isBefore(WORK_END)) {
            date = advanceToWorkingDay(date.plusDays(1), holidays);
            return LocalDateTime.of(date, WORK_START);
        }

        return dt;
    }

    private double hoursUntilEndOfDay(LocalDateTime cursor) {
        long seconds = java.time.Duration.between(cursor.toLocalTime(), WORK_END).getSeconds();
        return Math.max(0.0, seconds / 3600.0);
    }
}
