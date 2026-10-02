package com.pmsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class PmSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PmSystemApplication.class, args);
    }

}
