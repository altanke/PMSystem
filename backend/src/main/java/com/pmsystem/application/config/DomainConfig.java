package com.pmsystem.application.config;

import com.pmsystem.domain.service.CPMService;
import com.pmsystem.domain.service.cpm.BasicCPMStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainConfig {

    @Bean
    public CPMService cpmService() {
        return new CPMService(new BasicCPMStrategy());
    }
}
